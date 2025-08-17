import { NextResponse } from 'next/server';
import { Prisma, PrismaClient } from '../../../generated/prisma';
import { uploadFileToGCS, deleteFileFromGCS } from '../../../lib/gcs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const searchTerm = searchParams.get('searchTerm');
    const searchBy = searchParams.get('searchBy');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const skip = (page - 1) * limit;
    const whereClause: Prisma.MaterialWhereInput = { category };

    if (searchTerm && searchBy) {
      if (searchBy === 'filename') {
        whereClause.filename = { contains: searchTerm };
      } else if (searchBy === 'uploader') {
        whereClause.uploader = { contains: searchTerm };
      }
    }

    const [materials, totalCount] = await prisma.$transaction([
      prisma.material.findMany({
        where: whereClause,
        orderBy: {
          uploadedAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.material.count({ where: whereClause }),
    ]);

    return NextResponse.json({ data: materials, totalCount });

  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json({ data: [], totalCount: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const uploader = formData.get('uploader') as string;

    if (!file || !category || !uploader) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 파일 형식 검증
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: '지원하지 않는 파일 형식입니다. PDF, PPT, DOC, XLS, 이미지, 동영상 파일만 업로드 가능합니다.' 
      }, { status: 400 });
    }

    // 파일 크기 제한 (50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: '파일 크기가 너무 큽니다. 50MB 이하의 파일만 업로드 가능합니다.' 
      }, { status: 400 });
    }

    // Google Cloud Storage에 파일 업로드
    console.log(`Uploading file to GCS: ${file.name}, Size: ${file.size} bytes`);
    
    try {
      // GCS에 파일 업로드
      const gcsUrl = await uploadFileToGCS(file, category);
      
      // 이미지 파일의 경우 썸네일로 GCS URL 사용
      let thumbnailPath = null;
      if (file.type.startsWith('image/')) {
        thumbnailPath = gcsUrl; // GCS URL을 썸네일로 사용
      }

      const newMaterial = await prisma.material.create({
        data: {
          filename: file.name, // 원본 파일명 저장
          filePath: gcsUrl, // GCS 공개 URL 저장
          uploadedAt: new Date(),
          uploader,
          category,
          thumbnailPath,
        },
      });

      console.log(`File uploaded successfully: ${gcsUrl}`);
      return NextResponse.json(newMaterial, { status: 201 });
    } catch (gcsError) {
      console.error('GCS upload failed:', gcsError);
      return NextResponse.json({ 
        error: 'Google Cloud Storage 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error uploading material:', error);
    return NextResponse.json({ error: 'Failed to upload material' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'An array of material IDs is required' }, { status: 400 });
    }

    const materialsToDelete = await prisma.material.findMany({
      where: { id: { in: ids } },
    });

    if (materialsToDelete.length !== ids.length) {
        console.warn('Some materials to delete were not found. Deleting the ones that were found.');
    }

    // GCS에서 파일 삭제
    for (const material of materialsToDelete) {
      try {
        // GCS URL인 경우에만 삭제 시도
        if (material.filePath.startsWith('https://storage.googleapis.com/')) {
          await deleteFileFromGCS(material.filePath);
          console.log(`Deleted file from GCS: ${material.filePath}`);
        }
      } catch (fileError) {
        // Log the error but continue, as the DB entry is the source of truth
        console.error(`Failed to delete file from GCS: ${material.filePath}`, fileError);
      }
    }

    const deleteResult = await prisma.material.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ message: `${deleteResult.count} materials deleted successfully.` });

  } catch (error) {
    console.error('Error deleting materials:', error);
    return NextResponse.json({ error: 'Failed to delete materials' }, { status: 500 });
  }
}

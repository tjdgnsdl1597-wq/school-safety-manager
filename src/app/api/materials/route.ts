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
    const limit = parseInt(searchParams.get('limit') || '15', 10);

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const skip = (page - 1) * limit;
    const whereClause: Prisma.MaterialWhereInput = { category };

    if (searchTerm && searchBy) {
      if (searchBy === 'title') {
        whereClause.title = { contains: searchTerm };
      } else if (searchBy === 'content') {
        whereClause.content = { contains: searchTerm };
      } else if (searchBy === 'filename') {
        whereClause.attachments = {
          some: {
            filename: { contains: searchTerm }
          }
        };
      }
    }

    const [materials, totalCount] = await prisma.$transaction([
      prisma.material.findMany({
        where: whereClause,
        include: {
          attachments: {
            orderBy: {
              uploadOrder: 'asc'
            }
          }
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        skip: skip,
        take: limit,
      }),
      prisma.material.count({ where: whereClause }),
    ]);

    const response = NextResponse.json({ data: materials, totalCount });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;

  } catch (error) {
    console.error('Error fetching materials:', error);
    const response = NextResponse.json({ data: [], totalCount: 0 });
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
}

export async function POST(request: Request) {
  try {
    console.log('API POST /api/materials called');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const uploader = formData.get('uploader') as string;

    console.log('FormData received:', { 
      fileCount: files.length,
      title,
      hasContent: !!content,
      category,
      uploader,
      fileSizes: files.map(f => f?.size),
      fileNames: files.map(f => f?.name)
    });

    if (!title || !category) {
      console.error('Missing required fields:', { title, category });
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // 파일 개수 검증 (최대 5개)
    if (files.length > 5) {
      return NextResponse.json({ error: '최대 5개의 파일만 업로드할 수 있습니다.' }, { status: 400 });
    }

    // 파일 크기 검증 (개수에 따른 개별 파일 크기 제한)
    const totalSize = files.reduce((sum, file) => sum + (file?.size || 0), 0);
    const maxTotalSize = 50 * 1024 * 1024; // 50MB
    const maxIndividualSize = Math.floor(maxTotalSize / files.length); // 개수에 따른 개별 파일 크기
    
    console.log('File size validation:', {
      fileCount: files.length,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      maxTotalSizeMB: 50,
      maxIndividualSizeMB: (maxIndividualSize / (1024 * 1024)).toFixed(1),
      fileSizes: files.map(f => ({
        name: f?.name,
        sizeBytes: f?.size,
        sizeMB: f?.size ? (f.size / (1024 * 1024)).toFixed(2) : 0
      }))
    });
    
    // 총 용량 초과 검사
    if (totalSize > maxTotalSize) {
      return NextResponse.json({ 
        error: `파일이 커서 못넣습니다. 전체 파일 크기가 50MB를 초과합니다. 현재: ${(totalSize / (1024 * 1024)).toFixed(2)}MB` 
      }, { status: 413 });
    }
    
    // 개별 파일 크기 검사
    const oversizedFile = files.find(file => file && file.size > maxIndividualSize);
    if (oversizedFile) {
      const oversizedFileMB = (oversizedFile.size / (1024 * 1024)).toFixed(2);
      const maxIndividualMB = (maxIndividualSize / (1024 * 1024)).toFixed(1);
      return NextResponse.json({ 
        error: `파일이 커서 못넣습니다. "${oversizedFile.name}" (${oversizedFileMB}MB)가 개별 파일 크기 제한을 초과합니다. ${files.length}개 파일 업로드 시 각 파일은 최대 ${maxIndividualMB}MB까지 가능합니다.` 
      }, { status: 413 });
    }

    // 파일들이 있는 경우에만 업로드 처리
    const attachments = [];
    if (files.length > 0 && files[0].size > 0) {
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
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/vnd.rar',
        'application/x-7z-compressed'
      ];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json({ 
            error: `지원하지 않는 파일 형식입니다: ${file.name}. PDF, PPT, DOC, XLS, 이미지, 동영상, 압축 파일만 업로드 가능합니다.` 
          }, { status: 400 });
        }

        console.log(`Uploading file ${i + 1} to GCS: ${file.name}, Size: ${file.size} bytes`);
        
        try {
          // GCS에 파일 업로드
          const gcsUrl = await uploadFileToGCS(file, category);
          
          // 썸네일 경로 (이미지인 경우)
          const thumbnailPath = file.type.startsWith('image/') ? gcsUrl : null;
          
          attachments.push({
            filename: file.name,
            filePath: gcsUrl,
            fileSize: file.size,
            mimeType: file.type,
            thumbnailPath,
            uploadOrder: i + 1
          });
          
          console.log(`File ${i + 1} uploaded successfully: ${gcsUrl}`);
        } catch (uploadError) {
          console.error(`Local upload failed for file ${i + 1}:`, uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          
          return NextResponse.json({ 
            error: `파일 업로드 실패 (${file.name}): ${errorMessage}`,
            details: process.env.NODE_ENV === 'development' ? uploadError : undefined
          }, { status: 500 });
        }
      }
    }

    // 데이터베이스에 게시글 저장
    try {
      const newMaterial = await prisma.material.create({
        data: {
          title,
          content: content || null,
          uploadedAt: new Date(),
          uploader: uploader || '알 수 없는 사용자', // 폼에서 받은 uploader 사용
          category,
          attachments: {
            create: attachments
          }
        },
        include: {
          attachments: {
            orderBy: {
              uploadOrder: 'asc'
            }
          }
        }
      });

      console.log(`Post created successfully: ${newMaterial.id}`);
      return NextResponse.json(newMaterial, { status: 201 });
    } catch (dbError) {
      console.error('Database save failed:', dbError);
      return NextResponse.json({ 
        error: '데이터베이스 저장에 실패했습니다.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error uploading material:', error);
    return NextResponse.json({ error: 'Failed to upload material' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    console.log('API PUT /api/materials called');
    
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const files = formData.getAll('files') as File[];

    console.log('FormData received for update:', { 
      id,
      title,
      hasContent: !!content,
      category,
      fileCount: files.length,
      fileSizes: files.map(f => f?.size),
      fileNames: files.map(f => f?.name)
    });

    if (!id || !title || !category) {
      console.error('Missing required fields:', { id, title, category });
      return NextResponse.json({ error: 'ID, title and category are required' }, { status: 400 });
    }

    // 파일 개수 검증 (최대 5개)
    if (files.length > 5) {
      return NextResponse.json({ error: '최대 5개의 파일만 업로드할 수 있습니다.' }, { status: 400 });
    }

    // 파일 크기 검증 (개수에 따른 개별 파일 크기 제한)
    const totalSize = files.reduce((sum, file) => sum + (file?.size || 0), 0);
    const maxTotalSize = 50 * 1024 * 1024; // 50MB
    const maxIndividualSize = Math.floor(maxTotalSize / files.length); // 개수에 따른 개별 파일 크기
    
    console.log('File size validation:', {
      fileCount: files.length,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      maxTotalSizeMB: 50,
      maxIndividualSizeMB: (maxIndividualSize / (1024 * 1024)).toFixed(1),
      fileSizes: files.map(f => ({
        name: f?.name,
        sizeBytes: f?.size,
        sizeMB: f?.size ? (f.size / (1024 * 1024)).toFixed(2) : 0
      }))
    });
    
    // 총 용량 초과 검사
    if (totalSize > maxTotalSize) {
      return NextResponse.json({ 
        error: `파일이 커서 못넣습니다. 전체 파일 크기가 50MB를 초과합니다. 현재: ${(totalSize / (1024 * 1024)).toFixed(2)}MB` 
      }, { status: 413 });
    }
    
    // 개별 파일 크기 검사
    const oversizedFile = files.find(file => file && file.size > maxIndividualSize);
    if (oversizedFile) {
      const oversizedFileMB = (oversizedFile.size / (1024 * 1024)).toFixed(2);
      const maxIndividualMB = (maxIndividualSize / (1024 * 1024)).toFixed(1);
      return NextResponse.json({ 
        error: `파일이 커서 못넣습니다. "${oversizedFile.name}" (${oversizedFileMB}MB)가 개별 파일 크기 제한을 초과합니다. ${files.length}개 파일 업로드 시 각 파일은 최대 ${maxIndividualMB}MB까지 가능합니다.` 
      }, { status: 413 });
    }

    // 기존 게시글 조회
    const existingMaterial = await prisma.material.findUnique({
      where: { id },
      include: {
        attachments: true
      }
    });

    if (!existingMaterial) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // 새 파일들이 업로드된 경우
    const newAttachments = [];
    if (files.length > 0 && files[0].size > 0) {
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
        'text/plain',
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/vnd.rar',
        'application/x-7z-compressed'
      ];

      // 기존 파일들 삭제
      for (const attachment of existingMaterial.attachments) {
        try {
          await deleteFileFromGCS(attachment.filePath);
          console.log(`Deleted old file from GCS: ${attachment.filePath}`);
        } catch (deleteError) {
          console.warn('Failed to delete old file from GCS:', deleteError);
        }
      }

      // 새 파일들 업로드
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json({ 
            error: `지원하지 않는 파일 형식입니다: ${file.name}. PDF, PPT, DOC, XLS, 이미지, 동영상, 압축 파일만 업로드 가능합니다.` 
          }, { status: 400 });
        }

        try {
          // GCS에 파일 업로드
          const gcsUrl = await uploadFileToGCS(file, category);
          
          // 썸네일 경로 (이미지인 경우)
          const thumbnailPath = file.type.startsWith('image/') ? gcsUrl : null;
          
          newAttachments.push({
            filename: file.name,
            filePath: gcsUrl,
            fileSize: file.size,
            mimeType: file.type,
            thumbnailPath,
            uploadOrder: i + 1
          });
          
          console.log(`File ${i + 1} uploaded successfully: ${gcsUrl}`);
        } catch (uploadError) {
          console.error(`Local upload failed for file ${i + 1}:`, uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          return NextResponse.json({
            error: `파일 업로드 실패 (${file.name}): ${errorMessage}`,
            details: process.env.NODE_ENV === 'development' ? uploadError : undefined
          }, { status: 500 });
        }
      }
    }

    // 데이터베이스 업데이트
    try {
      const updatedMaterial = await prisma.material.update({
        where: { id },
        data: {
          title,
          content: content || null,
          attachments: {
            deleteMany: {}, // 기존 첨부파일들 모두 삭제
            create: newAttachments // 새 첨부파일들 생성
          }
        },
        include: {
          attachments: {
            orderBy: {
              uploadOrder: 'asc'
            }
          }
        }
      });

      console.log(`Post updated successfully: ${updatedMaterial.id}`);
      return NextResponse.json(updatedMaterial, { status: 200 });
    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return NextResponse.json({ 
        error: '데이터베이스 업데이트에 실패했습니다.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating material:', error);
    return NextResponse.json({ error: 'Failed to update material' }, { status: 500 });
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
      include: {
        attachments: true
      }
    });

    if (materialsToDelete.length !== ids.length) {
        console.warn('Some materials to delete were not found. Deleting the ones that were found.');
    }

    // GCS에서 첨부파일들 삭제
    for (const material of materialsToDelete) {
      for (const attachment of material.attachments) {
        try {
          await deleteFileFromGCS(attachment.filePath);
          console.log(`Deleted file from GCS: ${attachment.filePath}`);
        } catch (fileError) {
          // Log the error but continue, as the DB entry is the source of truth
          console.error(`Failed to delete file from GCS: ${attachment.filePath}`, fileError);
        }
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

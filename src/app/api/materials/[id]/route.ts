import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { deleteFileFromGCS } from '../../../../lib/gcs';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        attachments: {
          orderBy: {
            uploadOrder: 'asc'
          }
        }
      }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    return NextResponse.json(material);
  } catch (error) {
    console.error('Error fetching material:', error);
    return NextResponse.json({ error: 'Failed to fetch material' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    console.log('Starting deletion for material ID:', id);

    // 먼저 Material과 관련된 모든 첨부파일을 가져옵니다
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        attachments: true
      }
    });

    if (!material) {
      console.log('Material not found with ID:', id);
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    console.log('Found material with', material.attachments.length, 'attachments');

    // GCS에서 모든 첨부파일 삭제
    const deletePromises = material.attachments.map(async (attachment) => {
      try {
        console.log('Deleting file from GCS:', attachment.filePath);
        await deleteFileFromGCS(attachment.filePath);
        console.log('Successfully deleted from GCS:', attachment.filePath);
      } catch (error) {
        console.error('Failed to delete from GCS:', attachment.filePath, error);
        // GCS 삭제 실패해도 DB 삭제는 계속 진행
      }
    });

    await Promise.all(deletePromises);

    // 데이터베이스에서 Material 삭제 (CASCADE로 첨부파일도 함께 삭제됨)
    console.log('Deleting material from database...');
    await prisma.material.delete({
      where: { id }
    });

    console.log('Successfully deleted material:', id);
    return NextResponse.json({ message: 'Material deleted successfully' });

  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json({ 
      error: 'Failed to delete material',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
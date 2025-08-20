import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { title, content, category, uploader, attachments } = await request.json();

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // 데이터베이스에 게시글 저장
    const newMaterial = await prisma.material.create({
      data: {
        title,
        content: content || null,
        uploadedAt: new Date(),
        uploader: uploader || '알 수 없는 사용자',
        category,
        attachments: {
          create: attachments.map((attachment: any, index: number) => ({
            filename: attachment.filename,
            filePath: attachment.publicUrl,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            thumbnailPath: attachment.mimeType.startsWith('image/') ? attachment.publicUrl : null,
            uploadOrder: index + 1
          }))
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

    console.log(`Material created successfully via metadata API: ${newMaterial.id}`);
    return NextResponse.json(newMaterial, { status: 201 });

  } catch (error) {
    console.error('Error saving material metadata:', error);
    return NextResponse.json({ error: 'Failed to save material metadata' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';
import { Storage } from '@google-cloud/storage';

const prisma = new PrismaClient();

// Google Cloud Storage 클라이언트 초기화
const createStorageClient = () => {
  const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
    : undefined;
    
  return new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    ...(credentials ? { credentials } : {})
  });
};

export async function POST(request: Request) {
  try {
    const { title, content, category, uploader, attachments } = await request.json();

    if (!title || !category) {
      return NextResponse.json({ error: 'Title and category are required' }, { status: 400 });
    }

    // GCS 파일들을 공개로 설정
    if (attachments && attachments.length > 0) {
      try {
        const storage = createStorageClient();
        const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;
        const bucket = storage.bucket(bucketName);

        for (const attachment of attachments) {
          // publicUrl에서 버킷 내 파일 경로 추출
          // attachment.publicUrl = "https://storage.googleapis.com/bucket-name/path/file.ext"
          // attachment.filePath = "path/file.ext" (실제 버킷 내 경로)
          const bucketPath = attachment.filePath || attachment.publicUrl.replace(`https://storage.googleapis.com/${bucketName}/`, '');
          console.log(`공개 설정할 파일 경로: ${bucketPath}`);
          const file = bucket.file(bucketPath);

          try {
            await file.makePublic();
            console.log(`파일 공개 설정 완료: ${bucketPath}`);
          } catch (publicError) {
            console.warn(`파일 공개 설정 실패, ACL 방식 시도: ${bucketPath}`, publicError);
            try {
              await file.acl.add({
                entity: 'allUsers',
                role: 'READER'
              });
              console.log(`파일 ACL 공개 설정 완료: ${bucketPath}`);
            } catch (aclError) {
              console.error(`파일 공개 설정 완전 실패: ${bucketPath}`, aclError);
            }
          }
        }
      } catch (storageError) {
        console.error('GCS 공개 설정 중 오류:', storageError);
        // 공개 설정이 실패해도 메타데이터는 저장
      }
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
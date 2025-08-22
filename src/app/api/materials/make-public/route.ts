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

export async function POST() {
  try {
    console.log('기존 파일들 공개 설정 시작...');
    
    // 모든 첨부파일 가져오기
    const attachments = await prisma.materialAttachment.findMany();
    console.log(`총 ${attachments.length}개 파일 발견`);
    
    if (attachments.length === 0) {
      return NextResponse.json({ message: '공개 설정할 파일이 없습니다.' });
    }

    const storage = createStorageClient();
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;
    const bucket = storage.bucket(bucketName);
    
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const attachment of attachments) {
      try {
        // URL에서 버킷 내 경로 추출
        const bucketPath = attachment.filePath.replace(`https://storage.googleapis.com/${bucketName}/`, '');
        console.log(`공개 설정 시도: ${bucketPath}`);
        
        const file = bucket.file(bucketPath);
        
        try {
          await file.makePublic();
          console.log(`✓ makePublic 성공: ${bucketPath}`);
          successCount++;
        } catch (publicError) {
          console.warn(`makePublic 실패, ACL 시도: ${bucketPath}`, publicError);
          try {
            await file.acl.add({
              entity: 'allUsers',
              role: 'READER'
            });
            console.log(`✓ ACL 공개 설정 성공: ${bucketPath}`);
            successCount++;
          } catch (aclError) {
            console.error(`✗ 완전 실패: ${bucketPath}`, aclError);
            errors.push(`${bucketPath}: ${aclError instanceof Error ? aclError.message : 'Unknown error'}`);
            failCount++;
          }
        }
      } catch (error) {
        console.error(`파일 처리 중 오류: ${attachment.filePath}`, error);
        errors.push(`${attachment.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        failCount++;
      }
    }

    return NextResponse.json({
      message: `파일 공개 설정 완료`,
      total: attachments.length,
      success: successCount,
      failed: failCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('기존 파일 공개 설정 중 오류:', error);
    return NextResponse.json({ 
      error: 'Failed to make files public',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Google Cloud Storage 클라이언트 초기화
const getCredentials = () => {
  console.log('getCredentials 호출됨');
  
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    try {
      const credentialsStr = process.env.GOOGLE_CLOUD_CREDENTIALS;
      console.log('GOOGLE_CLOUD_CREDENTIALS 환경변수 존재:', credentialsStr.substring(0, 50) + '...');
      
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(credentialsStr);
      console.log('Base64 형식인가?', isBase64);
      
      let parsedCredentials;
      
      if (isBase64) {
        const decodedStr = Buffer.from(credentialsStr, 'base64').toString('utf-8');
        parsedCredentials = JSON.parse(decodedStr);
        console.log('Base64 디코딩 후 파싱 완료');
      } else {
        parsedCredentials = JSON.parse(credentialsStr);
        console.log('JSON 직접 파싱 완료');
      }
      
      return { credentials: parsedCredentials };
    } catch (error) {
      console.error('Error parsing GOOGLE_CLOUD_CREDENTIALS:', error);
      throw error;
    }
  }
  
  if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    console.log('키 파일 사용:', process.env.GOOGLE_CLOUD_KEY_FILE);
    return { keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE };
  }
  
  throw new Error('Google Cloud credentials not found');
};

const createStorageClient = () => {
  console.log('createStorageClient 호출됨');
  const credentials = getCredentials();
  console.log('자격증명 가져오기 완료');
  
  return new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    ...credentials,
  });
};

export async function POST(request: Request) {
  try {
    console.log('Signed URL API 호출됨');
    
    const { filename, contentType, category } = await request.json();
    console.log('요청 데이터:', { filename, contentType, category });

    if (!filename || !contentType || !category) {
      console.log('필수 필드 누락');
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
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
    ];

    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // GCS 파일 경로 생성
    const timestamp = Date.now();
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${category}/${timestamp}_${safeFilename}`;
    console.log('파일 경로 생성:', filePath);

    // Signed URL 생성 (업로드용)
    console.log('Storage 클라이언트 생성 중...');
    const storage = createStorageClient();
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);
    console.log('버킷과 파일 객체 생성 완료');

    console.log('Signed URL 생성 시도...');
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15분 후 만료
      contentType: contentType,
    });
    console.log('Signed URL 생성 성공');

    // 공개 URL 생성
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

    return NextResponse.json({
      signedUrl,
      publicUrl,
      filePath,
    });

  } catch (error) {
    console.error('Signed URL 생성 오류:', error);
    console.error('오류 상세:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json({ 
      error: 'Failed to generate signed URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
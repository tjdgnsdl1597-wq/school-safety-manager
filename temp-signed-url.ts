import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Google Cloud Storage 클라이언트 초기화
const getCredentials = () => {
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    try {
      const credentialsStr = process.env.GOOGLE_CLOUD_CREDENTIALS;
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(credentialsStr);
      
      let parsedCredentials;
      
      if (isBase64) {
        const decodedStr = Buffer.from(credentialsStr, 'base64').toString('utf-8');
        parsedCredentials = JSON.parse(decodedStr);
      } else {
        parsedCredentials = JSON.parse(credentialsStr);
      }
      
      return parsedCredentials;
    } catch (error) {
      console.error('Error parsing GOOGLE_CLOUD_CREDENTIALS:', error);
      throw error;
    }
  }
  
  if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    return { keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE };
  }
  
  throw new Error('Google Cloud credentials not found');
};

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  ...getCredentials(),
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME!;

export async function POST(request: Request) {
  try {
    const { filename, contentType, category } = await request.json();

    if (!filename || !contentType || !category) {
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

    // Signed URL 생성 (업로드용)
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15분 후 만료
      contentType: contentType,
    });

    // 공개 URL 생성
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

    return NextResponse.json({
      signedUrl,
      publicUrl,
      filePath,
    });

  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}
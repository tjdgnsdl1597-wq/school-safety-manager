import { Storage } from '@google-cloud/storage';

// Google Cloud Storage 클라이언트 초기화
const getCredentials = () => {
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
      console.log('GCS credentials parsed successfully, project_id:', credentials.project_id);
      return credentials;
    } catch (error) {
      console.error('Failed to parse GOOGLE_CLOUD_CREDENTIALS:', error);
      console.error('GOOGLE_CLOUD_CREDENTIALS length:', process.env.GOOGLE_CLOUD_CREDENTIALS?.length);
      return undefined;
    }
  }
  console.log('No GOOGLE_CLOUD_CREDENTIALS found, using keyFilename');
  return undefined;
};

const credentials = getCredentials();
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE, // 로컬 개발용
  // Vercel 환경에서는 서비스 계정 키를 JSON 문자열로 설정
  credentials: credentials,
});

console.log('GCS Storage initialized with:', {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  hasKeyFile: !!process.env.GOOGLE_CLOUD_KEY_FILE,
  hasCredentials: !!credentials,
  bucketName: process.env.GOOGLE_CLOUD_BUCKET_NAME
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'school-safety-manager';
const bucket = storage.bucket(bucketName);

/**
 * 파일을 Google Cloud Storage에 업로드
 * @param file - 업로드할 파일 (File 객체)
 * @param category - 파일 카테고리 ('교육자료' | '산업재해')
 * @returns 업로드된 파일의 public URL
 */
export async function uploadFileToGCS(file: File, category: string): Promise<string> {
  try {
    console.log('Starting GCS upload process...');
    
    // 파일명 생성 (타임스탬프 + 카테고리 + 원본파일명)
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    const fileName = `${category}/${timestamp}_${safeFilename}`;
    
    console.log('Generated filename:', fileName);
    
    // Buffer로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer, size:', buffer.length);
    
    // GCS 파일 객체 생성
    const gcsFile = bucket.file(fileName);
    console.log('GCS file object created');
    
    // 파일 업로드
    await gcsFile.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          category: category,
        },
      },
      resumable: false, // 작은 파일은 resumable upload 비활성화
    });
    
    console.log('File saved, now making it public...');
    
    // 파일을 공개로 설정
    try {
      await gcsFile.makePublic();
      console.log('File made public successfully');
    } catch (publicError) {
      console.warn('Failed to make file public, trying alternative approach:', publicError);
      // 대안: ACL 설정
      try {
        await gcsFile.acl.add({
          entity: 'allUsers',
          role: 'READER'
        });
        console.log('File made public via ACL');
      } catch (aclError) {
        console.error('Failed to set ACL:', aclError);
        // 공개 설정 실패해도 업로드는 성공으로 처리
      }
    }
    
    console.log('File saved to GCS successfully');
    
    // 공개 URL 반환
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    console.log('Generated public URL:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('Error uploading file to GCS:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: (error as any)?.code,
      errors: (error as any)?.errors,
      response: (error as any)?.response?.data
    });
    
    // 더 구체적인 에러 메시지를 전달
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`GCS 업로드 실패: ${errorMessage}`);
  }
}

/**
 * Google Cloud Storage에서 파일 삭제
 * @param filePath - 삭제할 파일의 경로 (버킷 내 경로)
 */
export async function deleteFileFromGCS(filePath: string): Promise<void> {
  try {
    // GCS URL에서 파일 경로 추출
    const fileName = filePath.replace(`https://storage.googleapis.com/${bucketName}/`, '');
    
    const gcsFile = bucket.file(fileName);
    await gcsFile.delete();
    
    console.log(`File ${fileName} deleted from GCS`);
  } catch (error) {
    console.error('Error deleting file from GCS:', error);
    throw new Error('파일 삭제에 실패했습니다.');
  }
}

/**
 * 파일이 이미지인지 확인
 * @param mimeType - 파일의 MIME 타입
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형태로 변환
 * @param bytes - 바이트 단위 파일 크기
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
import { Storage, StorageOptions } from '@google-cloud/storage';

// Google Cloud Storage 클라이언트 초기화
const getCredentials = () => {
  if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
    try {
      const credentialsStr = process.env.GOOGLE_CLOUD_CREDENTIALS;
      console.log('GOOGLE_CLOUD_CREDENTIALS found, length:', credentialsStr.length);
      console.log('First 50 chars:', credentialsStr.substring(0, 50));
      
      // Base64로 인코딩되어 있는지 확인 (Base64는 알파벳+숫자+/+=만 포함)
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(credentialsStr);
      console.log('Is Base64 format:', isBase64);
      
      let parsedCredentials;
      
      if (isBase64) {
        // Base64 디코딩
        console.log('Attempting Base64 decode...');
        const decodedStr = Buffer.from(credentialsStr, 'base64').toString('utf-8');
        console.log('Base64 decoded successfully, parsing JSON...');
        parsedCredentials = JSON.parse(decodedStr);
        console.log('Base64 decoded credentials parsed successfully');
      } else {
        // 직접 JSON 파싱 시도
        console.log('Attempting direct JSON parse...');
        
        // escape 문자들을 안전하게 처리
        const processedStr = credentialsStr
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r') 
          .replace(/\\t/g, '\t')
          .replace(/\\\\/g, '\\')
          .trim();
          
        parsedCredentials = JSON.parse(processedStr);
        console.log('Direct JSON parsing successful');
      }
      
      console.log('Credential keys:', Object.keys(parsedCredentials));
      console.log('project_id:', parsedCredentials.project_id);
      console.log('client_email:', parsedCredentials.client_email);
      
      return parsedCredentials;
      
    } catch (error) {
      console.error('Failed to parse GOOGLE_CLOUD_CREDENTIALS:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return undefined;
    }
  }
  console.log('No GOOGLE_CLOUD_CREDENTIALS found, using keyFilename');
  return undefined;
};

// Storage 클라이언트를 동적으로 생성하는 함수
function createStorageClient(): Storage {
  const credentials = getCredentials();
  
  // Storage 클라이언트 설정
  const storageConfig: StorageOptions = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  };

  // 로컬 개발 환경
  if (process.env.GOOGLE_CLOUD_KEY_FILE) {
    storageConfig.keyFilename = process.env.GOOGLE_CLOUD_KEY_FILE;
    console.log('Using keyFilename for GCS authentication');
  } 
  // Vercel 환경
  else if (credentials) {
    storageConfig.credentials = credentials;
    storageConfig.projectId = credentials.project_id; // 인증 정보에서 프로젝트 ID 사용
    console.log('Using credentials object for GCS authentication');
  } else {
    console.error('No valid GCS authentication method found');
  }

  console.log('Storage config:', {
    hasProjectId: !!storageConfig.projectId,
    hasKeyFilename: !!storageConfig.keyFilename,
    hasCredentials: !!storageConfig.credentials,
    projectId: storageConfig.projectId
  });

  return new Storage(storageConfig);
}

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'school-safety-manager';

/**
 * 파일을 Google Cloud Storage에 업로드
 * @param file - 업로드할 파일 (File 객체)
 * @param category - 파일 카테고리 ('교육자료' | '산업재해')
 * @returns 업로드된 파일의 public URL
 */
export async function uploadFileToGCS(file: File, category: string): Promise<string> {
  try {
    console.log('Starting GCS upload process...');
    
    // Storage 클라이언트 생성
    const storage = createStorageClient();
    const bucket = storage.bucket(bucketName);
    console.log('Storage client and bucket created');
    
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
      code: (error as Error & { code?: string })?.code,
      errors: (error as Error & { errors?: unknown })?.errors,
      response: (error as Error & { response?: { data?: unknown } })?.response?.data
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
    // Storage 클라이언트 생성
    const storage = createStorageClient();
    const bucket = storage.bucket(bucketName);
    
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
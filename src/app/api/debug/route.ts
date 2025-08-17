import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 환경 변수 확인
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      hasGoogleCloudProjectId: !!process.env.GOOGLE_CLOUD_PROJECT_ID,
      hasGoogleCloudBucketName: !!process.env.GOOGLE_CLOUD_BUCKET_NAME,
      hasGoogleCloudCredentials: !!process.env.GOOGLE_CLOUD_CREDENTIALS,
      hasGoogleCloudKeyFile: !!process.env.GOOGLE_CLOUD_KEY_FILE,
      googleCloudProjectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      googleCloudBucketName: process.env.GOOGLE_CLOUD_BUCKET_NAME,
      credentialsLength: process.env.GOOGLE_CLOUD_CREDENTIALS?.length || 0,
    };

    // GCS 라이브러리 로드 테스트
    let gcsTest = 'not_tested';
    try {
      const { Storage } = await import('@google-cloud/storage');
      gcsTest = 'import_success';
      
      // GCS 클라이언트 초기화 테스트
      let credentials;
      if (process.env.GOOGLE_CLOUD_CREDENTIALS) {
        try {
          credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS);
          gcsTest = 'credentials_parsed';
        } catch (parseError) {
          gcsTest = `credentials_parse_error: ${parseError}`;
        }
      }
      
      const storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
        credentials: credentials,
      });
      
      gcsTest = 'storage_client_created';
      
      // 버킷 접근 테스트
      const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || 'school-safety-manager';
      const bucket = storage.bucket(bucketName);
      
      // 버킷 존재 확인
      const [exists] = await bucket.exists();
      gcsTest = `bucket_exists: ${exists}`;
      
    } catch (gcsError) {
      gcsTest = `gcs_error: ${gcsError instanceof Error ? gcsError.message : 'unknown_error'}`;
    }

    return NextResponse.json({
      status: 'debug_info',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      gcsTest: gcsTest,
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
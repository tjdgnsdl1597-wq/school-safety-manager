import path from 'path';
import fs from 'fs';

// 로컬 파일 저장을 위한 디렉토리
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// 업로드 디렉토리가 없으면 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * 파일을 로컬 디스크에 저장
 * @param file - 업로드할 파일 (File 객체)
 * @param category - 파일 카테고리 ('교육자료' | '산업재해')
 * @returns 저장된 파일의 public URL
 */
export async function uploadFileToLocal(file: File, category: string): Promise<string> {
  try {
    console.log('Starting local file upload process...');
    
    // 카테고리별 디렉토리 생성
    const categoryDir = path.join(UPLOAD_DIR, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    // 파일명 생성 (타임스탬프 + 카테고리 + 원본파일명)
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9가-힣._-]/g, '_');
    const fileName = `${timestamp}_${safeFilename}`;
    const filePath = path.join(categoryDir, fileName);
    
    console.log('Generated filename:', fileName);
    console.log('File path:', filePath);
    
    // Buffer로 변환
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log('File converted to buffer, size:', buffer.length);
    
    // 로컬 디스크에 파일 저장
    fs.writeFileSync(filePath, buffer);
    console.log('File saved to local disk successfully');
    
    // 공개 URL 반환 (Next.js의 public 폴더 기준)
    const publicUrl = `/uploads/${category}/${fileName}`;
    console.log('Generated public URL:', publicUrl);
    return publicUrl;
    
  } catch (error) {
    console.error('Error uploading file to local disk:', error);
    
    // 더 구체적인 에러 메시지를 전달
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`로컬 파일 업로드 실패: ${errorMessage}`);
  }
}

/**
 * 로컬 디스크에서 파일 삭제
 * @param filePath - 삭제할 파일의 경로 (public URL 형태)
 */
export async function deleteFileFromLocal(filePath: string): Promise<void> {
  try {
    // public URL을 실제 파일 경로로 변환
    // 예: /uploads/교육자료/123_file.pdf -> public/uploads/교육자료/123_file.pdf
    const actualPath = path.join(process.cwd(), 'public', filePath);
    
    if (fs.existsSync(actualPath)) {
      fs.unlinkSync(actualPath);
      console.log(`File ${filePath} deleted from local disk`);
    } else {
      console.log(`File ${filePath} does not exist on local disk`);
    }
  } catch (error) {
    console.error('Error deleting file from local disk:', error);
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
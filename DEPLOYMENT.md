# 🚀 배포 가이드

## Vercel 배포 방법

### 1. 사전 준비
1. [Vercel 계정](https://vercel.com) 생성
2. GitHub 저장소에 코드 업로드

### 2. Vercel 배포
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 연결
3. 환경 변수 설정:
   ```
   NEXTAUTH_SECRET=<강력한-비밀키-생성>
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=<안전한-비밀번호>
   DATABASE_URL=file:./dev.db
   ```
4. Deploy 클릭

### 3. 배포 후 확인
- https://your-app-name.vercel.app/auth/signin 로그인 테스트
- 파일 업로드 기능 테스트
- 모든 페이지 정상 작동 확인

## 로컬 실행 방법

### 개발 서버
```bash
npm run dev
# http://localhost:3000 또는 http://localhost:3001
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

## 기본 로그인 정보
- 아이디: admin
- 비밀번호: password123

## 주요 기능
✅ 로그인 시스템 (NextAuth.js)
✅ 학교 정보 관리 (CRUD)
✅ 방문 일정 관리 (FullCalendar)
✅ 교육자료 업로드 (PDF, PPT, DOC, 이미지 등)
✅ 산업재해 자료 관리
✅ 파일 다운로드 및 미리보기
✅ 반응형 디자인

## 지원 파일 형식
- 문서: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, TXT
- 이미지: JPG, JPEG, PNG, GIF, WEBP
- 동영상: MP4, WEBM
- 최대 파일 크기: 50MB

## 기술 스택
- Next.js 15 (App Router)
- TypeScript
- Prisma (SQLite)
- NextAuth.js
- TailwindCSS
- FullCalendar

## 문제 해결
1. **빌드 오류**: `npm run build`로 로컬에서 먼저 테스트
2. **로그인 실패**: 환경 변수 NEXTAUTH_SECRET, NEXTAUTH_URL 확인
3. **파일 업로드 실패**: 파일 크기(50MB) 및 형식 확인
4. **데이터베이스 오류**: DATABASE_URL 확인

## 보안 주의사항
- 프로덕션에서는 반드시 강력한 NEXTAUTH_SECRET 사용
- ADMIN_PASSWORD를 안전한 비밀번호로 변경
- .env 파일을 GitHub에 업로드하지 말 것
# 🏫 학교 안전보건 관리 시스템

인천광역시 학교안전공제회를 위한 통합 안전보건 관리 시스템입니다.

## ✨ 주요 기능

- 🔐 **로그인 시스템**: NextAuth.js 기반 보안 인증
- 🏫 **학교 정보 관리**: 학교 등록, 수정, 삭제 및 검색
- 📅 **방문 일정 관리**: FullCalendar 기반 시각적 일정 관리
- 📚 **교육자료 관리**: PDF, PPT, DOC 등 다양한 형식 지원
- ⚠️ **산업재해 자료**: 사고 예방 자료 업로드 및 관리
- 📊 **대시보드**: 실시간 통계 및 현황 모니터링

## 🚀 빠른 시작

### 1. 프로젝트 설치
```bash
git clone [repository-url]
cd school-safety-manager
npm install
```

### 2. 환경 설정
```bash
cp .env.example .env
# .env 파일에서 필요한 값들을 수정
```

### 3. 데이터베이스 초기화
```bash
npx prisma generate
npx prisma migrate dev
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📋 기본 로그인 정보

- **아이디**: admin
- **비밀번호**: password123

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (개발) / PostgreSQL (프로덕션)
- **Authentication**: NextAuth.js
- **Calendar**: FullCalendar
- **Deployment**: Vercel

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── auth/              # 인증 페이지
│   └── [pages]/           # 각 기능별 페이지
├── components/            # 재사용 컴포넌트
├── lib/                   # 유틸리티 함수
└── types/                 # TypeScript 타입 정의
```

## 📄 지원 파일 형식

- **문서**: PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, TXT
- **이미지**: JPG, JPEG, PNG, GIF, WEBP  
- **동영상**: MP4, WEBM
- **최대 크기**: 50MB

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 코드 검사
npm run lint

# 데이터베이스 관리
npx prisma studio
```

## 🚀 배포

자세한 배포 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 이슈를 등록해 주세요.

---

**인천광역시 학교안전공제회** | 학교 안전을 위한 통합 관리 솔루션

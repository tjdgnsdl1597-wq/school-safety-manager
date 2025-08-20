# 🛡️ 데이터 보호 가이드

## 🚨 절대 금지 사항

### ❌ 절대 사용하면 안 되는 명령어들
```bash
# 이 명령어들은 모든 데이터를 삭제합니다!
prisma db push --force-reset    # 데이터베이스 초기화 (전체 삭제)
prisma db push --accept-data-loss  # 데이터 손실 허용
prisma migrate reset            # 마이그레이션 초기화 (전체 삭제)
```

### ✅ 안전한 명령어들
```bash
prisma migrate deploy          # 프로덕션용 (데이터 보존)
prisma migrate dev             # 개발용 (안전한 마이그레이션)
prisma db push                 # 기본 (안전)
```

## 📋 배포 전 필수 체크리스트

### 1. package.json 확인
- [ ] `vercel-build` 스크립트에 `--force-reset` 없는지 확인
- [ ] `--accept-data-loss` 플래그 없는지 확인

### 2. Prisma 마이그레이션 확인
- [ ] 새로운 마이그레이션이 데이터 보존형인지 확인
- [ ] DROP, TRUNCATE 명령어가 없는지 확인

### 3. 환경변수 확인
- [ ] Vercel의 DATABASE_URL이 올바른지 확인
- [ ] 테스트 DB와 프로덕션 DB가 분리되어 있는지 확인

### 4. 백업 확인
- [ ] Vercel Postgres 자동 백업 활성화 확인
- [ ] 중요 데이터 수동 백업 완료

## 🔧 안전한 배포 프로세스

### 배포 명령어 순서
1. `npm run build` (로컬 테스트)
2. 코드 커밋 및 푸시
3. Vercel 자동 배포 대기
4. 배포 후 데이터 확인

### 데이터베이스 변경 시
1. 로컬에서 먼저 테스트
2. 마이그레이션 파일 검토
3. 백업 확인
4. 단계적 배포

## 🚨 비상 연락처 및 복구 절차

### 데이터 손실 발생 시
1. 즉시 배포 중단
2. Vercel Postgres 백업 확인
3. Point-in-time recovery 시도
4. 사용자들에게 상황 알림

## 📊 모니터링 체크포인트

### 매 배포 후 확인사항
- [ ] 사용자 수: `/api/debug/users`
- [ ] 학교 수: 학교 관리 페이지
- [ ] 일정 수: 일정 관리 페이지
- [ ] 교육자료 수: 교육자료 페이지

### 주간 점검사항
- [ ] 데이터베이스 백업 상태
- [ ] 사용자 활동 로그
- [ ] API 오류 로그 확인
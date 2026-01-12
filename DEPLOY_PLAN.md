# Vercel + Supabase 배포 작업 계획

## 진행 상태

### Phase 1: 사전 준비
- [x] Git 저장소 초기화
- [x] .gitignore에 data/ 추가

### Phase 2: Supabase 설정 (사용자)
- [ ] Supabase 가입/로그인 (https://supabase.com)
- [ ] 프로젝트 생성 (이름: loa-checklist, Region: Seoul)
- [ ] SQL Editor에서 아래 SQL 실행
- [ ] Project Settings > API에서 URL, anon key 복사해서 전달

### Phase 3: 코드 변경 (Claude)
- [ ] 패키지 설치 (@supabase/supabase-js, @supabase/ssr)
- [ ] .env 파일에 Supabase 키 설정
- [ ] Supabase 클라이언트 생성 (app/lib/)
- [ ] storage.ts → Supabase DB 연동
- [ ] 로그인/회원가입 페이지 생성
- [ ] 기존 페이지 인증 적용
- [ ] Layout에 로그아웃 버튼 추가

### Phase 4: GitHub 연동 (사용자)
- [ ] GitHub에서 저장소 생성 (loa-checklist)
- [ ] git remote add + push

### Phase 5: Vercel 배포 (사용자)
- [ ] Vercel 가입 (https://vercel.com)
- [ ] GitHub 저장소 import
- [ ] 환경변수 설정 (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] Deploy

### Phase 6: 최종 설정 (사용자)
- [ ] Supabase > Authentication > URL Configuration
- [ ] Site URL을 Vercel URL로 변경
- [ ] 테스트 완료

---

## SQL (Phase 2에서 사용)

Supabase Dashboard > SQL Editor > New Query에서 실행:

```sql
-- 캐릭터 테이블
CREATE TABLE characters (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  character_name TEXT NOT NULL,
  item_level DECIMAL(7,2) NOT NULL,
  class_name TEXT NOT NULL,
  is_gold_character BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, character_name)
);

-- 주간 레이드 체크 테이블
CREATE TABLE weekly_raids (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  character_name TEXT NOT NULL,
  raid_id TEXT NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, character_name, raid_id)
);

-- 일일 숙제 체크 테이블
CREATE TABLE daily_tasks (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  character_name TEXT NOT NULL,
  task_id TEXT NOT NULL,
  completed_count INTEGER DEFAULT 0,
  task_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, character_name, task_id, task_date)
);

-- 리셋 정보 테이블
CREATE TABLE reset_info (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users UNIQUE NOT NULL,
  weekly_reset_date TIMESTAMPTZ,
  daily_reset_date TIMESTAMPTZ
);

-- RLS 활성화
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reset_info ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (본인 데이터만 접근)
CREATE POLICY "Users can manage own characters" ON characters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own weekly raids" ON weekly_raids FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own daily tasks" ON daily_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reset info" ON reset_info FOR ALL USING (auth.uid() = user_id);
```

---

## 현재 단계

**Phase 1 완료** ✅

---

## 다음 작업 (사용자)

**Phase 2: Supabase 설정**

1. https://supabase.com 가입/로그인
2. "New Project" 클릭
   - Name: `loa-checklist`
   - Database Password: 설정 (메모 필수!)
   - Region: `Northeast Asia (Seoul)`
3. 프로젝트 생성 완료 후 (1-2분 소요)
4. **SQL Editor** 탭 → 위 SQL 복붙 → Run
5. **Project Settings > API** 에서:
   - `Project URL` 복사
   - `anon public` 키 복사
6. 두 값을 나에게 전달

완료되면 말씀해주세요!

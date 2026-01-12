# Vercel + Supabase 배포 작업 계획

## 진행 상태

### Phase 1: 사전 준비
- [x] Git 저장소 초기화
- [x] .gitignore에 data/ 추가

### Phase 2: Supabase 설정 (사용자)
- [x] Supabase 가입/로그인 (https://supabase.com)
- [x] 프로젝트 생성 (이름: lostark)
- [x] SQL Editor에서 SQL 실행
- [x] Project Settings > API에서 URL, anon key 복사해서 전달

### Phase 3: 코드 변경 (Claude)
- [x] 패키지 설치 (@supabase/supabase-js, @supabase/ssr)
- [x] .env 파일에 Supabase 키 설정
- [x] Supabase 클라이언트 생성 (app/lib/supabase.server.ts)
- [x] storage.ts → Supabase DB 연동
- [x] 로그인/회원가입 페이지 생성
- [x] 기존 페이지 인증 적용
- [x] Layout에 로그아웃 버튼 추가

### Phase 4: GitHub 연동 (사용자)
- [ ] GitHub에서 저장소 생성 (loa-checklist)
- [ ] git remote add + push

### Phase 5: Vercel 배포 (사용자)
- [ ] Vercel 가입 (https://vercel.com)
- [ ] GitHub 저장소 import
- [ ] 환경변수 설정 (SUPABASE_URL, SUPABASE_ANON_KEY, LOSTARK_API_KEY)
- [ ] Deploy

### Phase 6: 최종 설정 (사용자)
- [ ] Supabase > Authentication > URL Configuration
- [ ] Site URL을 Vercel URL로 변경
- [ ] 테스트 완료

---

## SQL (Phase 2에서 사용) - 완료됨

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

**Phase 3 완료** ✅

---

## 다음 작업 (사용자)

**Phase 4: GitHub 연동**

1. https://github.com 에서 "New repository" 클릭
2. Repository name: `loa-checklist` (또는 원하는 이름)
3. Public/Private 선택 후 "Create repository"
4. 터미널에서 아래 명령 실행:

```bash
git remote add origin https://github.com/YOUR_USERNAME/loa-checklist.git
git branch -M main
git add .
git commit -m "Initial commit with Supabase auth"
git push -u origin main
```

완료되면 **Phase 5: Vercel 배포**로 이동!

---

## Phase 5: Vercel 배포

1. https://vercel.com 가입 (GitHub 계정으로)
2. "Add New..." > "Project" 클릭
3. GitHub 저장소 import
4. **Environment Variables** 설정:
   - `SUPABASE_URL` = `https://uhhmibmhqfrnddacsbvk.supabase.co`
   - `SUPABASE_ANON_KEY` = (발급받은 anon key)
   - `LOSTARK_API_KEY` = (로스트아크 API 키)
5. Deploy 클릭

---

## Phase 6: 최종 설정

배포 완료 후:

1. Vercel에서 배포된 URL 확인 (예: `https://loa-checklist.vercel.app`)
2. Supabase > Authentication > URL Configuration
3. "Site URL"을 Vercel URL로 변경
4. 테스트:
   - 회원가입 → 로그인 → 캐릭터 추가 → 주간/일일 체크

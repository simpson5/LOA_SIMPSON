import type { SupabaseClient } from "@supabase/supabase-js";

// 레이드 정보
export type RaidDifficulty = "normal" | "hard" | "single" | "nightmare";
export type RaidCategory = "shadow" | "kazeross";

export interface Raid {
  id: string;
  name: string;
  difficulty: RaidDifficulty;
  requiredLevel: number;
  tradeGold: number;   // 거래 가능 골드
  boundGold: number;   // 귀속 골드
  category: RaidCategory;
}

// 카테고리 한글명
export const CATEGORY_NAMES: Record<RaidCategory, string> = {
  shadow: "그림자 레이드",
  kazeross: "카제로스 레이드",
};

// 난이도 한글명
export const DIFFICULTY_NAMES: Record<RaidDifficulty, string> = {
  normal: "노말",
  hard: "하드",
  single: "싱글",
  nightmare: "나이트메어",
};

export const RAIDS: Raid[] = [
  // 그림자 레이드 - 세르카
  { id: "serka-normal", name: "세르카", difficulty: "normal", requiredLevel: 1710, tradeGold: 35000, boundGold: 0, category: "shadow" },
  { id: "serka-hard", name: "세르카", difficulty: "hard", requiredLevel: 1730, tradeGold: 44000, boundGold: 0, category: "shadow" },
  { id: "serka-nightmare", name: "세르카", difficulty: "nightmare", requiredLevel: 1740, tradeGold: 54000, boundGold: 0, category: "shadow" },

  // 카제로스 레이드 - 최후의 날 (종막)
  { id: "lastday-normal", name: "최후의 날", difficulty: "normal", requiredLevel: 1710, tradeGold: 40000, boundGold: 0, category: "kazeross" },
  { id: "lastday-hard", name: "최후의 날", difficulty: "hard", requiredLevel: 1730, tradeGold: 52000, boundGold: 0, category: "kazeross" },
  { id: "lastday-single", name: "최후의 날", difficulty: "single", requiredLevel: 1710, tradeGold: 20000, boundGold: 20000, category: "kazeross" },

  // 카제로스 레이드 - 파멸의 성채 (4막)
  { id: "citadel-normal", name: "파멸의 성채", difficulty: "normal", requiredLevel: 1700, tradeGold: 33000, boundGold: 0, category: "kazeross" },
  { id: "citadel-hard", name: "파멸의 성채", difficulty: "hard", requiredLevel: 1720, tradeGold: 42000, boundGold: 0, category: "kazeross" },
  { id: "citadel-single", name: "파멸의 성채", difficulty: "single", requiredLevel: 1700, tradeGold: 16500, boundGold: 16500, category: "kazeross" },

  // 카제로스 레이드 - 칠흑, 폭풍의 밤 (3막)
  { id: "mordoom-normal", name: "폭풍의 밤", difficulty: "normal", requiredLevel: 1680, tradeGold: 21000, boundGold: 0, category: "kazeross" },
  { id: "mordoom-hard", name: "폭풍의 밤", difficulty: "hard", requiredLevel: 1700, tradeGold: 27000, boundGold: 0, category: "kazeross" },
  { id: "mordoom-single", name: "폭풍의 밤", difficulty: "single", requiredLevel: 1680, tradeGold: 10500, boundGold: 10500, category: "kazeross" },

  // 카제로스 레이드 - 부유하는 악몽의 진혼곡 (2막)
  { id: "nightmare-normal", name: "악몽의 진혼곡", difficulty: "normal", requiredLevel: 1670, tradeGold: 16500, boundGold: 0, category: "kazeross" },
  { id: "nightmare-hard", name: "악몽의 진혼곡", difficulty: "hard", requiredLevel: 1690, tradeGold: 23000, boundGold: 0, category: "kazeross" },
  { id: "nightmare-single", name: "악몽의 진혼곡", difficulty: "single", requiredLevel: 1670, tradeGold: 8250, boundGold: 8250, category: "kazeross" },

  // 카제로스 레이드 - 에기르
  { id: "egir-normal", name: "에기르", difficulty: "normal", requiredLevel: 1660, tradeGold: 11500, boundGold: 0, category: "kazeross" },
  { id: "egir-hard", name: "에기르", difficulty: "hard", requiredLevel: 1680, tradeGold: 18000, boundGold: 0, category: "kazeross" },
  { id: "egir-single", name: "에기르", difficulty: "single", requiredLevel: 1660, tradeGold: 5750, boundGold: 5750, category: "kazeross" },

  // 카제로스 레이드 - 에키드나 (싱글만)
  { id: "echidna-single", name: "에키드나", difficulty: "single", requiredLevel: 1620, tradeGold: 0, boundGold: 5500, category: "kazeross" },
];

// 총 골드 계산 (캐릭터의 완료된 레이드 기준)
export function calculateTotalGold(raids: Record<string, boolean>): { tradeGold: number; boundGold: number; total: number } {
  let tradeGold = 0;
  let boundGold = 0;

  for (const [raidId, completed] of Object.entries(raids)) {
    if (completed) {
      const raid = RAIDS.find(r => r.id === raidId);
      if (raid) {
        tradeGold += raid.tradeGold;
        boundGold += raid.boundGold;
      }
    }
  }

  return { tradeGold, boundGold, total: tradeGold + boundGold };
}

// 카테고리별 레이드 그룹화
export function getRaidsByCategory(): Record<RaidCategory, Raid[]> {
  return {
    shadow: RAIDS.filter(r => r.category === "shadow"),
    kazeross: RAIDS.filter(r => r.category === "kazeross"),
  };
}

// 캐릭터 레벨에 맞는 레이드만 필터링
export function getAvailableRaids(itemLevel: number): Raid[] {
  return RAIDS.filter(r => itemLevel >= r.requiredLevel);
}

// 일일 숙제 정보
export interface DailyTask {
  id: string;
  name: string;
  maxCount: number;
}

export const DAILY_TASKS: DailyTask[] = [
  { id: "chaos", name: "카오스 던전", maxCount: 1 },
  { id: "guardian", name: "가디언 토벌", maxCount: 1 },
];

// 체크리스트 데이터 타입
export interface CharacterChecklist {
  characterName: string;
  itemLevel: number;
  className: string;
  isGoldCharacter: boolean;
  weeklyRaids: Record<string, boolean>;
  dailyTasks: Record<string, number>;
}

export interface ChecklistData {
  lastUpdated: string;
  weeklyResetDate: string;
  dailyResetDate: string;
  characters: CharacterChecklist[];
}

// 리셋 시간 계산 (수요일 06:00 KST)
function getNextWeeklyReset(): Date {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const nowKST = new Date(now.getTime() + kstOffset);

  const dayOfWeek = nowKST.getUTCDay();
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7 || 7;

  const nextReset = new Date(nowKST);
  nextReset.setUTCDate(nextReset.getUTCDate() + daysUntilWednesday);
  nextReset.setUTCHours(6, 0, 0, 0);
  nextReset.setTime(nextReset.getTime() - kstOffset);

  return nextReset;
}

// 일일 리셋 시간 (06:00 KST)
function getNextDailyReset(): Date {
  const now = new Date();
  const kstOffset = 9 * 60 * 60 * 1000;
  const nowKST = new Date(now.getTime() + kstOffset);

  const nextReset = new Date(nowKST);
  if (nowKST.getUTCHours() >= 6) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }
  nextReset.setUTCHours(6, 0, 0, 0);
  nextReset.setTime(nextReset.getTime() - kstOffset);

  return nextReset;
}

// ============================================
// Supabase 연동 함수들
// ============================================

// 리셋 정보 가져오기/생성
async function getOrCreateResetInfo(supabase: SupabaseClient, userId: string) {
  const { data: resetInfo } = await supabase
    .from("reset_info")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (resetInfo) {
    return resetInfo;
  }

  // 없으면 생성
  const { data: newResetInfo } = await supabase
    .from("reset_info")
    .insert({
      user_id: userId,
      weekly_reset_date: getNextWeeklyReset().toISOString(),
      daily_reset_date: getNextDailyReset().toISOString(),
    })
    .select()
    .single();

  return newResetInfo;
}

// 리셋 체크 및 데이터 초기화
async function checkAndApplyReset(supabase: SupabaseClient, userId: string) {
  const resetInfo = await getOrCreateResetInfo(supabase, userId);
  if (!resetInfo) return;

  const now = new Date();
  let needsUpdate = false;

  // 주간 리셋 확인
  if (new Date(resetInfo.weekly_reset_date) <= now) {
    await supabase.from("weekly_raids").delete().eq("user_id", userId);
    resetInfo.weekly_reset_date = getNextWeeklyReset().toISOString();
    needsUpdate = true;
  }

  // 일일 리셋 확인
  if (new Date(resetInfo.daily_reset_date) <= now) {
    await supabase.from("daily_tasks").delete().eq("user_id", userId);
    resetInfo.daily_reset_date = getNextDailyReset().toISOString();
    needsUpdate = true;
  }

  if (needsUpdate) {
    await supabase
      .from("reset_info")
      .update({
        weekly_reset_date: resetInfo.weekly_reset_date,
        daily_reset_date: resetInfo.daily_reset_date,
      })
      .eq("user_id", userId);
  }

  return resetInfo;
}

// 체크리스트 로드 (Supabase)
export async function loadChecklistFromDB(
  supabase: SupabaseClient,
  userId: string
): Promise<ChecklistData> {
  // 리셋 체크
  const resetInfo = await checkAndApplyReset(supabase, userId);

  // 캐릭터 목록 가져오기
  const { data: characters } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", userId)
    .order("item_level", { ascending: false });

  // 주간 레이드 체크 가져오기
  const { data: weeklyRaids } = await supabase
    .from("weekly_raids")
    .select("*")
    .eq("user_id", userId);

  // 일일 숙제 가져오기
  const { data: dailyTasks } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", userId);

  // 유효한 레이드 ID
  const validRaidIds = new Set(RAIDS.map(r => r.id));

  // ChecklistData 형태로 변환
  const checklistCharacters: CharacterChecklist[] = (characters || []).map(char => {
    // 해당 캐릭터의 주간 레이드
    const charWeeklyRaids: Record<string, boolean> = {};
    (weeklyRaids || [])
      .filter(wr => wr.character_name === char.character_name && validRaidIds.has(wr.raid_id))
      .forEach(wr => {
        charWeeklyRaids[wr.raid_id] = true;
      });

    // 해당 캐릭터의 일일 숙제
    const charDailyTasks: Record<string, number> = {};
    (dailyTasks || [])
      .filter(dt => dt.character_name === char.character_name)
      .forEach(dt => {
        charDailyTasks[dt.task_id] = dt.completed_count;
      });

    return {
      characterName: char.character_name,
      itemLevel: parseFloat(char.item_level),
      className: char.class_name,
      isGoldCharacter: char.is_gold_character,
      weeklyRaids: charWeeklyRaids,
      dailyTasks: charDailyTasks,
    };
  });

  return {
    lastUpdated: new Date().toISOString(),
    weeklyResetDate: resetInfo?.weekly_reset_date || getNextWeeklyReset().toISOString(),
    dailyResetDate: resetInfo?.daily_reset_date || getNextDailyReset().toISOString(),
    characters: checklistCharacters,
  };
}

// 캐릭터 추가
export async function addCharacter(
  supabase: SupabaseClient,
  userId: string,
  character: { characterName: string; itemLevel: number; className: string; isGoldCharacter: boolean }
) {
  const { error } = await supabase.from("characters").insert({
    user_id: userId,
    character_name: character.characterName,
    item_level: character.itemLevel,
    class_name: character.className,
    is_gold_character: character.isGoldCharacter,
  });

  return { error };
}

// 캐릭터 업데이트
export async function updateCharacter(
  supabase: SupabaseClient,
  userId: string,
  characterName: string,
  updates: { itemLevel?: number; className?: string; isGoldCharacter?: boolean }
) {
  const updateData: Record<string, unknown> = {};
  if (updates.itemLevel !== undefined) updateData.item_level = updates.itemLevel;
  if (updates.className !== undefined) updateData.class_name = updates.className;
  if (updates.isGoldCharacter !== undefined) updateData.is_gold_character = updates.isGoldCharacter;

  const { error } = await supabase
    .from("characters")
    .update(updateData)
    .eq("user_id", userId)
    .eq("character_name", characterName);

  return { error };
}

// 캐릭터 삭제
export async function deleteCharacter(
  supabase: SupabaseClient,
  userId: string,
  characterName: string
) {
  // 관련 데이터도 삭제
  await supabase.from("weekly_raids").delete().eq("user_id", userId).eq("character_name", characterName);
  await supabase.from("daily_tasks").delete().eq("user_id", userId).eq("character_name", characterName);

  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("user_id", userId)
    .eq("character_name", characterName);

  return { error };
}

// 주간 레이드 체크/해제
export async function toggleWeeklyRaid(
  supabase: SupabaseClient,
  userId: string,
  characterName: string,
  raidId: string,
  checked: boolean
) {
  if (checked) {
    // 현재 체크 개수 확인 (최대 3개)
    const { data: currentRaids } = await supabase
      .from("weekly_raids")
      .select("raid_id")
      .eq("user_id", userId)
      .eq("character_name", characterName);

    // 유효한 레이드만 카운트
    const validRaidIds = new Set(RAIDS.map(r => r.id));
    const validCount = (currentRaids || []).filter(r => validRaidIds.has(r.raid_id)).length;

    if (validCount >= 3) {
      return { error: "최대 3개까지만 체크 가능합니다." };
    }

    const { error } = await supabase.from("weekly_raids").insert({
      user_id: userId,
      character_name: characterName,
      raid_id: raidId,
    });
    return { error: error?.message };
  } else {
    const { error } = await supabase
      .from("weekly_raids")
      .delete()
      .eq("user_id", userId)
      .eq("character_name", characterName)
      .eq("raid_id", raidId);
    return { error: error?.message };
  }
}

// 일일 숙제 업데이트
export async function updateDailyTask(
  supabase: SupabaseClient,
  userId: string,
  characterName: string,
  taskId: string,
  completedCount: number
) {
  // upsert 사용
  const { error } = await supabase.from("daily_tasks").upsert(
    {
      user_id: userId,
      character_name: characterName,
      task_id: taskId,
      completed_count: completedCount,
      task_date: new Date().toISOString().split("T")[0],
    },
    { onConflict: "user_id,character_name,task_id,task_date" }
  );
  return { error: error?.message };
}

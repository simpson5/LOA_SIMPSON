import { Form } from "react-router";
import type { Route } from "./+types/weekly";
import { Layout } from "~/components/Layout";
import {
  loadChecklistFromDB,
  toggleWeeklyRaid,
  RAIDS,
  calculateTotalGold,
  getRaidsByCategory,
  CATEGORY_NAMES,
  DIFFICULTY_NAMES,
  type RaidCategory,
  type RaidDifficulty,
  type Raid,
} from "~/utils/storage";
import { createSupabaseServerClient, requireUser } from "~/lib/supabase.server";

// 난이도 표시 순서
const DIFFICULTY_DISPLAY_ORDER: RaidDifficulty[] = ["hard", "nightmare", "normal", "single"];

// 레이드 이름별 그룹화
function groupRaidsByName(raids: Raid[]): Map<string, Raid[]> {
  const grouped = new Map<string, Raid[]>();

  // 레벨 역순으로 먼저 정렬
  const sorted = [...raids].sort((a, b) => b.requiredLevel - a.requiredLevel);

  for (const raid of sorted) {
    if (!grouped.has(raid.name)) {
      grouped.set(raid.name, []);
    }
    grouped.get(raid.name)!.push(raid);
  }

  return grouped;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LOA 숙제 체크 - 주간 클골" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const { supabase } = createSupabaseServerClient(request);
  const checklist = await loadChecklistFromDB(supabase, user.id);
  return { checklist };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const { supabase } = createSupabaseServerClient(request);

  const formData = await request.formData();
  const characterName = formData.get("characterName") as string;
  const raidId = formData.get("raidId") as string;
  const checked = formData.get("checked") === "true";

  const { error } = await toggleWeeklyRaid(supabase, user.id, characterName, raidId, checked);

  if (error) {
    const checklist = await loadChecklistFromDB(supabase, user.id);
    return { checklist, error };
  }

  const checklist = await loadChecklistFromDB(supabase, user.id);
  return { checklist };
}

export default function Weekly({ loaderData }: Route.ComponentProps) {
  const { checklist } = loaderData;

  const goldCharacters = checklist.characters
    .filter(c => c.isGoldCharacter)
    .sort((a, b) => b.itemLevel - a.itemLevel);

  let totalTradeGold = 0;
  let totalBoundGold = 0;

  goldCharacters.forEach(char => {
    const { tradeGold, boundGold } = calculateTotalGold(char.weeklyRaids);
    totalTradeGold += tradeGold;
    totalBoundGold += boundGold;
  });

  const raidsByCategory = getRaidsByCategory();
  const categoryOrder: RaidCategory[] = ["shadow", "kazeross"];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">주간 클골 체크</h2>
          <div className="text-right">
            <p className="text-sm text-gray-400">획득 골드</p>
            <div className="flex gap-4 items-end">
              <div>
                <span className="text-xs text-yellow-500">거래</span>
                <p className="text-xl font-bold text-yellow-400">
                  {totalTradeGold.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-blue-400">귀속</span>
                <p className="text-xl font-bold text-blue-400">
                  {totalBoundGold.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-400">총합</span>
                <p className="text-2xl font-bold text-green-400">
                  {(totalTradeGold + totalBoundGold).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {goldCharacters.length === 0 ? (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 text-center">
            <p className="text-lg mb-4">골드 캐릭터가 지정되어 있지 않습니다.</p>
            <a
              href="/characters"
              className="inline-block bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg"
            >
              캐릭터 관리로 이동
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {goldCharacters.map(char => {
              const charLevel = char.itemLevel;
              const { tradeGold, boundGold } = calculateTotalGold(char.weeklyRaids);
              // 유효한 레이드 ID만 카운트
              const validRaidIds = new Set(RAIDS.map(r => r.id));
              const checkedCount = Object.entries(char.weeklyRaids)
                .filter(([id, checked]) => checked && validRaidIds.has(id)).length;
              const isMaxChecked = checkedCount >= 3;

              return (
                <div key={char.characterName} className="bg-gray-800 rounded-lg border border-gray-700">
                  {/* 캐릭터 헤더 */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div>
                      <h3 className="font-bold text-lg">{char.characterName}</h3>
                      <p className="text-gray-400 text-sm">
                        {char.className} | {char.itemLevel.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm px-2 py-1 rounded ${isMaxChecked ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {checkedCount}/3
                      </span>
                      <div className="flex gap-2 text-sm">
                        <span className="text-yellow-400">{tradeGold.toLocaleString()} G</span>
                        <span className="text-blue-400">+{boundGold.toLocaleString()} G</span>
                      </div>
                    </div>
                  </div>

                  {/* 카테고리별 레이드 목록 */}
                  <div className="p-4 space-y-4">
                    {categoryOrder.map(category => {
                      const availableRaids = raidsByCategory[category].filter(r => charLevel >= r.requiredLevel);
                      const groupedRaids = groupRaidsByName(availableRaids);

                      if (availableRaids.length === 0) return null;

                      return (
                        <div key={category}>
                          <h4 className="text-sm font-semibold text-gray-400 mb-2 border-b border-gray-700 pb-1">
                            {CATEGORY_NAMES[category]}
                          </h4>
                          <div className="space-y-2">
                            {Array.from(groupedRaids.entries()).map(([raidName, raids]) => (
                              <div key={raidName} className="flex items-center gap-3 p-2 bg-gray-700/30 rounded-lg">
                                <span className="font-medium min-w-[120px]">{raidName}</span>
                                <div className="flex gap-2 flex-wrap">
                                  {DIFFICULTY_DISPLAY_ORDER.map(difficulty => {
                                    const raid = raids.find(r => r.difficulty === difficulty);
                                    if (!raid) return null;

                                    const isChecked = !!char.weeklyRaids[raid.id];
                                    const isDisabled = isMaxChecked && !isChecked;

                                    const goldText = raid.tradeGold > 0 && raid.boundGold > 0
                                      ? `${raid.tradeGold.toLocaleString()}+${raid.boundGold.toLocaleString()}`
                                      : raid.tradeGold > 0
                                      ? raid.tradeGold.toLocaleString()
                                      : raid.boundGold.toLocaleString();

                                    const bgColor = isChecked
                                      ? 'bg-green-600 hover:bg-green-700'
                                      : isDisabled
                                      ? 'bg-gray-600/50 cursor-not-allowed'
                                      : 'bg-gray-600 hover:bg-gray-500';

                                    const textColor = raid.boundGold > 0 && raid.tradeGold === 0
                                      ? 'text-blue-300'
                                      : 'text-yellow-300';

                                    return (
                                      <Form key={raid.id} method="post" className="inline">
                                        <input type="hidden" name="characterName" value={char.characterName} />
                                        <input type="hidden" name="raidId" value={raid.id} />
                                        <input type="hidden" name="checked" value={isChecked ? "false" : "true"} />
                                        <button
                                          type="submit"
                                          disabled={isDisabled}
                                          className={`px-3 py-1 rounded text-sm ${bgColor} transition-colors`}
                                        >
                                          <span className="text-gray-200">{DIFFICULTY_NAMES[difficulty]}</span>
                                          <span className={`ml-1 ${textColor}`}>{goldText}</span>
                                        </button>
                                      </Form>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 리셋 안내 */}
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400">
          <p>* 주간 리셋: 매주 수요일 오전 6시</p>
          <p>* 캐릭터당 최대 3개 레이드만 체크 가능합니다.</p>
          <p className="mt-2">
            <span className="text-yellow-400">노란색</span> = 거래 가능 |
            <span className="text-blue-400 ml-2">파란색</span> = 귀속
          </p>
        </div>
      </div>
    </Layout>
  );
}

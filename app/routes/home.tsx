import type { Route } from "./+types/home";
import { Layout } from "~/components/Layout";
import { loadChecklistFromDB, RAIDS, DAILY_TASKS, calculateTotalGold } from "~/utils/storage";
import { createSupabaseServerClient, requireUser } from "~/lib/supabase.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LOA 숙제 체크 - 대시보드" },
    { name: "description", content: "로스트아크 캐릭터 숙제 관리" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const { supabase } = createSupabaseServerClient(request);
  const checklist = await loadChecklistFromDB(supabase, user.id);
  return { checklist };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { checklist } = loaderData;

  // 골드 캐릭터 수
  const goldCharacters = checklist.characters.filter(c => c.isGoldCharacter);

  // 주간 골드 계산 (거래/귀속 분리)
  let totalTradeGold = 0;
  let totalBoundGold = 0;
  let maxTradeGold = 0;
  let maxBoundGold = 0;

  goldCharacters.forEach(char => {
    const charLevel = char.itemLevel;
    const { tradeGold, boundGold } = calculateTotalGold(char.weeklyRaids);
    totalTradeGold += tradeGold;
    totalBoundGold += boundGold;

    // 최대 획득 가능 골드
    RAIDS.filter(r => charLevel >= r.requiredLevel).forEach(r => {
      maxTradeGold += r.tradeGold;
      maxBoundGold += r.boundGold;
    });
  });

  const totalGold = totalTradeGold + totalBoundGold;
  const maxGold = maxTradeGold + maxBoundGold;

  // 일일 숙제 진행률
  const totalDailyTasks = checklist.characters.length * DAILY_TASKS.reduce((s, t) => s + t.maxCount, 0);
  const completedDailyTasks = checklist.characters.reduce((sum, char) => {
    return sum + Object.values(char.dailyTasks).reduce((s, count) => s + count, 0);
  }, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">대시보드</h2>

        {/* 요약 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 캐릭터 수 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">등록 캐릭터</h3>
            <p className="text-3xl font-bold">
              {checklist.characters.length}
              <span className="text-lg text-gray-400 ml-2">
                (골드 {goldCharacters.length}/6)
              </span>
            </p>
          </div>

          {/* 주간 골드 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">이번 주 획득 골드</h3>
            <p className="text-3xl font-bold text-green-400">
              {totalGold.toLocaleString()}
              <span className="text-lg text-gray-400 ml-2">
                / {maxGold.toLocaleString()}
              </span>
            </p>
            <div className="flex gap-3 mt-2 text-sm">
              <span className="text-yellow-400">거래: {totalTradeGold.toLocaleString()}</span>
              <span className="text-blue-400">귀속: {totalBoundGold.toLocaleString()}</span>
            </div>
          </div>

          {/* 일일 숙제 */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">오늘 숙제 진행률</h3>
            <p className="text-3xl font-bold text-green-400">
              {totalDailyTasks > 0
                ? `${Math.round((completedDailyTasks / totalDailyTasks) * 100)}%`
                : "0%"
              }
            </p>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${totalDailyTasks > 0 ? (completedDailyTasks / totalDailyTasks) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* 리셋 시간 */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex gap-8">
            <div>
              <span className="text-gray-400">일일 리셋:</span>
              <span className="ml-2">{new Date(checklist.dailyResetDate).toLocaleString("ko-KR")}</span>
            </div>
            <div>
              <span className="text-gray-400">주간 리셋:</span>
              <span className="ml-2">{new Date(checklist.weeklyResetDate).toLocaleString("ko-KR")}</span>
            </div>
          </div>
        </div>

        {/* 시작 안내 */}
        {checklist.characters.length === 0 && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 text-center">
            <p className="text-lg mb-4">캐릭터가 등록되어 있지 않습니다.</p>
            <a
              href="/characters"
              className="inline-block bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg"
            >
              캐릭터 등록하기
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}

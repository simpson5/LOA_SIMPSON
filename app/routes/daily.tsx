import { Form } from "react-router";
import type { Route } from "./+types/daily";
import { Layout } from "~/components/Layout";
import { loadChecklistFromDB, updateDailyTask, DAILY_TASKS } from "~/utils/storage";
import { createSupabaseServerClient, requireUser } from "~/lib/supabase.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LOA 숙제 체크 - 일일 숙제" },
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
  const taskId = formData.get("taskId") as string;
  const count = parseInt(formData.get("count") as string, 10);

  await updateDailyTask(supabase, user.id, characterName, taskId, count);

  const checklist = await loadChecklistFromDB(supabase, user.id);
  return { checklist };
}

export default function Daily({ loaderData }: Route.ComponentProps) {
  const { checklist } = loaderData;

  // 레벨 순 정렬
  const sortedCharacters = [...checklist.characters].sort(
    (a, b) => b.itemLevel - a.itemLevel
  );

  // 전체 진행률 계산
  const totalTasks = checklist.characters.length * DAILY_TASKS.reduce((s, t) => s + t.maxCount, 0);
  const completedTasks = checklist.characters.reduce((sum, char) => {
    return sum + Object.values(char.dailyTasks).reduce((s, count) => s + count, 0);
  }, 0);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">일일 숙제 체크</h2>
          <div className="text-right">
            <p className="text-sm text-gray-400">전체 진행률</p>
            <p className="text-2xl font-bold text-green-400">{progressPercent}%</p>
          </div>
        </div>

        {/* 진행률 바 */}
        <div className="bg-gray-700 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {sortedCharacters.length === 0 ? (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 text-center">
            <p className="text-lg mb-4">등록된 캐릭터가 없습니다.</p>
            <a
              href="/characters"
              className="inline-block bg-orange-600 hover:bg-orange-700 px-6 py-2 rounded-lg"
            >
              캐릭터 등록하기
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCharacters.map(char => {
              const charCompleted = DAILY_TASKS.reduce((sum, task) => {
                return sum + (char.dailyTasks[task.id] || 0);
              }, 0);
              const charTotal = DAILY_TASKS.reduce((s, t) => s + t.maxCount, 0);
              const isComplete = charCompleted >= charTotal;

              return (
                <div
                  key={char.characterName}
                  className={`bg-gray-800 rounded-lg border ${
                    isComplete ? "border-green-700" : "border-gray-700"
                  }`}
                >
                  {/* 캐릭터 헤더 */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div>
                      <h3 className="font-bold text-lg">{char.characterName}</h3>
                      <p className="text-gray-400 text-sm">
                        {char.className} | {char.itemLevel.toFixed(2)}
                      </p>
                    </div>
                    {isComplete && (
                      <span className="text-green-400 font-bold">완료!</span>
                    )}
                  </div>

                  {/* 숙제 목록 */}
                  <div className="p-4 space-y-2">
                    {DAILY_TASKS.map(task => (
                      <DailyTaskItem
                        key={task.id}
                        task={task}
                        count={char.dailyTasks[task.id] || 0}
                        characterName={char.characterName}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 리셋 안내 */}
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400">
          <p>* 일일 리셋: 매일 오전 6시</p>
          <p>* 리셋 시 모든 일일 숙제가 초기화됩니다.</p>
        </div>
      </div>
    </Layout>
  );
}

// 일일 숙제 아이템 컴포넌트
function DailyTaskItem({
  task,
  count,
  characterName,
}: {
  task: (typeof DAILY_TASKS)[0];
  count: number;
  characterName: string;
}) {
  const isComplete = count >= task.maxCount;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isComplete ? "bg-green-900/30" : "bg-gray-700/50"
    }`}>
      <span className={isComplete ? "line-through text-gray-400" : ""}>{task.name}</span>
      <div className="flex items-center gap-2">
        <Form method="post">
          <input type="hidden" name="characterName" value={characterName} />
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="count" value={Math.max(0, count - 1)} />
          <button
            type="submit"
            className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
            disabled={count === 0}
          >
            -
          </button>
        </Form>
        <span className="w-12 text-center font-mono">
          {count}/{task.maxCount}
        </span>
        <Form method="post">
          <input type="hidden" name="characterName" value={characterName} />
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="count" value={Math.min(task.maxCount, count + 1)} />
          <button
            type="submit"
            className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
            disabled={count >= task.maxCount}
          >
            +
          </button>
        </Form>
      </div>
    </div>
  );
}

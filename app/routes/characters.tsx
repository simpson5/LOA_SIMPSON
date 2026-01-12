import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/characters";
import { Layout } from "~/components/Layout";
import { CharacterCard } from "~/components/CharacterCard";
import { getCharacterSiblings } from "~/services/lostark-api";
import { loadChecklistFromDB, addCharacter, updateCharacter, deleteCharacter } from "~/utils/storage";
import { createSupabaseServerClient, requireUser } from "~/lib/supabase.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LOA 숙제 체크 - 캐릭터 관리" },
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
  const intent = formData.get("intent");

  if (intent === "search") {
    const characterName = formData.get("characterName") as string;
    if (!characterName) {
      return { error: "캐릭터 이름을 입력해주세요.", characters: null };
    }

    try {
      const siblings = await getCharacterSiblings(characterName);
      const checklist = await loadChecklistFromDB(supabase, user.id);

      // 기존 체크리스트에 없는 캐릭터만 추가
      const existingNames = new Set(checklist.characters.map(c => c.characterName));
      const newCharacters = siblings
        .filter(s => !existingNames.has(s.CharacterName))
        .map(s => ({
          characterName: s.CharacterName,
          itemLevel: parseFloat(s.ItemAvgLevel.replace(",", "")),
          className: s.CharacterClassName,
          isGoldCharacter: false,
        }));

      // 각 캐릭터를 DB에 추가
      for (const char of newCharacters) {
        await addCharacter(supabase, user.id, char);
      }

      const updatedChecklist = await loadChecklistFromDB(supabase, user.id);
      return {
        success: `${newCharacters.length}개의 캐릭터가 추가되었습니다.`,
        checklist: updatedChecklist,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "캐릭터 조회 실패",
        characters: null
      };
    }
  }

  if (intent === "toggleGold") {
    const name = formData.get("name") as string;
    const checklist = await loadChecklistFromDB(supabase, user.id);
    const char = checklist.characters.find(c => c.characterName === name);

    if (char) {
      const goldCount = checklist.characters.filter(c => c.isGoldCharacter).length;
      if (!char.isGoldCharacter && goldCount >= 6) {
        return { error: "골드 캐릭터는 최대 6개까지 지정할 수 있습니다." };
      }

      await updateCharacter(supabase, user.id, name, {
        isGoldCharacter: !char.isGoldCharacter,
      });
    }

    const updatedChecklist = await loadChecklistFromDB(supabase, user.id);
    return { checklist: updatedChecklist };
  }

  if (intent === "remove") {
    const name = formData.get("name") as string;
    await deleteCharacter(supabase, user.id, name);

    const updatedChecklist = await loadChecklistFromDB(supabase, user.id);
    return { checklist: updatedChecklist };
  }

  return {};
}

export default function Characters({ loaderData, actionData }: Route.ComponentProps) {
  const checklist = actionData?.checklist || loaderData.checklist;
  const navigation = useNavigation();
  const isSearching = navigation.formData?.get("intent") === "search";

  // 아이템 레벨 순 정렬
  const sortedCharacters = [...checklist.characters].sort(
    (a, b) => b.itemLevel - a.itemLevel
  );

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">캐릭터 관리</h2>

        {/* 캐릭터 검색 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">캐릭터 추가</h3>
          <Form method="post" className="flex gap-4">
            <input type="hidden" name="intent" value="search" />
            <input
              type="text"
              name="characterName"
              placeholder="대표 캐릭터 이름 입력"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50"
            >
              {isSearching ? "검색 중..." : "검색"}
            </button>
          </Form>

          {actionData?.error && (
            <p className="mt-3 text-red-400">{actionData.error}</p>
          )}
          {actionData?.success && (
            <p className="mt-3 text-green-400">{actionData.success}</p>
          )}

          <p className="mt-3 text-gray-400 text-sm">
            * API 키가 필요합니다. .env 파일에 LOSTARK_API_KEY를 설정해주세요.
          </p>
        </div>

        {/* 캐릭터 목록 */}
        {sortedCharacters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCharacters.map(char => (
              <div key={char.characterName} className="relative">
                <CharacterCard character={char} />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Form method="post">
                    <input type="hidden" name="intent" value="toggleGold" />
                    <input type="hidden" name="name" value={char.characterName} />
                    <button
                      type="submit"
                      className={`text-xs px-2 py-1 rounded ${
                        char.isGoldCharacter
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-600 text-gray-300"
                      }`}
                    >
                      {char.isGoldCharacter ? "골드" : "미지정"}
                    </button>
                  </Form>
                  <Form method="post">
                    <input type="hidden" name="intent" value="remove" />
                    <input type="hidden" name="name" value={char.characterName} />
                    <button
                      type="submit"
                      className="text-xs px-2 py-1 rounded bg-red-600/50 hover:bg-red-600 text-white"
                    >
                      삭제
                    </button>
                  </Form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-12">
            등록된 캐릭터가 없습니다.
          </div>
        )}

        {/* 골드 캐릭터 안내 */}
        <div className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-400">
          <p>* 골드 획득 캐릭터는 최대 6개까지 지정할 수 있습니다.</p>
          <p>* 골드 캐릭터로 지정된 캐릭터만 주간 클골에서 골드 계산에 포함됩니다.</p>
        </div>
      </div>
    </Layout>
  );
}

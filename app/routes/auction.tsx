import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/auction";
import { Layout } from "~/components/Layout";
import {
  searchAuction,
  searchMarket,
  AUCTION_CATEGORIES,
  MARKET_CATEGORIES,
  type AuctionItem,
  type MarketItem,
} from "~/services/lostark-api";
import { requireUser } from "~/lib/supabase.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "LOA 숙제 체크 - 경매장 검색" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  await requireUser(request);
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  await requireUser(request);
  const formData = await request.formData();
  const itemName = formData.get("itemName") as string;
  const searchType = formData.get("searchType") as "auction" | "market";
  const categoryCode = parseInt(formData.get("categoryCode") as string, 10) || 0;

  if (!itemName) {
    return { error: "아이템 이름을 입력해주세요." };
  }

  try {
    if (searchType === "auction") {
      const result = await searchAuction(itemName, categoryCode || 210000);
      return { auctionItems: result.Items || [], marketItems: null, searchType, searchQuery: itemName };
    } else {
      const result = await searchMarket(itemName, categoryCode);
      return { auctionItems: null, marketItems: result.Items || [], searchType, searchQuery: itemName };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "검색 실패",
      auctionItems: null,
      marketItems: null,
    };
  }
}

export default function Auction({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSearching = navigation.state === "submitting";

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">경매장 / 거래소 검색</h2>

        {/* 경매장 검색 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-orange-400">경매장 검색</h3>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="searchType" value="auction" />
            <div className="flex gap-4">
              <input
                type="text"
                name="itemName"
                placeholder="아이템 이름 (예: 겁화, 작열)"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
              />
              <select
                name="categoryCode"
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
              >
                {Object.entries(AUCTION_CATEGORIES).map(([name, code]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg disabled:opacity-50 font-semibold whitespace-nowrap"
              >
                {isSearching ? "검색 중..." : "검색"}
              </button>
            </div>
          </Form>
        </div>

        {/* 거래소 검색 */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-blue-400">거래소 검색</h3>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="searchType" value="market" />
            <div className="flex gap-4">
              <input
                type="text"
                name="itemName"
                placeholder="아이템 이름 (예: 파괴석, 명예의 파편)"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <select
                name="categoryCode"
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
              >
                {Object.entries(MARKET_CATEGORIES).map(([name, code]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 font-semibold whitespace-nowrap"
              >
                {isSearching ? "검색 중..." : "검색"}
              </button>
            </div>
          </Form>
        </div>

        <p className="text-gray-400 text-sm">
          * API 키가 필요합니다. .env 파일에 LOSTARK_API_KEY를 설정해주세요.
        </p>

        {/* 에러 메시지 */}
        {actionData?.error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400">
            {actionData.error}
          </div>
        )}

        {/* 경매장 결과 */}
        {actionData?.auctionItems && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              경매장 검색 결과: "{actionData.searchQuery}" ({actionData.auctionItems.length}개)
            </h3>
            {actionData.auctionItems.length === 0 ? (
              <p className="text-gray-400">검색 결과가 없습니다.</p>
            ) : (
              <div className="grid gap-3">
                {actionData.auctionItems.slice(0, 20).map((item, idx) => (
                  <AuctionItemCard key={idx} item={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 거래소 결과 */}
        {actionData?.marketItems && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">
              거래소 검색 결과: "{actionData.searchQuery}" ({actionData.marketItems.length}개)
            </h3>
            {actionData.marketItems.length === 0 ? (
              <p className="text-gray-400">검색 결과가 없습니다.</p>
            ) : (
              <div className="grid gap-3">
                {actionData.marketItems.slice(0, 20).map((item, idx) => (
                  <MarketItemCard key={idx} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

// 경매장 아이템 카드
function AuctionItemCard({ item }: { item: AuctionItem }) {
  const gradeColor = getGradeColor(item.Grade);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
      {item.Icon && (
        <img
          src={item.Icon}
          alt={item.Name}
          className="w-12 h-12 rounded"
        />
      )}
      <div className="flex-1">
        <h4 className={`font-bold ${gradeColor}`}>{item.Name}</h4>
        <div className="text-sm text-gray-400">
          {item.Options?.slice(0, 2).map((opt, i) => (
            <span key={i} className="mr-2">
              {opt.OptionName}: {opt.Value}
            </span>
          ))}
        </div>
      </div>
      <div className="text-right">
        <p className="text-yellow-400 font-bold">
          {item.AuctionInfo?.BuyPrice?.toLocaleString() || "-"} G
        </p>
        <p className="text-sm text-gray-400">
          즉시 구매가
        </p>
      </div>
    </div>
  );
}

// 거래소 아이템 카드
function MarketItemCard({ item }: { item: MarketItem }) {
  const gradeColor = getGradeColor(item.Grade);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
      {item.Icon && (
        <img
          src={item.Icon}
          alt={item.Name}
          className="w-12 h-12 rounded"
        />
      )}
      <div className="flex-1">
        <h4 className={`font-bold ${gradeColor}`}>{item.Name}</h4>
        <p className="text-sm text-gray-400">
          묶음: {item.BundleCount}개
        </p>
      </div>
      <div className="text-right">
        <p className="text-yellow-400 font-bold">
          {item.CurrentMinPrice?.toLocaleString() || "-"} G
        </p>
        <p className="text-sm text-gray-400">
          전일 평균: {item.YDayAvgPrice?.toLocaleString() || "-"} G
        </p>
      </div>
    </div>
  );
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "고대": return "text-yellow-300";
    case "유물": return "text-orange-400";
    case "전설": return "text-yellow-500";
    case "영웅": return "text-purple-400";
    case "희귀": return "text-blue-400";
    case "고급": return "text-green-400";
    default: return "text-gray-300";
  }
}

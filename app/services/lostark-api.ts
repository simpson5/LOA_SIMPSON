const API_BASE_URL = "https://developer-lostark.game.onstove.com";

function getApiKey(): string {
  const apiKey = process.env.LOSTARK_API_KEY;
  if (!apiKey) {
    throw new Error("LOSTARK_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return apiKey;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const apiKey = getApiKey();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "accept": "application/json",
      "authorization": `bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// 캐릭터 관련 타입
export interface Character {
  ServerName: string;
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ItemMaxLevel: string;
}

export interface CharacterProfile {
  CharacterImage: string;
  ExpeditionLevel: number;
  PvpGradeName: string;
  TownLevel: number;
  TownName: string;
  Title: string;
  GuildMemberGrade: string;
  GuildName: string;
  UsingSkillPoint: number;
  TotalSkillPoint: number;
  Stats: Array<{ Type: string; Value: string; Tooltip: string[] }>;
  Tendencies: Array<{ Type: string; Point: number; MaxPoint: number }>;
  ServerName: string;
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ItemMaxLevel: string;
}

// 경매장 관련 타입
export interface AuctionItem {
  Name: string;
  Grade: string;
  Tier: number;
  Level: number;
  Icon: string;
  GradeQuality: number;
  AuctionInfo: {
    StartPrice: number;
    BuyPrice: number;
    BidPrice: number;
    EndDate: string;
    BidCount: number;
    BidStartPrice: number;
    IsCompetitive: boolean;
    TradeAllowCount: number;
  };
  Options: Array<{
    Type: string;
    OptionName: string;
    OptionNameTripod: string;
    Value: number;
    IsPenalty: boolean;
    ClassName: string;
  }>;
}

export interface AuctionResponse {
  PageNo: number;
  PageSize: number;
  TotalCount: number;
  Items: AuctionItem[];
}

// 거래소 관련 타입
export interface MarketItem {
  Id: number;
  Name: string;
  Grade: string;
  Icon: string;
  BundleCount: number;
  TradeRemainCount: number | null;
  YDayAvgPrice: number;
  RecentPrice: number;
  CurrentMinPrice: number;
}

export interface MarketResponse {
  PageNo: number;
  PageSize: number;
  TotalCount: number;
  Items: MarketItem[];
}

// 경매장 카테고리 코드
export const AUCTION_CATEGORIES = {
  보석: 210000,
  아바타: 20000,
  각인서: 40000,
} as const;

// 거래소 카테고리 코드
export const MARKET_CATEGORIES = {
  전체: 0,
  각인서: 40000,
  강화재료: 50000,
  전투용품: 60000,
  생활: 70000,
  요리: 90000,
} as const;

// API 함수들
export async function getCharacterSiblings(characterName: string): Promise<Character[]> {
  return fetchApi<Character[]>(`/characters/${encodeURIComponent(characterName)}/siblings`);
}

export async function getCharacterProfile(characterName: string): Promise<CharacterProfile> {
  return fetchApi<CharacterProfile>(`/armories/characters/${encodeURIComponent(characterName)}/profiles`);
}

export async function searchAuction(itemName: string, categoryCode: number = 210000): Promise<AuctionResponse> {
  return fetchApi<AuctionResponse>("/auctions/items", {
    method: "POST",
    body: JSON.stringify({
      ItemName: itemName,
      CategoryCode: categoryCode,
      Sort: "BUY_PRICE",
      SortCondition: "ASC",
    }),
  });
}

export async function searchMarket(itemName: string, categoryCode: number = 0): Promise<MarketResponse> {
  return fetchApi<MarketResponse>("/markets/items", {
    method: "POST",
    body: JSON.stringify({
      ItemName: itemName,
      CategoryCode: categoryCode,
      Sort: "CURRENT_MIN_PRICE",
      SortCondition: "ASC",
    }),
  });
}

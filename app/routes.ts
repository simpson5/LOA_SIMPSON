import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("characters", "routes/characters.tsx"),
  route("weekly", "routes/weekly.tsx"),
  route("daily", "routes/daily.tsx"),
  route("auction", "routes/auction.tsx"),
] satisfies RouteConfig;

import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("characters", "routes/characters.tsx"),
  route("weekly", "routes/weekly.tsx"),
  route("daily", "routes/daily.tsx"),
  route("auction", "routes/auction.tsx"),
] satisfies RouteConfig;

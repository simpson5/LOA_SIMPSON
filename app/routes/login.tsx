import { Form, Link, useActionData, useNavigation } from "react-router";
import type { Route } from "./+types/login";
import { createSupabaseServerClient } from "~/lib/supabase.server";

export function meta() {
  return [{ title: "LOA 숙제 체크 - 로그인" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = createSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  }

  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { supabase, headers } = createSupabaseServerClient(request);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return new Response(null, {
    status: 302,
    headers: {
      ...Object.fromEntries(headers.entries()),
      Location: "/",
    },
  });
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-6">LOA 숙제 체크</h1>
        <h2 className="text-lg text-gray-400 text-center mb-8">로그인</h2>

        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-400 mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-gray-400 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-orange-500"
              placeholder="********"
            />
          </div>

          {actionData?.error && (
            <p className="text-red-400 text-sm">{actionData.error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </Form>

        <p className="text-center text-gray-400 mt-6">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="text-orange-400 hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}

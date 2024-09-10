import { next } from "@vercel/edge";

export const config = {
  matcher: '/(.*)', // 兄弟および配下のディレクトリに認証処理を設ける
};

export default function middleware(request) {
  const authorizationHeader = request.headers.get("authorization");

  if (authorizationHeader) {
    const basicAuth = authorizationHeader.split(" ")[1];
    const [user, password] = atob(basicAuth).toString().split(":");

    if (user === process.env.BASIC_AUTH_USER && password === process.env.BASIC_AUTH_PASSWORD) {
      return next();
      // 認証通過後の処理。静的ページを読み込みます
    }
  }

  // 失敗時の処理
  return new Response("Basic Auth required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}

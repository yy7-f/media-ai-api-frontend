import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: ["/tools/:path*"], // protect all tools
};





// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";
//
// const PROTECTED = [/^\/tools(\/|$)/];
//
// export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;
//   if (PROTECTED.some((re) => re.test(pathname))) {
//     const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
//     if (!token) {
//       const url = new URL("/login", req.url);
//       url.searchParams.set("callbackUrl", pathname);
//       return NextResponse.redirect(url);
//     }
//   }
//   return NextResponse.next();
// }
//
// export const config = {
//   matcher: ["/tools/:path*"],
// };

// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const API_BASE =
  process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || "";
const API_KEY =
  process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || "";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email/password in credentials");
          return null;
        }

        if (!API_BASE) {
          console.error("API_BASE / NEXT_PUBLIC_API_BASE is not set");
          return null;
        }

        const baseUrl = API_BASE.replace(/\/$/, "");
        const url = `${baseUrl}/auth/login/`;

        try {
          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          };
          if (API_KEY) {
            // change header name if your backend expects something else
            headers["x-api-key"] = API_KEY;
          }

          const res = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          let data: any = null;
          try {
            data = await res.json();
          } catch {
            console.error("Failed to parse login JSON");
          }

          console.log("Auth login status:", res.status, "data:", data);

          if (!res.ok) {
            // 401 is “wrong credentials”, others are more likely config issues
            if (res.status === 401) {
              console.error("Invalid email or password");
            } else {
              console.error("Login failed:", res.status, data);
            }
            return null;
          }

          // Try to support multiple possible response shapes:
          const token =
            data?.token ??
            data?.access_token ??
            data?.accessToken ??
            data?.jwt ??
            null;

          const email =
            data?.email ??
            data?.user?.email ??
            credentials.email;

          const userId =
            data?.user?.id ??
            data?.id ??
            email;

          const plan =
            data?.user?.plan ??
            data?.plan ??
            "free";

          if (!token || !email) {
            console.error(
              "Login OK but missing token/email in response",
              data
            );
            return null;
          }

          // This object ends up in `user` inside jwt() callback
          return {
            id: userId,
            email,
            token,
            plan,
          };
        } catch (err) {
          console.error("authorize() error:", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).token;
        token.plan = (user as any).plan;
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).plan = token.plan;

      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };

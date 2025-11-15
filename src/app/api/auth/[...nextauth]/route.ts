// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const base = process.env.NEXT_PUBLIC_API_BASE;
        if (!base) {
          console.error("NEXT_PUBLIC_API_BASE is not set");
          return null;
        }

        // Normalize base and build login URL
        const baseUrl = base.replace(/\/$/, "");
        const url = `${baseUrl}/auth/login/`;

        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            console.error("Login failed:", res.status, data);
            return null;
          }

          if (!data?.token || !data?.email) {
            console.error("Login OK but missing token/email in response");
            return null;
          }

          // This flows into jwt() as `user`
          return {
            id: data.user?.id ?? data.email,
            email: data.email,
            token: data.token,
            plan: data.user?.plan ?? "free",
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
      // attach to root session (optional but handy)
      (session as any).accessToken = token.accessToken;
      (session as any).plan = token.plan;

      // attach to session.user for easy access in UI
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).plan = token.plan;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };

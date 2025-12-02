// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email + Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (!API_BASE) {
          console.error("NEXT_PUBLIC_API_BASE is not set");
          return null;
        }

        try {
          const res = await fetch(`${API_BASE.replace(/\/$/, "")}/auth/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            console.error("Auth failed", await res.text());
            return null;
          }

          const data = await res.json();
          // Expected from Flask: { email, token, user: {...} }
          if (!data?.token || !data?.email) return null;

          return {
            id: String(data.user?.id ?? data.email),
            email: data.email,
            token: data.token,
            plan: data.user?.plan ?? "free",
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      // First login: merge user fields into token
      if (user) {
        token.email = user.email;
        // @ts-ignore
        token.apiToken = user.token;
        // @ts-ignore
        token.plan = user.plan;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        // @ts-ignore
        session.user.plan = token.plan as string;
        // @ts-ignore – we expose backend token on session for API calls
        (session as any).apiToken = token.apiToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

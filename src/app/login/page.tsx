// src/app/login/page.tsx
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // ✅ Next.js 15: searchParams is a Promise, so await it
  const resolved = await searchParams;
  const registeredParam = resolved.registered;

  const registeredValue = Array.isArray(registeredParam)
    ? registeredParam[0]
    : registeredParam;

  const justRegistered = Boolean(registeredValue);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <LoginForm justRegistered={justRegistered} />
    </div>
  );
}

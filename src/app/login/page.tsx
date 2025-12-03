// src/app/login/page.tsx
import { LoginForm } from "./LoginForm";

type LoginPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
  const registeredParam = searchParams.registered;

  // treat ?registered=1 (or any truthy value) as "just registered"
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

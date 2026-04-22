import { AuthPage } from "@/components/auth-page";
import {
  registerWithAuthJsCredentials,
  signInWithAuthJsCredentials,
} from "@/lib/auth/authjs-actions";
import { redirectIfAuthenticated } from "@/lib/auth/current-user";
import { readServerEnv, usesAuthJsCredentials } from "@/lib/env";
import { getSingleSearchParam } from "@/lib/search-params";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  await redirectIfAuthenticated();

  const params = await searchParams;
  const env = readServerEnv();
  const authJsCredentialsEnabled = usesAuthJsCredentials(env);

  return (
    <AuthPage
      appName={env.NEXT_PUBLIC_APP_NAME}
      error={getSingleSearchParam(params.error)}
      message={getSingleSearchParam(params.message)}
      registerAction={
        authJsCredentialsEnabled
          ? registerWithAuthJsCredentials
          : "/auth/register"
      }
      signInAction={
        authJsCredentialsEnabled ? signInWithAuthJsCredentials : "/auth/sign-in"
      }
      useAuthJsCredentials={authJsCredentialsEnabled}
    />
  );
}

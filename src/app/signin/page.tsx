import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { getServerAuthSession } from "~/server/auth";

export default async function SignIn() {
  const session = await getServerAuthSession();

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    redirect("/");
  }

  const token = cookies()
    .getAll()
    .find((item) => item.name.includes("next-auth.csrf-token"));
  const csrfToken = token?.value.split("|")[0];

  return (
      <main className="flex h-screen items-center justify-center bg-background">
        <form
          method="POST"
          action="/api/auth/signin/google"
          className="w-full max-w-sm"
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
            </CardHeader>
            <CardFooter>
              <Button className="w-full">Sign in with Google</Button>
            </CardFooter>
          </Card>
        </form>
      </main>
  );
}

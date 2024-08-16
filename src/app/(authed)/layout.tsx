import { redirect } from "next/navigation";

import { getServerAuthSession } from "~/server/auth";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return children;
};

export default RootLayout;

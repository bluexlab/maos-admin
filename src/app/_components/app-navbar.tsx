"use client";

import { Bot, Box, Home, Lock, Settings, Truck, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";

const NavItems = [
  {
    title: "Dashboard",
    icon: Home,
    path: "/dashboard",
  },
  {
    title: "Actors",
    icon: Bot,
    path: "/actors",
  },
  {
    title: "Deployments",
    icon: Truck,
    path: "/deployments",
    badge: true,
  },
  {
    title: "Secrets",
    icon: Lock,
    path: "/secrets",
    badge: true,
  },
  {
    title: "Pods",
    icon: Box,
    path: "/pods",
  },
  {
    title: "Users",
    icon: Users,
    path: "/users",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function AppNavbar({
  currentPath,
  currentUserEmail,
  mobile,
}: {
  currentPath: string;
  currentUserEmail: string;
  mobile?: boolean;
}) {
  const reviewingDeployments = api.deployments.list.useQuery({
    status: "reviewing",
    reviewer: currentUserEmail,
  });
  const reviewingCount = reviewingDeployments.data?.data?.length ?? 0;

  const divClassName = mobile
    ? "mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
    : "flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary";

  const linkClassName = mobile
    ? "mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
    : "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary";

  const iconClassName = mobile ? "h-5 w-5" : "h-4 w-4";

  return (
    <>
      {NavItems.map((item, index) =>
        currentPath.startsWith(item.path) ? (
          <div key={index} className={divClassName}>
            <item.icon className={iconClassName} />
            {item.title}
            {item.badge && reviewingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reviewingCount}
              </Badge>
            )}
          </div>
        ) : (
          <Link key={index} href={item.path} className={linkClassName}>
            <item.icon className={iconClassName} />
            {item.title}
            {item.badge && reviewingCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reviewingCount}
              </Badge>
            )}
          </Link>
        ),
      )}
    </>
  );
}

import { type Session } from "next-auth";
import Signout from "~/app/_components/signout";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

function UserDropdown({ session }: { session: Session | null }) {
  const nameInitial = session?.user.name?.[0] ?? "";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
          <Avatar>
            <AvatarImage />
            <AvatarFallback>{nameInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{session?.user.email}</DropdownMenuLabel>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Signout />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { Menu } from "lucide-react";
import Link from "next/link";

import { headers } from "next/headers";
import BlueXBlueLogo from "~/app/_icons/bluex-blue-logo";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
import AppNavbar from "./app-navbar";

export default async function AppFrame({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const headerList = headers();
  const currentPath = headerList.get("x-current-path") ?? "";

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <BlueXBlueLogo className="h-6 w-6" />
              <span className="">MAOS Admin</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <AppNavbar currentPath={currentPath} currentUserEmail={session?.user.email ?? ""} />
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
                  <BlueXBlueLogo className="h-6 w-6" />
                  <span className="sr-only">MAOS Admin</span>
                </Link>
                <AppNavbar
                  currentPath={currentPath}
                  currentUserEmail={session?.user.email ?? ""}
                  mobile
                />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form> */}
          </div>
          <UserDropdown session={session} />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

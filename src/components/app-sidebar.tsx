"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Archive,
  Clapperboard,
  CircleDollarSign,
  Home,
  Landmark,
  LayoutGrid,
  Menu,
  PackageCheck,
  Settings,
  UserCircle,
  Warehouse,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AppSidebarProps = {
  userEmail?: string | null;
};

const mainLinks = [
  {
    href: "/",
    label: "Overview",
    icon: Home,
  },
  {
    href: "/finance",
    label: "Finance",
    icon: LayoutGrid,
  },
  {
    href: "/finance-assets",
    label: "Finance Assets",
    icon: Landmark,
  },
  {
    href: "/coin-collection",
    label: "Coin Collection",
    icon: CircleDollarSign,
  },
  {
    href: "/gogo-toys",
    label: "Gogo Toys",
    icon: Archive,
  },
  {
    href: "/packaging",
    label: "Packaging",
    icon: PackageCheck,
  },
  {
    href: "/reviews",
    label: "Reviews",
    icon: Clapperboard,
  },
  {
    href: "/warehouse",
    label: "Warehouse",
    icon: Warehouse,
  },
];

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return null;
  }

  const sidebarContent = (
    <>
      <div className="px-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md text-sm font-semibold">
            LO
          </div>
          <div>
            <p className="text-sm leading-5 font-semibold">Life OS</p>
            <p className="text-muted-foreground text-xs">Personal workspace</p>
          </div>
        </Link>
      </div>

      <div className="border-sidebar-border bg-background mt-4 flex items-center gap-2 rounded-md border px-3 py-2">
        <UserCircle className="text-muted-foreground size-4" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">
            {userEmail ?? "Not signed in"}
          </p>
          <p className="text-muted-foreground text-[11px]">
            {userEmail ? "Connected" : "Guest session"}
          </p>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {mainLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex h-9 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Button asChild variant="outline" className="w-full justify-start">
        <Link href="/settings">
          <Settings className="size-4" />
          Configuration
        </Link>
      </Button>
    </>
  );

  return (
    <>
      <header className="border-border bg-background fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md text-xs font-semibold">
            LO
          </div>
          <span className="text-sm font-semibold">Life OS</span>
        </Link>
        <Drawer direction="left">
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon-sm" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="w-80 max-w-[calc(100vw-2rem)]">
            <DrawerClose asChild>
              <div className="flex min-h-[calc(100vh-2rem)] flex-col px-2 py-3">
                {sidebarContent}
              </div>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      </header>

      <aside className="border-border bg-sidebar text-sidebar-foreground hidden w-64 shrink-0 flex-col border-r px-3 py-4 md:flex">
        {sidebarContent}
      </aside>
    </>
  );
}

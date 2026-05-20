"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, LayoutGrid, Settings, UserCircle } from "lucide-react";
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
];

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-border bg-sidebar text-sidebar-foreground flex w-64 shrink-0 flex-col border-r px-3 py-4">
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
    </aside>
  );
}

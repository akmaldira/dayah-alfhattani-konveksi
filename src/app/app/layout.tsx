import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/signin");
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <SidebarInset className="container pt-6 overflow-hidden">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <SidebarTrigger />
            <AppBreadcrumb />
          </div>
          <div>
            <ThemeToggle />
          </div>
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

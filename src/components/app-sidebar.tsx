"use client";

import { signOutAction } from "@/action/auth-action";
import { SidebarItem } from "@/types/type";
import {
  ArrowRightLeft,
  ArrowUpDown,
  Banknote,
  BanknoteArrowUp,
  Box,
  ChevronUp,
  Clock,
  CreditCard,
  HomeIcon,
  ShoppingCart,
  User2,
  UserCheck,
} from "lucide-react";
import { User } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarLogo } from "./sidebar-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";

const sidebarDashboard: SidebarItem[] = [
  {
    type: "single",
    title: "Dashboard",
    href: "/app/dashboard",
    icon: <HomeIcon />,
  },
];

const sidebarItems: SidebarItem[] = [
  {
    type: "single",
    title: "Barang & Varian",
    href: "/app/item",
    icon: <Box />,
  },
  // {
  //   type: "single",
  //   title: "Barang Masuk",
  //   href: "/app/item/in",
  //   icon: <ArrowRightToLine />,
  // },
  // {
  //   type: "single",
  //   title: "Barang Keluar",
  //   href: "/app/item/out",
  //   icon: <ArrowLeftToLine />,
  // },
  {
    type: "single",
    title: "Riwayat Perubahan Stock",
    href: "/app/item/stock-history",
    icon: <ArrowRightLeft />,
  },
];

const sidebarFinance: SidebarItem[] = [
  {
    type: "single",
    title: "Kas",
    href: "/app/finance",
    icon: <Banknote />,
  },
  {
    type: "single",
    title: "Pengeluaran",
    href: "/app/finance/expense",
    icon: <ShoppingCart />,
  },
  {
    type: "single",
    title: "Pemasukan",
    href: "/app/finance/income",
    icon: <BanknoteArrowUp />,
  },
  {
    type: "single",
    title: "Ambilan Karyawan",
    href: "/app/finance/employee-loan",
    icon: <CreditCard />,
  },
  {
    type: "single",
    title: "Riwayat Transaksi",
    href: "/app/finance/transaction",
    icon: <ArrowUpDown />,
  },
];

const sidebarEmployee: SidebarItem[] = [
  {
    type: "single",
    title: "Karyawan",
    href: "/app/employee",
    icon: <User2 />,
  },
  {
    type: "single",
    title: "Kehadiran",
    href: "/app/employee/attendance",
    icon: <UserCheck />,
  },
  {
    type: "single",
    title: "Kerja Harian",
    href: "/app/employee/daily-work",
    icon: <Clock />,
  },
  // {
  //   type: "single",
  //   title: "Gaji / Ambilan",
  //   href: "/app/employee/salary",
  //   icon: <CreditCard />,
  // },
];

function SidebarGroupItem({
  items,
  pathname,
}: {
  items: SidebarItem[];
  pathname: string;
}) {
  return items.map((sidebar) => (
    <SidebarMenuItem key={sidebar.title}>
      {sidebar.type == "single" ? (
        <SidebarMenuButton
          asChild
          isActive={pathname === sidebar.href}
          tooltip={sidebar.title}
        >
          <Link href={sidebar.href}>
            {sidebar.icon}
            <span>{sidebar.title}</span>
          </Link>
        </SidebarMenuButton>
      ) : (
        <>
          <SidebarMenuButton
            isActive={sidebar.items.some((item) => item.href === pathname)}
            tooltip={sidebar.title}
          >
            {sidebar.icon}
            <span>{sidebar.title}</span>
          </SidebarMenuButton>
          <SidebarMenuSub>
            {sidebar.items.map((item) => (
              <SidebarMenuSubItem key={item.title}>
                <SidebarMenuSubButton asChild isActive={item.href === pathname}>
                  <Link href={item.href}>
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </>
      )}
    </SidebarMenuItem>
  ));
}

export function AppSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Aplikasi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroupItem items={sidebarDashboard} pathname={pathname} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Keuangan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroupItem items={sidebarFinance} pathname={pathname} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Inventory</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroupItem items={sidebarItems} pathname={pathname} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Karyawan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarGroupItem items={sidebarEmployee} pathname={pathname} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user?.name}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/app">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => signOutAction()}
                >
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

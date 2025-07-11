import React from "react";

export type SidebarItemSingle = {
  type: "single";
  title: string;
  href: string;
  icon: React.ReactNode;
};

export type SidebarItemGroup = {
  type: "group";
  title: string;
  icon: React.ReactNode;
  items: Omit<SidebarItemSingle, "icon" | "type">[];
};

export type SidebarItem = SidebarItemSingle | SidebarItemGroup;

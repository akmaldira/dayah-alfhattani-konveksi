"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { pathnameToLabel } from "@/lib/utils";
import { usePathname } from "next/navigation";
import React from "react";

export function AppBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;

    return (
      <React.Fragment key={index}>
        <BreadcrumbItem>
          {isLast ? (
            <BreadcrumbPage>{pathnameToLabel(segment)}</BreadcrumbPage>
          ) : (
            <>
              <BreadcrumbLink href={href}>
                {pathnameToLabel(segment)}
              </BreadcrumbLink>
            </>
          )}
        </BreadcrumbItem>
        {!isLast && <BreadcrumbSeparator />}
      </React.Fragment>
    );
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbItems}</BreadcrumbList>
    </Breadcrumb>
  );
}

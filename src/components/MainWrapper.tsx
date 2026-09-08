"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <main className="flex-1 w-full min-h-screen">{children}</main>;
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      {children}
    </main>
  );
}

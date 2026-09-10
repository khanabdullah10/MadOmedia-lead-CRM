"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MadOMediaLogo from "./MadOMediaLogo";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide the navigation header entirely on the login page
  if (pathname === "/login") {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/login";
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Pipeline", href: "/pipeline" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Left: Brand Identity */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-90"
        >
          <MadOMediaLogo size="sm" theme="light" showCrmBadge={true} />
        </Link>

        {/* Center/Right: Navigation Items */}
        <div className="flex items-center gap-1 sm:gap-2">
          <nav className="flex items-center gap-0.5 text-sm">
            {navLinks.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-1.5 font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-stone-100 text-stone-900 font-semibold"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Import Leads Link */}
            <Link
              href="/leads/import"
              title="Import leads from Excel or CSV"
              className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors duration-150 ${
                pathname === "/leads/import"
                  ? "bg-stone-100 text-stone-900 font-semibold"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <svg
                className="h-4 w-4 text-stone-400 group-hover:text-stone-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12"
                />
              </svg>
              <span>Import</span>
            </Link>

            {/* Direct Native Export CSV Link (Fixes previous router interception) */}
            <a
              href="/api/export"
              download
              title="Download full leads CSV export"
              className="group flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium text-stone-600 transition-colors duration-150 hover:bg-stone-50 hover:text-stone-900"
            >
              <svg
                className="h-4 w-4 text-stone-400 group-hover:text-stone-600 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Export CSV</span>
            </a>

            {/* + Add Lead Button */}
            <Link
              href="/leads/new"
              className="ml-1 rounded-lg bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-purple-600/25 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:shadow-purple-600/35"
            >
              + Add Lead
            </Link>
          </nav>

          {/* User Profile Badge & Logout */}
          <div className="ml-2 flex items-center gap-2 border-l border-stone-200 pl-3">
            <div
              className="flex items-center gap-2 rounded-full border border-stone-200/80 bg-stone-50/80 py-1 pl-1 pr-2.5"
              title="Logged in as Rahil (Administrator)"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 text-[11px] font-bold text-white">
                R
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-stone-800 leading-tight">
                  Rahil
                </span>
                <span className="text-[10px] text-stone-500 leading-tight">
                  Admin
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

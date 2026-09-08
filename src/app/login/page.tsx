"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MadOMediaLogo from "@/components/MadOMediaLogo";

export default function LoginPage() {
  const router = useRouter();

  // Theme state: defaults to "light" to match CRM inner theme, with instant toggle to "dark"
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // User input credentials (starts completely empty, as requested)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & loading states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Restore saved theme preference if previously chosen
  useEffect(() => {
    const savedTheme = localStorage.getItem("madomedia_theme") as
      | "light"
      | "dark"
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("madomedia_theme", nextTheme);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid username or password");
        setIsLoading(false);
        return;
      }

      // Login successful -> redirect to home/pipeline
      router.push("/");
      router.refresh();
    } catch {
      setError("Unable to connect to the authentication service.");
      setIsLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden flex flex-col justify-between transition-colors duration-300 font-sans ${
        isDark
          ? "bg-[#070708] text-white selection:bg-cyan-500 selection:text-white"
          : "bg-[#FAF9F7] text-stone-900 selection:bg-sky-500 selection:text-white"
      }`}
    >
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isDark ? (
          <>
            {/* Dark Mode Neon Glows */}
            <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#FF1E56]/20 via-[#00B4FF]/15 to-transparent blur-[130px] animate-pulse" />
            <div
              className="absolute -bottom-32 -right-32 h-[550px] w-[550px] rounded-full bg-gradient-to-tl from-[#FF8A00]/20 via-[#00B4FF]/15 to-transparent blur-[140px]"
              style={{ animationDuration: "9s" }}
            />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-[#00B4FF]/10 blur-[150px]" />
            {/* Tech grid texture */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
          </>
        ) : (
          <>
            {/* Light Mode Soft Glows */}
            <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-rose-200/35 via-sky-200/30 to-transparent blur-[120px]" />
            <div className="absolute -bottom-32 -right-32 h-[550px] w-[550px] rounded-full bg-gradient-to-tl from-amber-200/35 via-cyan-200/30 to-transparent blur-[130px]" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[650px] rounded-full bg-indigo-100/40 blur-[140px]" />
            {/* Light tech grid texture */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, #000000 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />
          </>
        )}
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <a
          href="https://mad0media.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-transform duration-200 hover:scale-[1.02]"
        >
          <MadOMediaLogo
            size="md"
            showTagline={true}
            theme={theme}
            showCrmBadge={true}
          />
        </a>

        {/* Header Actions: Theme Switcher & Status Pill */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            type="button"
            title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 shadow-sm ${
              isDark
                ? "border border-white/15 bg-white/[0.06] text-zinc-200 hover:bg-white/10 hover:border-white/25"
                : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300"
            }`}
          >
            {isDark ? (
              <>
                <svg
                  className="h-4 w-4 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* System Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium backdrop-blur-md ${
              isDark
                ? "border border-white/10 bg-white/[0.03] text-zinc-300"
                : "border border-stone-200/80 bg-white/70 text-stone-600"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Offline CRM</span>
          </div>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 mx-auto flex w-full max-w-[490px] flex-1 flex-col justify-center px-4 py-8">
        <div
          className={`relative rounded-3xl p-8 sm:p-10 transition-all duration-300 backdrop-blur-2xl ${
            isDark
              ? "border border-white/10 bg-zinc-950/75 shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(0,180,255,0.1)]"
              : "border border-stone-200/90 bg-white/85 shadow-[0_20px_50px_rgba(28,25,23,0.06),0_1px_3px_rgba(0,0,0,0.05)]"
          }`}
        >
          {/* Subtle Top Accent Line */}
          <div
            className="absolute inset-x-8 top-0 h-[2px]"
            style={{
              background: isDark
                ? "linear-gradient(90deg, transparent, #FF1E56, #00B4FF, transparent)"
                : "linear-gradient(90deg, transparent, #FF1E56, #0284C7, transparent)",
            }}
          />

          {/* Welcome Header */}
          <div className="text-center flex flex-col items-center">
            {/* Official Brand Logo matching navbar in light mode */}
            <div className="mb-3">
              <MadOMediaLogo
                variant={isDark ? "icon" : "full"}
                theme={theme}
                size="md"
              />
            </div>

            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wider uppercase ${
                isDark
                  ? "border border-sky-500/30 bg-sky-500/10 text-sky-300"
                  : "border border-sky-200 bg-sky-50 text-sky-700"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              Lead Management System
            </div>

            {/* Single Line Welcome Headline */}
            <h1
              className={`mt-3.5 text-2xl sm:text-[1.75rem] font-extrabold tracking-tight whitespace-nowrap ${
                isDark ? "text-white" : "text-stone-900"
              }`}
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              Welcome to{" "}
              <span
                style={{
                  color: isDark ? "#00B4FF" : "#0284C7",
                }}
              >
                MAD O MEDIA
              </span>
            </h1>

            <p
              className={`mt-2 text-xs leading-relaxed max-w-sm mx-auto ${
                isDark ? "text-zinc-400" : "text-stone-500"
              }`}
            >
              Strategy, creativity and digital experiences built to make your
              brand impossible to ignore.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300 animate-fade-in">
              <svg
                className="h-4 w-4 shrink-0 text-rose-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {/* Username Field */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? "text-zinc-300" : "text-stone-700"
                }`}
              >
                Username
              </label>
              <div className="relative">
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${
                    isDark ? "text-zinc-500" : "text-stone-400"
                  }`}
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 ${
                    isDark
                      ? "border border-white/10 bg-white/[0.04] text-white placeholder-zinc-500 focus:border-sky-500 focus:bg-white/[0.06] focus:ring-sky-500/20"
                      : "border border-stone-300 bg-stone-50/70 text-stone-900 placeholder-stone-400 focus:border-sky-600 focus:bg-white focus:ring-sky-600/20"
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? "text-zinc-300" : "text-stone-700"
                }`}
              >
                Password
              </label>
              <div className="relative">
                <div
                  className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 ${
                    isDark ? "text-zinc-500" : "text-stone-400"
                  }`}
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                    isDark
                      ? "border border-white/10 bg-white/[0.04] text-white placeholder-zinc-500 focus:border-sky-500 focus:bg-white/[0.06] focus:ring-sky-500/20"
                      : "border border-stone-300 bg-stone-50/70 text-stone-900 placeholder-stone-400 focus:border-sky-600 focus:bg-white focus:ring-sky-600/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 flex items-center pr-3.5 transition-colors ${
                    isDark
                      ? "text-zinc-400 hover:text-zinc-200"
                      : "text-stone-400 hover:text-stone-700"
                  }`}
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label
                className={`flex items-center gap-2 cursor-pointer select-none text-xs ${
                  isDark
                    ? "text-zinc-400 hover:text-zinc-300"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-300 text-sky-600 focus:ring-sky-500/20"
                />
                Remember me on this laptop
              </label>

              <span
                className={`text-[11px] font-medium ${
                  isDark ? "text-zinc-500" : "text-stone-400"
                }`}
              >
                Admin Access
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`mt-4 relative w-full overflow-hidden rounded-xl p-[1px] font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 ${
                isDark
                  ? "shadow-sky-500/20 hover:shadow-sky-500/35"
                  : "shadow-sky-600/25 hover:shadow-sky-600/35"
              }`}
              style={{
                background:
                  "linear-gradient(135deg, #FF1E56 0%, #00B4FF 50%, #FF8A00 100%)",
              }}
            >
              <div
                className="flex items-center justify-center gap-2 rounded-[11px] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #FF1E56 0%, #0084FF 100%)"
                    : "linear-gradient(135deg, #0284C7 0%, #4F46E5 100%)",
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to CRM</span>
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
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 mx-auto w-full max-w-6xl px-6 py-6 text-center text-xs transition-colors ${
          isDark ? "text-zinc-500" : "text-stone-500"
        }`}
      >
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t pt-4 ${
            isDark ? "border-white/5" : "border-stone-200"
          }`}
        >
          <p>© {new Date().getFullYear()} MAD O MEDIA. All rights reserved.</p>
          <div
            className={`flex items-center gap-3 text-[11px] ${
              isDark ? "text-zinc-400" : "text-stone-500"
            }`}
          >
            <a
              href="https://mad0media.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors"
            >
              mad0media.com
            </a>
            <span>•</span>
            <span>Local Database Storage</span>
            <span>•</span>
            <span>Secure Admin Session</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

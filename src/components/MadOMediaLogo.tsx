import React from "react";

interface MadOMediaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  theme?: "dark" | "light";
  className?: string;
  showCrmBadge?: boolean;
  variant?: "full" | "icon";
}

export default function MadOMediaLogo({
  size = "md",
  theme = "dark",
  className = "",
  showCrmBadge = false,
  variant = "full",
}: MadOMediaLogoProps) {
  const isDark = theme === "dark";

  // Sizing styles
  const fullHeights = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
    xl: "h-14",
  };

  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  if (variant === "icon") {
    const iconSrc = isDark
      ? "/mad-o-media-icon.png"
      : "/mad-o-media-icon-light.png";

    return (
      <div className={`inline-flex items-center ${className}`}>
        <img
          src={iconSrc}
          alt="MAD O MEDIA Icon"
          className={`${iconSizes[size]} object-contain drop-shadow-md transition-transform duration-200 hover:scale-105`}
        />
      </div>
    );
  }

  // Choose the optimal variant of the official logo
  const logoSrc = isDark
    ? "/mad-o-media-logo-dark.png"
    : "/mad-o-media-logo-light.png";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoSrc}
        alt="MAD O MEDIA"
        className={`${fullHeights[size]} w-auto object-contain shrink-0 transition-transform duration-200 hover:scale-[1.02]`}
      />

      {showCrmBadge && (
        <span
          className={`rounded-md font-bold tracking-wider uppercase text-[10px] px-2 py-0.5 ${
            isDark
              ? "bg-[#00B4FF]/15 text-[#00B4FF] border border-[#00B4FF]/30"
              : "bg-stone-100 text-stone-700 border border-stone-200"
          }`}
        >
          CRM
        </span>
      )}
    </div>
  );
}

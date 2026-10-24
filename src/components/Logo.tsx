import React from "react";

interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon";
  variant?: "full" | "icon" | "wordmark";
  className?: string;
  showText?: boolean;
  textColor?: string;
}

const SIZE_MAP: Record<string, { container: string; text: string; iconWidth: number; iconHeight: number }> = {
  xs: { container: "w-6 h-6", text: "text-xs", iconWidth: 20, iconHeight: 20 },
  sm: { container: "w-8 h-8", text: "text-sm", iconWidth: 26, iconHeight: 26 },
  md: { container: "w-10 h-10", text: "text-base", iconWidth: 34, iconHeight: 34 },
  lg: { container: "w-12 h-12", text: "text-lg", iconWidth: 42, iconHeight: 42 },
  xl: { container: "w-16 h-16", text: "text-2xl", iconWidth: 54, iconHeight: 54 },
  icon: { container: "w-10 h-10", text: "text-base", iconWidth: 34, iconHeight: 34 },
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  variant = "full",
  className = "",
  showText = true,
  textColor = "",
}) => {
  const s = SIZE_MAP[size] || SIZE_MAP.md;

  const SvgIcon: React.FC = () => (
    <svg
      width={s.iconWidth}
      height={s.iconHeight}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
    >
      <g transform="translate(10, 0)">
        {/* 3D Mortarboard Cap */}
        <polygon points="65,22 120,44 65,66 10,44" fill="#164CE8" />
        <polygon points="65,22 120,44 65,49 10,44" fill="#2059FF" />
        <path d="M36,54 L36,66 C36,74 94,74 94,66 L94,54 Z" fill="#0E38B5" />
        <circle cx="65" cy="44" r="3" fill="#0E38B5" />
        <path d="M65,44 Q108,46 108,68 L108,76" stroke="#164CE8" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="108" cy="80" r="4.5" fill="#164CE8" />

        {/* Left Pillar (Main L Stem) */}
        <path d="M22,72 L48,72 L48,124 L22,132 Z" fill="#164CE8" />

        {/* Center/Right Pillar Column & Dot */}
        <path d="M60,82 C60,78 68,78 68,82 L68,122 L60,124 Z" fill="#164CE8" />
        <circle cx="64" cy="74" r="5" fill="#164CE8" />
        <circle cx="82" cy="76" r="4.5" fill="#164CE8" />

        {/* Vibrant Orange Sail / Page Curve */}
        <path d="M48,82 Q60,94 62,118 L48,122 Z" fill="#FA5C26" />

        {/* Flowing Base Waves (Dual Waves) */}
        <path d="M22,126 Q50,114 80,128 T140,118 L140,132 Q105,128 80,146 T22,148 Z" fill="#164CE8" />
        <path d="M22,142 Q50,132 80,144 T140,134 L140,146 Q105,142 80,158 T22,158 Z" fill="#2059FF" />
      </g>
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={`${s.container} flex items-center justify-center shrink-0 ${className}`}>
        <SvgIcon />
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 shrink-0 ${className}`}>
        <SvgIcon />
        {showText && (
          <span className={`font-black tracking-tight ${textColor || "text-slate-900 dark:text-white"} ${s.text} whitespace-nowrap`}>
            <span className="text-[#164CE8] dark:text-[#3B82F6]">Livingstone</span>
            <span className="text-[#FA5C26]">edu</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 shrink-0 ${className}`}>
      <SvgIcon />
      {showText && (
        <span className={`font-black tracking-tight ${s.text} select-none whitespace-nowrap`}>
          <span className="text-[#164CE8] dark:text-[#3B82F6]">Livingstone</span>
          <span className="text-[#FA5C26]">edu</span>
        </span>
      )}
    </div>
  );
};

export default Logo;

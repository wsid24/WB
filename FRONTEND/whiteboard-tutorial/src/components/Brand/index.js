import { useContext } from "react";
import themeContext from "../../store/theme-context";

export const BrandMark = ({ size = 28, className = "" }) => {
  const { isDarkMode } = useContext(themeContext);
  const fg = isDarkMode ? "#000" : "#fff";
  const bg = isDarkMode ? "#fff" : "#000";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="0" y="0" width="32" height="32" rx="8" fill={bg} />
      <path
        d="M8 22 L22 8"
        stroke={fg}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="8.5" cy="22" r="1.6" fill={fg} />
      <circle cx="22" cy="8.5" r="1.6" fill={fg} />
    </svg>
  );
};

const Brand = ({ size = 28, showWordmark = true, subtitle, className = "" }) => {
  const { isDarkMode } = useContext(themeContext);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BrandMark size={size} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight text-[1.35rem] ${
              isDarkMode ? "text-white" : "text-black"
            }`}
            style={{ letterSpacing: "-0.04em" }}
          >
            Slate
          </span>
          {subtitle && (
            <span
              className={`text-[10px] uppercase tracking-[0.2em] mt-1 ${
                isDarkMode ? "text-white/50" : "text-black/50"
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Brand;

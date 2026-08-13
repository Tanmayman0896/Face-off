export default function FootballLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const containerClasses = {
    sm: "w-8 h-8 border-2 shadow-[2px_2px_0px_0px_#000]",
    md: "w-10 h-10 border-3 shadow-[3px_3px_0px_0px_#000]",
    lg: "w-14 h-14 border-4 shadow-[4px_4px_0px_0px_#000]",
  }[size];

  const svgClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-9 h-9",
  }[size];

  return (
    <div
      className={`bg-[#ffe600] border-black flex items-center justify-center font-black ${containerClasses}`}
    >
      <svg
        className={`${svgClasses} text-black`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Outer Ball */}
        <circle cx="12" cy="12" r="9.5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
        {/* Center Pentagon */}
        <polygon points="12,7.5 14.5,9.5 13.5,12.5 10.5,12.5 9.5,9.5" fill="#000000" stroke="#000000" />
        {/* Seam Lines */}
        <line x1="12" y1="7.5" x2="12" y2="2.5" stroke="#000000" strokeWidth="2" />
        <line x1="14.5" y1="9.5" x2="19" y2="8" stroke="#000000" strokeWidth="2" />
        <line x1="13.5" y1="12.5" x2="16.5" y2="17" stroke="#000000" strokeWidth="2" />
        <line x1="10.5" y1="12.5" x2="7.5" y2="17" stroke="#000000" strokeWidth="2" />
        <line x1="9.5" y1="9.5" x2="5" y2="8" stroke="#000000" strokeWidth="2" />
      </svg>
    </div>
  );
}

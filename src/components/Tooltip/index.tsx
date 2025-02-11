import { cn } from "../../utils/cn";

interface TooltipProps {
  content: string;
  position: "top" | "bottom";
}

const Tooltip = ({ content, position }: TooltipProps) => {
  const tooltipClasses = cn(
    "tooltip absolute left-1/2 px-2 py-1 bg-[#212121] text-[#F9F9F9] text-xs rounded-md whitespace-nowrap z-10 transform -translate-x-1/2",
    position === "top" ? "bottom-full mb-3" : "top-full mt-3"
  );

  const arrowClasses = cn(
    "absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent",
    position === "top"
      ? "top-full border-t-4 border-t-[#212121]"
      : "bottom-full border-b-4 border-b-[#212121]"
  );

  return (
    <div className={tooltipClasses}>
      {content}
      <div className={arrowClasses}></div>
    </div>
  );
};

export default Tooltip;

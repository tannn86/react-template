import { Unit } from "../../enums/unit";

interface ButtonProps {
  unit: Unit;
  content: Unit;
  handleUnitChange: (unit: Unit) => void;
}

const Button = ({ content, unit, handleUnitChange }: ButtonProps) => {
  const isActive = content === unit;
  return (
    <button
      className={`flex-1 rounded-md cursor-pointer text-center p-1.5 ${
        isActive ? "bg-[#424242] text-[#F9F9F9]" : "text-[#AAAAAA]"
      }`}
      onClick={() => handleUnitChange(content)}
    >
      {content}
    </button>
  );
};

export default Button;

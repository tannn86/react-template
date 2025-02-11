import { useState } from "react";
import UnitButton from "./UnitButton";
import { Unit } from "../../enums/unit";
import { cn } from "../../utils/cn";
import Tooltip from "../Tooltip";

export default function UnitInput() {
  const [unit, setUnit] = useState<Unit>(Unit.PERCENT);
  const [value, setValue] = useState<string>("1.0");
  const [prevValidValue, setPrevValidValue] = useState<string>("1.0");
  const [isInputHovered, setIsInputHovered] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const handleBlur = () => {
    let fixedValue = value;

    // If value < 0, set to 0
    if (parseFloat(fixedValue) < 0) {
      fixedValue = "0";
    }

    // If unit is % and value > 100, revert to previous valid value
    if (unit === Unit.PERCENT && parseFloat(fixedValue) > 100) {
      fixedValue = prevValidValue;
    }

    setValue(fixedValue);
    setIsInputFocused(false);
  };

  const handleFocus = () => {
    setIsInputFocused(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Find the first character that is not 0-9, comma, dot, or minus
    const invalidCharIndex = inputValue.search(/[^0-9.,-]/);

    let filteredValue;

    if (invalidCharIndex === 0) {
      // Starts with invalid character (like "a123") -> use previous valid value
      setValue(prevValidValue);
      return;
    } else if (invalidCharIndex > 0) {
      // Invalid character found in middle (like "12a3") -> truncate at that position
      filteredValue = inputValue.substring(0, invalidCharIndex);
    } else {
      // No invalid characters found
      filteredValue = inputValue;
    }

    // Handle minus sign - only allow at the beginning
    if (filteredValue.includes("-")) {
      const minusIndex = filteredValue.indexOf("-");
      if (minusIndex === 0) {
        // Keep minus at beginning and remove any other minus signs
        filteredValue = "-" + filteredValue.slice(1).replace(/-/g, "");
      } else {
        // Remove all minus signs if not at beginning
        filteredValue = filteredValue.replace(/-/g, "");
      }
    }

    // Replace comma with dot
    let sanitizedValue = filteredValue.replace(/,/g, ".");

    // Handle multiple dots - keep only the first one
    const parts = sanitizedValue.split(".");
    if (parts.length > 2) {
      sanitizedValue = parts[0] + "." + parts.slice(1).join("");
    }

    setValue(sanitizedValue);

    const isValueValid =
      (unit === Unit.PERCENT &&
        parseFloat(sanitizedValue) >= 0 &&
        parseFloat(sanitizedValue) <= 100) ||
      (unit === Unit.PX && parseFloat(sanitizedValue) >= 0);

    if (isValueValid) {
      setPrevValidValue(sanitizedValue);
    }
  };

  const handleIncrement = () => {
    const newValue = (parseFloat(value) + 1).toFixed(1);

    // Don't increment if it would exceed limits
    if (unit === Unit.PERCENT && parseFloat(newValue) > 100) return;

    setValue(newValue);
    setPrevValidValue(newValue);
  };

  const handleDecrement = () => {
    let newValue = (parseFloat(value) - 1).toFixed(1);

    if (parseFloat(newValue) < 0) {
      newValue = "0";
    }

    setValue(newValue);
    setPrevValidValue(newValue);
  };

  const handleUnitChange = (val: Unit) => {
    let updatedValue = value;

    // If switching to % and current value > 100, set to 100
    if (val === Unit.PERCENT && parseFloat(updatedValue) > 100) {
      updatedValue = "100";
    }

    setUnit(val);
    setValue(updatedValue);
    setPrevValidValue(updatedValue);
  };

  // Check if decrease button should be disabled
  const isDecreaseDisabled = parseFloat(value) <= 0;

  // Check if increase button should be disabled
  const isIncreaseDisabled = unit === Unit.PERCENT && parseFloat(value) >= 100;

  // Dynamic class for parent div based on input states
  const getParentDivClass = () => {
    return cn("w-[8.75rem] flex rounded-[8px]", {
      "bg-[#212121] ring-2 ring-blue-500": isInputFocused,
      "bg-[#3B3B3B]": isInputHovered && !isInputFocused,
      "bg-[#212121]": !isInputFocused && !isInputHovered,
    });
  };

  return (
    <div className="w-[17.5rem] h-[7.5rem] bg-[#151515] p-4">
      <div className="flex justify-between items-center gap-2 mb-4">
        <label className="text-xs leading-5 text-[#AAAAAA]">Unit</label>
        <div className="w-[8.75rem] flex p-0.5 gap-0.5 bg-[#212121] rounded-[8px]">
          {Object.values(Unit).map((content) => (
            <UnitButton
              key={content}
              content={content}
              unit={unit}
              handleUnitChange={handleUnitChange}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between items-center gap-2">
        <label className="text-xs leading-5 text-[#AAAAAA]">Value</label>
        <div className="relative">
          {/* Decrease tooltip */}

          <div className={getParentDivClass()}>
            <button
              onClick={handleDecrement}
              disabled={isDecreaseDisabled}
              className={cn(
                "relative p-2 rounded-tl-[8px] rounded-bl-[8px] has-tooltip",
                {
                  "cursor-not-allowed": isDecreaseDisabled,
                  "hover:bg-[#3B3B3B]": !isDecreaseDisabled,
                }
              )}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4 9.75C4 9.33579 4.33579 9 4.75 9L15.25 9C15.6642 9 16 9.33579 16 9.75C16 10.1642 15.6642 10.5 15.25 10.5H4.75C4.33579 10.5 4 10.1642 4 9.75Z"
                  fill={isDecreaseDisabled ? "#AAAAAA" : "#F9F9F9"}
                />
              </svg>

              {isDecreaseDisabled && (
                <Tooltip content="Value must greater than 0" position="top" />
              )}
            </button>

            <input
              type="string"
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              onMouseEnter={() => setIsInputHovered(true)}
              onMouseLeave={() => setIsInputHovered(false)}
              className="flex-1 w-full bg-transparent text-xs leading-5 text-[#F9F9F9] text-center outline-none border-0"
            />

            <button
              onClick={handleIncrement}
              disabled={isIncreaseDisabled}
              className={cn(
                "relative p-2 rounded-tr-[8px] rounded-br-[8px] has-tooltip",
                {
                  "cursor-not-allowed": isIncreaseDisabled,
                  "hover:bg-[#3B3B3B]": !isIncreaseDisabled,
                }
              )}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.75 4.75C10.75 4.33579 10.4142 4 10 4C9.58579 4 9.25 4.33579 9.25 4.75V9.25H4.75C4.33579 9.25 4 9.58579 4 10C4 10.4142 4.33579 10.75 4.75 10.75H9.25L9.25 15.25C9.25 15.6642 9.58579 16 10 16C10.4142 16 10.75 15.6642 10.75 15.25V10.75H15.25C15.6642 10.75 16 10.4142 16 10C16 9.58579 15.6642 9.25 15.25 9.25H10.75V4.75Z"
                  fill={isIncreaseDisabled ? "#AAAAAA" : "#F9F9F9"}
                />
              </svg>

              {isIncreaseDisabled && (
                <Tooltip content="Value must smaller than 100" position="top" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

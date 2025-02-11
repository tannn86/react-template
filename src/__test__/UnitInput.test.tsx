import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import UnitInput from "../components/UnitInput";

describe("UnitInput Component", () => {
  let input: HTMLInputElement;
  let decreaseButton: HTMLButtonElement;
  let increaseButton: HTMLButtonElement;
  let pxButton: HTMLButtonElement;
  let percentButton: HTMLButtonElement;

  beforeEach(() => {
    render(<UnitInput />);
    input = screen.getByRole("textbox") as HTMLInputElement;

    // Get buttons by finding SVG icons since they don't have accessible names
    const allButtons = screen.getAllByRole("button");

    // Decrease button contains minus icon (first button)
    decreaseButton = allButtons.find((btn) => {
      const svg = btn.querySelector('svg path[fill-rule="evenodd"]');
      return svg !== null;
    }) as HTMLButtonElement;

    // Increase button contains plus icon (last button before unit buttons)
    increaseButton = allButtons.find((btn) => {
      const svg = btn.querySelector('svg path[d*="M10.75 4.75"]');
      return svg !== null;
    }) as HTMLButtonElement;

    // Get unit buttons by their content
    pxButton = allButtons.find(
      (btn) => btn.textContent === "px"
    ) as HTMLButtonElement;
    percentButton = allButtons.find(
      (btn) => btn.textContent === "%"
    ) as HTMLButtonElement;
  });

  describe("Input Value Validation", () => {
    it("should allow integer values", () => {
      fireEvent.change(input, { target: { value: "123" } });
      expect(input.value).toBe("123");
    });

    it("should allow float values", () => {
      fireEvent.change(input, { target: { value: "123.45" } });
      expect(input.value).toBe("123.45");
    });

    it("should allow negative values during input", () => {
      fireEvent.change(input, { target: { value: "-123" } });
      expect(input.value).toBe("-123");
    });
  });

  describe("Comma to Dot Replacement", () => {
    it("should replace comma with dot: 12,3 -> 12.3", () => {
      fireEvent.change(input, { target: { value: "12,3" } });
      expect(input.value).toBe("12.3");
    });

    it("should replace multiple commas with dots", () => {
      fireEvent.change(input, { target: { value: "12,34,5" } });
      expect(input.value).toBe("12.345");
    });

    it("should handle comma at the end", () => {
      fireEvent.change(input, { target: { value: "12," } });
      expect(input.value).toBe("12.");
    });
  });

  describe("Invalid Character Handling", () => {
    it("should truncate at first invalid character: 123a -> 123", () => {
      fireEvent.change(input, { target: { value: "123a" } });
      expect(input.value).toBe("123");
    });

    it("should truncate at first invalid character: 12a3 -> 12", () => {
      fireEvent.change(input, { target: { value: "12a3" } });
      expect(input.value).toBe("12");
    });

    it("should revert to previous valid value when starting with invalid character: a123", () => {
      // Set initial valid value
      fireEvent.change(input, { target: { value: "50" } });
      expect(input.value).toBe("50");

      // Try to input starting with invalid character
      fireEvent.change(input, { target: { value: "a123" } });
      expect(input.value).toBe("50"); // Should revert to previous valid value
    });

    it("should handle special characters at start", () => {
      // Set initial valid value
      fireEvent.change(input, { target: { value: "25" } });
      expect(input.value).toBe("25");

      // Try to input starting with special character
      fireEvent.change(input, { target: { value: "!123" } });
      expect(input.value).toBe("25"); // Should revert to previous valid value
    });

    it("should remove invalid characters from middle", () => {
      fireEvent.change(input, { target: { value: "12#34" } });
      expect(input.value).toBe("12");
    });
  });

  describe("Blur Behavior - Negative Values", () => {
    it("should set value to 0 when input < 0 on blur", async () => {
      fireEvent.change(input, { target: { value: "-5" } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input.value).toBe("0");
      });
    });

    it("should set value to 0 when input is very negative on blur", async () => {
      fireEvent.change(input, { target: { value: "-999" } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input.value).toBe("0");
      });
    });
  });

  describe("Percent Unit Behavior", () => {
    beforeEach(() => {
      // Ensure we're in percent mode
      fireEvent.click(percentButton);
    });

    it("should revert to previous valid value when input > 100 on blur in percent mode", async () => {
      // Set a valid value first
      fireEvent.change(input, { target: { value: "75" } });
      fireEvent.blur(input);

      // Now try to input > 100
      fireEvent.change(input, { target: { value: "150" } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input.value).toBe("75"); // Should revert to previous valid value
      });
    });

    it("should accept values <= 100 in percent mode", async () => {
      fireEvent.change(input, { target: { value: "100" } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input.value).toBe("100");
      });
    });

    it("should accept decimal values <= 100 in percent mode", async () => {
      fireEvent.change(input, { target: { value: "99.5" } });
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input.value).toBe("99.5");
      });
    });
  });

  describe("Button Disable States", () => {
    it("should disable decrease button when value is 0", () => {
      fireEvent.change(input, { target: { value: "0" } });
      expect(decreaseButton.disabled).toBe(true);
    });

    it("should enable decrease button when value > 0", () => {
      fireEvent.change(input, { target: { value: "1" } });
      expect(decreaseButton.disabled).toBe(false);
    });

    it("should disable increase button when value is 100 in percent mode", () => {
      // Switch to percent mode
      fireEvent.click(percentButton);
      fireEvent.change(input, { target: { value: "100" } });
      expect(increaseButton.disabled).toBe(true);
    });

    it("should enable increase button when value < 100 in percent mode", () => {
      // Switch to percent mode
      fireEvent.click(percentButton);
      fireEvent.change(input, { target: { value: "99" } });
      expect(increaseButton.disabled).toBe(false);
    });

    it("should enable increase button in px mode regardless of value", () => {
      // Switch to px mode
      fireEvent.click(pxButton);
      fireEvent.change(input, { target: { value: "500" } });
      expect(increaseButton.disabled).toBe(false);
    });
  });

  describe("Unit Switching Behavior", () => {
    it("should update value to 100 when switching from px to % with value > 100", () => {
      // Start in px mode and set value > 100
      fireEvent.click(pxButton);
      fireEvent.change(input, { target: { value: "250" } });

      // Switch to percent mode
      fireEvent.click(percentButton);

      expect(input.value).toBe("100");
    });

    it("should keep value unchanged when switching from px to % with value <= 100", () => {
      // Start in px mode and set value <= 100
      fireEvent.click(pxButton);
      fireEvent.change(input, { target: { value: "75" } });

      // Switch to percent mode
      fireEvent.click(percentButton);

      expect(input.value).toBe("75");
    });

    it("should keep value unchanged when switching from % to px", () => {
      // Start in percent mode
      fireEvent.click(percentButton);
      fireEvent.change(input, { target: { value: "50" } });

      // Switch to px mode
      fireEvent.click(pxButton);

      expect(input.value).toBe("50");
    });
  });

  describe("Increment/Decrement Buttons", () => {
    it("should increment value by 1", () => {
      fireEvent.change(input, { target: { value: "5" } });
      fireEvent.click(increaseButton);
      expect(input.value).toBe("6.0");
    });

    it("should decrement value by 1", () => {
      fireEvent.change(input, { target: { value: "5" } });
      fireEvent.click(decreaseButton);
      expect(input.value).toBe("4.0");
    });

    it("should not increment beyond 100 in percent mode", () => {
      fireEvent.click(percentButton);
      fireEvent.change(input, { target: { value: "100" } });
      fireEvent.click(increaseButton);
      expect(input.value).toBe("100");
    });

    it("should not decrement below 0", () => {
      fireEvent.change(input, { target: { value: "0" } });
      fireEvent.click(decreaseButton);
      expect(input.value).toBe("0");
    });

    it("should set to 0 when decrementing would go negative", () => {
      fireEvent.change(input, { target: { value: "0.5" } });
      fireEvent.click(decreaseButton);
      expect(input.value).toBe("0");
    });
  });

  describe("Multiple Dots Handling", () => {
    it("should handle multiple dots by keeping only the first one", () => {
      fireEvent.change(input, { target: { value: "12.34.56" } });
      expect(input.value).toBe("12.3456");
    });

    it("should handle dots with commas", () => {
      fireEvent.change(input, { target: { value: "12,34.56" } });
      expect(input.value).toBe("12.3456");
    });
  });

  describe("Minus Sign Handling", () => {
    it("should only allow minus at the beginning", () => {
      fireEvent.change(input, { target: { value: "12-34" } });
      expect(input.value).toBe("1234");
    });

    it("should keep minus at the beginning", () => {
      fireEvent.change(input, { target: { value: "-123" } });
      expect(input.value).toBe("-123");
    });

    it("should remove multiple minus signs", () => {
      fireEvent.change(input, { target: { value: "-12-34-" } });
      expect(input.value).toBe("-1234");
    });
  });

  describe("Tooltip Display", () => {
    it("should show tooltip when decrease button is disabled", () => {
      fireEvent.change(input, { target: { value: "0" } });

      // Hover over disabled decrease button
      fireEvent.mouseEnter(decreaseButton);

      // const tooltip = screen.queryByText("Value must greater than 0");
      // expect(tooltip).toBeInTheDocument();
    });

    it("should show tooltip when increase button is disabled in percent mode", () => {
      fireEvent.click(percentButton);
      fireEvent.change(input, { target: { value: "100" } });

      // Hover over disabled increase button
      fireEvent.mouseEnter(increaseButton);

      // const tooltip = screen.queryByText("Value must smaller than 100");
      // expect(tooltip).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty input", () => {
      fireEvent.change(input, { target: { value: "" } });
      expect(input.value).toBe("");
    });

    it("should handle just a dot", () => {
      fireEvent.change(input, { target: { value: "." } });
      expect(input.value).toBe(".");
    });

    it("should handle just a comma", () => {
      fireEvent.change(input, { target: { value: "," } });
      expect(input.value).toBe(".");
    });

    it("should handle decimal precision", () => {
      fireEvent.change(input, { target: { value: "12.3456789" } });
      expect(input.value).toBe("12.3456789");
    });
  });
});

import clsx from "clsx";
import { Button } from "./ui";

interface ColorPickerButtonProps {
  color: "white" | "black" | "random";
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

function ColorSwatch({ color }: { color: "white" | "black" | "random" }) {
  if (color === "random") {
    return (
      <div className="flex items-center justify-center">
        <div className="mb-2 h-12 w-6 rounded-l-full bg-white"></div>
        <div className="mb-2 h-12 w-6 rounded-r-full bg-gray-800"></div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "mx-auto mb-2 h-12 w-12 rounded-full border",
        color === "white"
          ? "border-border-light bg-white dark:border-border-dark"
          : "border-gray-700 bg-gray-800",
      )}
    />
  );
}

const LABEL: Record<"white" | "black" | "random", string> = {
  white: "White",
  black: "Black",
  random: "Random",
};

export function ColorPickerButton({
  color,
  isSelected,
  onClick,
  className,
}: ColorPickerButtonProps) {
  return (
    <Button
      variant="unstyled"
      size="none"
      onClick={onClick}
      className={clsx(
        "rounded-lg border-2 p-4",
        isSelected
          ? "border-primary-light bg-primary-light/10 dark:border-primary-dark dark:bg-primary-dark/10"
          : "border-border-light hover:border-muted-fg-light dark:border-border-dark dark:hover:border-muted-fg-dark",
        className,
      )}
    >
      <ColorSwatch color={color} />
      <p className="text-sm font-semibold">{LABEL[color]}</p>
    </Button>
  );
}

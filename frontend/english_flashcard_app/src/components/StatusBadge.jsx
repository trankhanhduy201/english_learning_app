import { memo } from "react";

const StatusBadge = memo(({
  text = "",
  tone = "secondary",
  uppercase = true,
  className = "",
}) => {
  const toneClassName =
    tone === "light"
      ? "text-bg-light text-secondary border"
      : `text-bg-${tone}`;

  return (
    <span
      className={`badge ${toneClassName} ${uppercase ? "text-uppercase" : ""} ${className}`.trim()}
    >
      {text}
    </span>
  );
});

export default StatusBadge;

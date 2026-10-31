import { memo } from "react";

const TopicStatTag = memo(({
  icon = "bi-tag",
  value = 0,
  label = "",
  className = "",
  tone = "light",
}) => {
  const toneClassName =
    tone === "dark"
      ? "text-bg-dark"
      : tone === "primary"
        ? "text-bg-primary"
        : "text-bg-light text-secondary border";

  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center gap-1 topic-stat-tag ${toneClassName} ${className}`.trim()}
      title={`${value} ${label}`}
      aria-label={`${value} ${label}`}
    >
      <i className={`bi ${icon}`}></i>
      <span>{value}</span>
    </span>
  );
});

export default TopicStatTag;

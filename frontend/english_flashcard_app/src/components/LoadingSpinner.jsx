import { memo } from "react";

const LoadingSpinner = memo(
  ({ type = "border", color = "primary", size = "" }) => {
    return (
      <div
        className={`spinner-${type} text-${color} spinner-${type}-${size}`}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  },
);

export default LoadingSpinner;

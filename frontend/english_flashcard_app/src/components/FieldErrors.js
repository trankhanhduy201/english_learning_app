import { memo } from "react";

const FieldErrors = memo(({ errors }) => {
  if (!errors || errors.length === 0) return null;
  return (
    <ul className="mb-0 mt-2">
      {errors.map((error, index) => (
        <li className="text-danger" key={index}>
          {error}
        </li>
      ))}
    </ul>
  );
});

export default FieldErrors;
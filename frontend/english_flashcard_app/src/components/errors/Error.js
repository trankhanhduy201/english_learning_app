import React from "react";
import { useRouteError } from "react-router-dom";

const Error = () => {
  const error = useRouteError();

  return (
    <div className="container mt-4">
      <h1>Error</h1>
      <p>
        {error.status ? `${error.status}:` : ""}
        {error.statusText || "Something went wrong"}
      </p>
    </div>
  );
};

export default Error;

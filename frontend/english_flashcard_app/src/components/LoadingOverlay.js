import LoadingSpinner from "./LoadingSpinner";

const LoadingOverlay = ({ position = "fixed", background = "dark" }) => {
  return (
    <div
      className={`position-${position} top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-${background} bg-opacity-75`}
      style={{ zIndex: 1050 }}
    >
      <LoadingSpinner />
    </div>
  );
};

export default LoadingOverlay;

import { memo, useEffect, useState } from "react";
import AutoDismissAlert from "../../AutoDismissAlert";

const VocabErrors = memo(({ errors = [], duration = 2000 }) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!Array.isArray(errors) || errors.length === 0) return;

    setAlerts([
      ...errors.map((err) => ({
        idx: `vocab-error-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        message: err,
        type: "danger",
      })),
    ]);
  }, [errors]);

  const onClose = (id) => 
    setAlerts((prev) => 
      prev.filter((a) => a.idx !== id)
    );

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="position-absolute w-100" style={{ top: "10px", right: "10px" }}>
      {alerts.map((alert) => (
        <div key={alert.idx} className="col-12 col-md-6 col-lg-4 ms-auto">
          <AutoDismissAlert
            idx={alert.idx}
            message={alert.message}
            type={alert.type}
            duration={duration}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
});

export default VocabErrors;

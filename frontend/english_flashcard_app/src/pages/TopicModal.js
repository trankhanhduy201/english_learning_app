import React, { memo } from "react";
import Topic from "./Topic";

const TopicModal = memo(() => {
  return (
    <div
      className={`modal fade show d-block`}
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-md" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">New topic</h5>
          </div>
          <div className="modal-body">
            <Topic />
          </div>
        </div>
      </div>
    </div>
  );
});

export default TopicModal;

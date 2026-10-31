import { memo } from "react";
import Vocab from "./Vocab";

const VocabModal = memo(() => {
  return (
    <div
      className={`modal fade show d-block`}
      tabIndex="-1"
      role="dialog"
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-xl" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Vocabulary</h5>
          </div>
          <div className="modal-body">
            <Vocab />
          </div>
        </div>
      </div>
    </div>
  );
});

export default VocabModal;

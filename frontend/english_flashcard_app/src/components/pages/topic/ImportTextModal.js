import React, { memo, useEffect, useRef } from "react";
import { useFetcher } from "react-router-dom";

const ImportTextModal = memo(function ImportTextModal({ topicId, lang, onClose }) {
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.status === "success") {
      onClose(); // Close modal when import is successful
    }
  }, [fetcher.state, fetcher.data]);

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
            <h5 className="modal-title">Import Vocabulary</h5>
          </div>
          <div className="modal-body">
            <fetcher.Form method="post" action={`/topic/${topicId}/vocab/import`}>
							<input type="hidden" name="import_type" value="text" />
							<input type="hidden" name="lang" value={lang} />
              <textarea
                name="text_data"
                className="form-control"
                rows="15"
                placeholder="Paste vocabularies here..."
                required
              ></textarea>
              <div className="mt-3 text-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={onClose}
									disabled={fetcher.state === "submitting"}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={fetcher.state === "submitting"}
                >
                  {fetcher.state === "submitting" ? "Importing..." : "Import"}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ImportTextModal;

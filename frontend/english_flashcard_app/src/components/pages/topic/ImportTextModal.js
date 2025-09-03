import { memo, useEffect } from "react";
import { useFetcher } from "react-router-dom";
import { DEFAULT_LANG, LANGUAGES } from "../../../configs/langConfig";
import FieldErrors from "../../../components/FieldErrors";
import Dropdown from "../../../components/Dropdown";

const ImportTextModal = memo(({ topicId, learningLang, onClose }) => {
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
            <fetcher.Form
              method="post"
              action={`/topic/${topicId}/vocab/import`}
            >
              <input type="hidden" name="_form_name" value="importing_vocab" />
              <input type="hidden" name="import_type" value="text" />
              <input type="hidden" name="language_from" value={learningLang} />
              <div className="mb-3 col-lg-4">
                <label htmlFor="language_to" className="form-label">
                  Which language do you want to translate?
                </label>
                <Dropdown
                  name="language_to"
                  defaultValue={DEFAULT_LANG}
                  options={LANGUAGES}
                />
                {fetcher.data?.errors?.language_to && (
                  <FieldErrors errors={fetcher.data.errors.language_to} />
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="import_text" className="form-label">
                  Paste vocabularies here (one per line)
                </label>
                <textarea
                  name="import_text"
                  className="form-control"
                  rows="15"
                  placeholder="Paste vocabularies here..."
                  disabled={fetcher.state === "submitting"}
                ></textarea>
                {fetcher.data?.errors?.import_text && (
                  <FieldErrors errors={fetcher.data.errors.import_text} />
                )}
              </div>
              <div className="d-flex justify-content-start mt-3 text-end">
                <button
                  type="button"
                  className="btn btn-secondary w-sm-50 me-2"
                  onClick={onClose}
                  disabled={fetcher.state === "submitting"}
                >
                  <i className="bi bi-cross"></i>{" "}
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-sm-50"
                  disabled={fetcher.state === "submitting"}
                >
                  <i className="bi bi-upload"></i>{" "}
                  {fetcher.state === "submitting" ? "Importing..." : "Import"}
                </button>
              </div>
              {fetcher.data?.errors?.language_from && (
                <FieldErrors errors={fetcher.data.errors.language_from} />
              )}
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ImportTextModal;

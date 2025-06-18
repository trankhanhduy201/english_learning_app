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
              <input type="hidden" name="learning_lang" value={learningLang} />
              <div className="mb-3 col-lg-4">
                <label htmlFor="translating_lang" className="form-label">
                  Which language do you want to translate?
                </label>
                <Dropdown
                  name="translating_lang"
                  defaultValue={DEFAULT_LANG}
                  options={LANGUAGES}
                />
                {fetcher.data?.errors?.translating_lang && (
                  <FieldErrors errors={fetcher.data.errors.translating_lang} />
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="text_data" className="form-label">
                  Paste vocabularies here (one per line)
                </label>
                <textarea
                  name="text_data"
                  className="form-control"
                  rows="15"
                  placeholder="Paste vocabularies here..."
                  disabled={fetcher.state === "submitting"}
                ></textarea>
                {fetcher.data?.errors?.text_data && (
                  <FieldErrors errors={fetcher.data.errors.text_data} />
                )}
              </div>
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
              {fetcher.data?.errors?.learning_lang && (
                <FieldErrors errors={fetcher.data.errors.learning_lang} />
              )}
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ImportTextModal;

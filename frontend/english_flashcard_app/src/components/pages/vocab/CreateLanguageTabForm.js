import React, { memo, useEffect } from "react";
import { useFetcher, useParams } from "react-router-dom";
import * as transType from "../../../enums/transType";

const CreateLanguageTabForm = memo(({ onCreated, vocabFormRef }) => {
  const { topicId } = useParams();
  const actionPath = `/topic/${topicId}/vocab/translation_tab/create`;
  const fetcher = useFetcher();
  const errors = fetcher.data?.status === "error" ? fetcher.data.errors : {};
  const isSubmitting = fetcher.state === "submitting";

  const submitTranslation = () => {
    const formData = new FormData();
    formData.append("_form_name", "create_translation");
    formData.append("translation", vocabFormRef.current.elements['translation_tab[translation]'].value);
    formData.append("language", vocabFormRef.current.elements['translation_tab[language]'].value);
    formData.append("type", vocabFormRef.current.elements['translation_tab[type]'].value);
    formData.append("note", vocabFormRef.current.elements['translation_tab[note]'].value);

    fetcher.submit(formData, {
      action: actionPath,
      method: "post",
    });
  };

  useEffect(() => {
    if (fetcher.data?.status === "success" && fetcher.data.item) {
      onCreated(fetcher.data.item);
      // Reset inputs
      vocabFormRef.current.elements['translation_tab[translation]'].value = '';
      vocabFormRef.current.elements['translation_tab[language]'].value = '';
      vocabFormRef.current.elements['translation_tab[type]'].value = '';
      vocabFormRef.current.elements['translation_tab[note]'].value = '';
    }
  }, [fetcher.data, onCreated, vocabFormRef]);

  return (
    <div>
      <div className="mb-3">
        <label htmlFor="textInput" className="form-label">
          Translation
        </label>
        <input
          type="text"
          className={`form-control ${errors.translation ? "is-invalid" : ""}`}
          id="textInput"
          name="translation_tab[translation]"
          placeholder="Translation..."
        />
        {errors.translation && (
          <div className="invalid-feedback">{errors.translation}</div>
        )}
      </div>
      <div className="mb-3">
        <div className="row">
          <div className="col-12 col-sm-6 mb-3 mb-sm-0">
            <label htmlFor="languageSelect" className="form-label">
              Select Language
            </label>
            <select
              className={`form-select ${errors.language ? "is-invalid" : ""}`}
              id="languageSelect"
              name="translation_tab[language]"
            >
              <option value="">-- No choice --</option>
              <option value="en">English</option>
              <option value="ja">Japanese (日本語)</option>
              <option value="vn">Vietnamese (Tiếng Việt)</option>
            </select>
            {errors.language && (
              <div className="invalid-feedback">{errors.language}</div>
            )}
          </div>
          <div className="col-12 col-sm-6">
            <label htmlFor="type" className="form-label">
              Type
            </label>
            <select
              id="type"
              className={`form-control ${errors.type ? "is-invalid" : ""}`}
              name="translation_tab[type]"
            >
              <option value="">-- No choice --</option>
              {transType.getDatas().map((v) => (
                <option key={v.key} value={v.key}>
                  {v.text}
                </option>
              ))}
            </select>
            {errors.type && (
              <div className="invalid-feedback">{errors.type}</div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="note" className="form-label">
          Note
        </label>
        <textarea
          className={`form-control ${errors.note ? "is-invalid" : ""}`}
          rows={4}
          placeholder="Examples..."
          id="note"
          name="translation_tab[note]"
        ></textarea>
        {errors.note && <div className="invalid-feedback">{errors.note}</div>}
      </div>
      <div className="mb-3 text-end">
        <button
          type="button"
          className="btn btn-secondary w-sm-100"
          disabled={isSubmitting}
          onClick={submitTranslation}
        >
          <i className="bi bi-plus-circle"></i> Add
        </button>
      </div>
    </div>
  );
});

export default CreateLanguageTabForm;

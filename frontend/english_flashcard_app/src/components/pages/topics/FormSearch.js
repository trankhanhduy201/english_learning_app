import { memo } from "react";
import { LANGUAGES } from "../../../configs/langConfig";
import { useSearchParams, Form } from "react-router-dom";

const FormSearch = memo(() => {
  const [ searchParams ] = useSearchParams();

  return (
    <div className="card mb-3">
      <div className="card-body">
        <Form className="form-inline" method="get" action="/topics">
          <div className="row">
            <div className="col-md-10 col-sm-9">
              <div className="row">
                <div className="col-sm-6 mb-2 mb-sm-0">
                  <input
                    type="text"
                    name="text_search"
                    className="form-control"
                    placeholder="Search texts..."
                    defaultValue={searchParams.get("text_search") || ""}
                  />
                </div>
                <div className="col-sm-6 mb-2 mb-sm-0">
                  <select
                    name="learning_language"
                    className="form-select"
                    defaultValue={searchParams.get("learning_language") || ""}
                  >
                    <option key={0} value="">All Languages</option>
                    {Object.values(LANGUAGES).map((item) => (
                      <option key={item.key} value={item.key}>{item.text}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-md-2 col-sm-3">
              <button type="submit" className="btn btn-primary w-100">
                <i className="bi bi-search text-white"></i> Search
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
});

export default FormSearch;
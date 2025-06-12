import { memo } from "react";
import { useFetcher, Link } from "react-router-dom";
import { LANGUAGES } from "../../../configs/langConfigs";
import { Form } from "react-bootstrap";

const TopicDetail = memo(({ topic = null, topicId = "", isNew = false }) => {
  const editTopicFetcher = useFetcher();
  const delTopicFetcher = useFetcher();

  const handleDelTopic = () => {
    const formData = new FormData();
    formData.append("_not_revalidate", "1");
    delTopicFetcher.submit(formData, {
      action: `/topic/${topicId}/delete?redirectTo=topics`,
      method: "delete",
    });
  };

  const isDisableButton = () =>
    editTopicFetcher.state === "submitting" ||
    delTopicFetcher.state === "submitting";

  return (
    <editTopicFetcher.Form
      action={isNew ? "/topics/new" : `/topic/${topicId}`}
      method={isNew ? "post" : "put"}
    >
      <input type="hidden" name="_not_revalidate" defaultValue={"1"} />
      <div className="row">
        <div className="mb-3 col-lg-6">
          <label htmlFor="name" className="form-label">
            Topic name
          </label>
          <input
            type="text"
            className="form-control"
            name="name"
            defaultValue={topic?.name}
            placeholder="Name..."
          />
          {editTopicFetcher.data?.errors?.name && (
            <ul>
              {editTopicFetcher.data.errors.name.map((error, index) => (
                <li className="text-danger" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-3 col-lg-6">
          <label htmlFor="learning_language" className="form-label">
            Which language are you learning?
          </label>
          <Form.Select
            className="form-control"
            name="learning_language"
            defaultValue={topic?.learning_language}
          >
            {LANGUAGES.map(item => (
              <option key={item.key} value={item.key}>
                {item.text}
              </option>
            ))}
          </Form.Select>
          {editTopicFetcher.data?.errors?.learning_language && (
            <ul>
              {editTopicFetcher.data.errors.learning_language.map((error, index) => (
                <li className="text-danger" key={index}>
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="descriptions" className="form-label">
          Descriptions
        </label>
        <textarea
          rows={5}
          className="form-control"
          name="descriptions"
          defaultValue={topic?.descriptions}
          placeholder="Description..."
        ></textarea>
      </div>
      {editTopicFetcher.data?.errors?.descriptions && (
        <ul>
          {editTopicFetcher.data.errors.descriptions.map((error, index) => (
            <li className="text-danger" key={index}>
              {error}
            </li>
          ))}
        </ul>
      )}
      <div className="d-flex justify-content-end mt-2">
        <Link to={`/topics`} className="btn btn-secondary me-2">
          <i className="bi bi-arrow-left"></i> List topic
        </Link>
        {!isNew && (
          <Link to={`/topic/${topicId}/learn`} className="btn btn-success me-2">
            <i className="bi bi-clipboard-pulse text-white"></i> Learn
          </Link>
        )}
        <button
          type="submit"
          className="btn btn-primary me-2"
          disabled={isDisableButton()}
        >
          <i className="bi bi-pencil-square text-white"></i>{" "}
          {editTopicFetcher.state === "submitting" ? "Saving..." : "Save"}
        </button>
        {!isNew && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelTopic}
            disabled={isDisableButton()}
          >
            <i className="bi bi-trash text-white"></i>{" "}
            {delTopicFetcher.state === "submitting" ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </editTopicFetcher.Form>
  );
});

export default TopicDetail;

import { memo, useEffect } from "react";
import { useFetcher, Link } from "react-router-dom";
import { LANGUAGES } from "../../../configs/langConfig";
import { useTopicContext } from "../../../contexts/TopicContext";
import FieldErrors from "../../../components/FieldErrors";
import Dropdown from "../../../components/Dropdown";
import UploadImageInput from "../../UploadImageInput";
import RadioButtons from "../../RadioButtons";
import { TOPIC_STATUS } from "../../../configs/appConfig";
import Subscribers from "./Subscribers";

const TopicDetail = memo(({ topic = null, topicId = "", isNew = false }) => {
  const editTopicFetcher = useFetcher();
  const delTopicFetcher = useFetcher();
  const { setTopic } = useTopicContext();

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

  useEffect(() => {
    setTopic(topic);
  }, []);

  // Update context topic after successful update
  useEffect(() => {
    if (
      editTopicFetcher.data?.status === "success" &&
      editTopicFetcher.data.data
    ) {
      setTopic(editTopicFetcher.data.data);
    }
  }, [editTopicFetcher.data]);

  return (
    <>
      <editTopicFetcher.Form
        action={isNew ? "/topics/new" : `/topic/${topicId}`}
        method={isNew ? "post" : "put"}
        encType="multipart/form-data"
      >
        <input type="hidden" name="_not_revalidate" defaultValue={"1"} />
        <div className="row">
          <div className="mb-3 col-md-6">
            <label htmlFor="name" className="form-label">
              Image
            </label>
            <UploadImageInput
              name="image"
              imageUrl={editTopicFetcher?.data?.data?.image_info?.url ?? topic?.image_info?.url}
            />
            {editTopicFetcher.data?.errors?.upload_image && (
              <FieldErrors
                errors={editTopicFetcher.data?.errors?.upload_image}
              />
            )}
          </div>
        </div>
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
              <FieldErrors errors={editTopicFetcher.data.errors.name} />
            )}
          </div>
          <div className="mb-3 col-lg-6">
            <label htmlFor="learning_language" className="form-label">
              Which language are you learning?
            </label>
            <Dropdown
              name="learning_language"
              defaultValue={topic?.learning_language}
              options={Object.values(LANGUAGES)}
            />
            {editTopicFetcher.data?.errors?.learning_language && (
              <FieldErrors
                errors={editTopicFetcher.data.errors.learning_language}
              />
            )}
          </div>
        </div>
        <div className="row">
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
            {editTopicFetcher.data?.errors?.descriptions && (
              <FieldErrors errors={editTopicFetcher.data.errors.descriptions} />
            )}
          </div>
        </div>
        <div className="row">
          <div className="mb-3">
            <label htmlFor="status" className="form-label">
              Status
            </label>
            <div className="d-block">
              <RadioButtons
                name="status"
                options={Object.values(TOPIC_STATUS)}
                selectedOption={topic?.status ?? 'private'}
              />
            </div>
            {editTopicFetcher.data?.errors?.status && (
              <FieldErrors
                errors={editTopicFetcher.data?.errors?.status}
              />
            )}
          </div>
        </div>
        <div className="d-flex justify-content-end mt-2">
          <Link to={`/topics`} className={`btn btn-secondary me-2 ${isNew ? "w-sm-50" : ""}`}>
            <i className="bi bi-arrow-left"></i>
            <span className={`btn-text ${!isNew ? "--d-sm-none" : ""}`}> List topic</span>
          </Link>
          {!isNew && (
            <Link to={`/topic/${topicId}/learn`} className="btn btn-success me-2">
              <i className="bi bi-clipboard-pulse text-white"></i>
              <span className="btn-text --d-sm-none"> Learn</span>
            </Link>
          )}
          <button
            type="submit"
            className={`btn btn-primary ${!isNew ? "me-2" : "w-sm-50"}`}
            disabled={isDisableButton()}
          >
            <i className="bi bi-pencil-square text-white"></i>{" "}
            <span className={`btn-text ${!isNew ? "--d-sm-none" : ""}`}>
              {editTopicFetcher.state === "submitting" ? "Saving..." : "Save"}
            </span>
          </button>
          {!isNew && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelTopic}
              disabled={isDisableButton()}
            >
              <i className="bi bi-trash text-white"></i>{" "}
              <span className="btn-text --d-sm-none">
                {delTopicFetcher.state === "submitting" ? "Deleting..." : "Delete"}
              </span>
            </button>
          )}
        </div>
      </editTopicFetcher.Form>

      <h2>Subscribers</h2>
      <hr />
      <div className="row">
        <div className="mb-3">
          <Subscribers topicId={topicId} defaultMembers={topic?.members ?? []} />
        </div>
      </div>
    </>
  );
});

export default TopicDetail;

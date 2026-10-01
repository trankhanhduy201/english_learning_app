import { memo } from "react";
import { Link } from "react-router-dom";
import { TOPIC_STATUS } from "../../../configs/appConfig";
import { getTopicImageSrc } from "../../../commons/topicImage";

const ListTopic = memo(({ topics, removeTopic }) => {
  const allowLearn = (topic) =>
    topic.current_member.is_owner ||
    topic.current_member.is_accepted;

  const allowWatch = (topic) =>
    topic.status === TOPIC_STATUS.PUBLIC.key &&
    topic.current_member.is_blocking === false;

  const allowEdit = (topic) =>
    topic.current_member.is_owner ||
    topic.current_member.is_accepted;

  const allowDelete = (topic) =>
    topic.current_member.is_owner;

  const getShortDescription = (description) => {
    if (!description) {
      return "No description";
    }
    if (description.length <= 140) {
      return description;
    }
    return `${description.slice(0, 137)}...`;
  };

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4">
      {topics?.map((topic) => (
        <div className="col" key={topic.id} data-topic-card="1">
          <div className="card h-100 shadow-sm">
            <Link to={`/topic/${topic.id}`} className="text-decoration-none">
              <img
                src={getTopicImageSrc(topic?.image_info)}
                alt={topic.name}
                className="card-img-top"
                style={{ height: 220, objectFit: "cover" }}
              />
            </Link>

            <div className="card-body d-flex flex-column text-start">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <Link
                  to={`/topic/${topic.id}`}
                  className="text-decoration-none text-dark fw-semibold fs-5"
                >
                  {topic.name}
                </Link>
                <span
                  className={`badge ${
                    topic.status === TOPIC_STATUS.PUBLIC.key
                      ? "text-bg-success"
                      : "text-bg-secondary"
                  } text-uppercase`}
                >
                  {topic.status}
                </span>
              </div>

              <p className="text-muted mt-2 mb-3">
                {getShortDescription(topic.descriptions)}
              </p>

              <div className="small text-muted mt-auto">
                <div className="mb-1">
                  <i className="bi bi-people me-2"></i>
                  {topic.member_count} members
                </div>
                <div>
                  <i className="bi bi-person me-2"></i>
                  {topic.created_by?.username ?? "Unknown"}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-3">
                {allowLearn(topic) && (
                  <Link
                    to={`/topic/${topic.id}/learn`}
                    className="btn btn-success btn-sm"
                  >
                    <i className="bi bi-clipboard-pulse text-white me-1"></i>
                    Learn
                  </Link>
                )}
                {allowEdit(topic) ? (
                  <Link to={`/topic/${topic.id}`} className="btn btn-primary btn-sm">
                    <i className="bi bi-pencil-square text-white me-1"></i>
                    Edit
                  </Link>
                ) : allowWatch(topic) && (
                  <Link to={`/topic/${topic.id}`} className="btn btn-outline-primary btn-sm">
                    <i className="bi bi-eye me-1"></i>
                    View
                  </Link>
                )}
                {allowDelete(topic) && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeTopic(topic.id)}
                  >
                    <i className="bi bi-trash text-white me-1"></i>
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default ListTopic;

import { memo } from "react";
import { Link } from "react-router-dom";
import { TOPIC_STATUS } from "../../../configs/appConfig";
import { getTopicImageSrc } from "../../../commons/topicImage";
import UserAvatar from "../../../commons/userAvatar";

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

  const renderedMembers = (topic) => {
    const members = Array.isArray(topic?.members) ? topic.members : [];
    const displayMembers = members.slice(0, 2);
    const restCount = Math.max(0, members.length - displayMembers.length);

    return (
      <div className="d-flex align-items-center gap-1">
        <div className="d-flex align-items-center">
          {displayMembers.map((member) => (
            <div
              key={member?.member_id ?? member?.id ?? member?.member_name}
              className="me-1"
            >
              <UserAvatar
                user={member?.member ?? member}
                size={24}
                className="border border-white shadow-sm"
                alt={member?.member_name ?? member?.member?.username ?? "Member"}
              />
            </div>
          ))}
        </div>
        {restCount > 0 && (
          <span className="badge rounded-pill text-bg-light text-secondary border">
            +{restCount}
          </span>
        )}
      </div>
    );
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
                loading="lazy"
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

              <div className="small text-muted mb-2">
                <UserAvatar
                    className="border border-white shadow-sm me-1"
                    user={topic.created_by}
                    size={20}
                    alt={topic.created_by?.username ?? "Author"}
                  />
                <span>{topic.created_by?.username ?? "Unknown"}</span>
              </div>

              <p className="text-muted mt-0 mb-3">
                {getShortDescription(topic.descriptions)}
              </p>

              <div className="small text-muted mt-auto">
                <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-people"></i>
                    <span>{topic.member_count} members</span>
                  </div>
                  {renderedMembers(topic)}
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-3 justify-content-end">
                {allowLearn(topic) && (
                  <Link
                    to={`/topic/${topic.id}/learn`}
                    className="btn btn-success btn-sm"
                    title="Learn"
                    aria-label="Learn"
                  >
                    <i className="bi bi-clipboard-pulse"></i>
                  </Link>
                )}
                {allowEdit(topic) ? (
                  <Link
                    to={`/topic/${topic.id}`}
                    className="btn btn-primary btn-sm"
                    title="Edit"
                    aria-label="Edit"
                  >
                    <i className="bi bi-pencil-square"></i>
                  </Link>
                ) : allowWatch(topic) && (
                  <Link
                    to={`/topic/${topic.id}`}
                    className="btn btn-outline-primary btn-sm"
                    title="View"
                    aria-label="View"
                  >
                    <i className="bi bi-eye"></i>
                  </Link>
                )}
                {allowDelete(topic) && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeTopic(topic.id)}
                    title="Delete"
                    aria-label="Delete"
                  >
                    <i className="bi bi-trash"></i>
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

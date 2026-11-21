import { memo, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TOPIC_STATUS } from "../../../configs/appConfig";
import { getTopicImageSrc } from "../../../commons/topicImage";
import UserAvatar, { getUserDisplayName } from "../../../commons/userAvatar";
import { memberToUserData } from "../../../commons/topicMember";
import TopicStatTag from "../../TopicStatTag";
import StatusBadge from "../../StatusBadge";
import JoinButton from "../topic/JoinButton";

const ListTopic = memo(({ topics, removeTopic }) => {
  const [topicList, setTopicList] = useState(topics ?? []);

  useEffect(() => {
    setTopicList(topics ?? []);
  }, [topics]);

  const updateTopicMember = useCallback((topicId, newTopicMember) => {
    setTopicList((currentTopics) => currentTopics.map((topic) =>
      topic.id === topicId
        ? {
            ...topic,
            current_member: {
              ...topic.current_member,
              ...newTopicMember,
            },
          }
        : topic
    ));
  }, []);

  const allowLearn = (topic) =>
    topic.current_member?.is_owner || topic.current_member?.is_accepted;

  const allowWatch = (topic) =>
    topic.status === TOPIC_STATUS.PUBLIC.key &&
    topic.current_member?.is_blocking === false;

  const allowEdit = (topic) =>
    topic.current_member?.is_owner || topic.current_member?.is_accepted;

  const allowDelete = (topic) => topic.current_member?.is_owner;

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
    const displayMembers = members.reduce((results, member) => {
      const isAccepted = member?.member_permissions?.is_accepted ?? false
      if (isAccepted && results.length < 4) {
          results.push(member);
      }
      return results;
    }, []);
    const restCount = Math.max(0, (topic?.member_count ?? 0) - displayMembers.length);

    return (
      <div className="d-flex align-items-center gap-1">
        <div className="d-flex align-items-center">
          {displayMembers.map((member) => {
            const normalizedMember = memberToUserData(member);
            return (
              <div key={member?.member_id}>
                <UserAvatar
                  user={normalizedMember}
                  size={24}
                  className="border border-white shadow-sm"
                />
              </div>
            );
          })}
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
      {topicList.map((topic) => {
        const hasActions =
          allowLearn(topic) ||
          allowEdit(topic) ||
          allowWatch(topic) ||
          allowDelete(topic);

        return (
          <div className="col" key={topic.id} data-topic-card="1">
            <div className="card h-100 shadow-sm topic-card">
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
                  <div className="d-flex align-items-start gap-1 flex-column">
                    <Link
                      to={`/topic/${topic.id}`}
                      className="text-decoration-none text-dark fw-semibold"
                    >
                      {topic.name}
                    </Link>
                    <div className="small text-muted mb-2">
                      <UserAvatar
                        className="border border-white shadow-sm me-1"
                        user={topic.created_by}
                        size={20}
                      />
                      <span>{getUserDisplayName(topic.created_by)}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-end gap-2 flex-column">
                    <TopicStatTag
                      icon="bi-card-text"
                      value={topic.vocab_count ?? 0}
                      label="words"
                      tone="primary"
                    />
                    <TopicStatTag
                      icon="bi-people"
                      value={topic.member_count ?? 0}
                      label="members"
                    />
                    <div className="position-absolute top-0 end-0 m-2 d-flex flex-column align-items-end gap-1">
                      <StatusBadge
                        text={topic.status}
                        tone={
                          topic.status === TOPIC_STATUS.PUBLIC.key
                            ? "success"
                            : "secondary"
                        }
                      />
                      {topic.current_member && (
                        <JoinButton
                          compact
                          topicId={topic.id}
                          topicMember={topic.current_member}
                          updateTopicMember={(newTopicMember) =>
                            updateTopicMember(topic.id, newTopicMember)
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="small text-muted mt-auto">
                  <div className="d-flex align-items-center justify-content-end gap-2 mb-2">
                    {renderedMembers(topic)}
                  </div>
                </div>
              </div>
              {hasActions && (
                <div className="topic-card__actions-overlay">
                  <div className="topic-card__actions">
                    {allowLearn(topic) && (
                      <Link
                        to={`/topic/${topic.id}/learn`}
                        className="btn btn-outline-light btn-sm"
                        title="Learn"
                        aria-label="Learn"
                      >
                        <i className="bi bi-clipboard-pulse"></i>
                      </Link>
                    )}
                    {allowEdit(topic) ? (
                      <Link
                        to={`/topic/${topic.id}`}
                        className="btn btn-outline-light btn-sm"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Link>
                    ) : (
                      allowWatch(topic) && (
                        <Link
                          to={`/topic/${topic.id}`}
                          className="btn btn-outline-light btn-sm"
                          title="View"
                          aria-label="View"
                        >
                          <i className="bi bi-eye"></i>
                        </Link>
                      )
                    )}
                    {allowDelete(topic) && (
                      <button
                        type="button"
                        className="btn btn-outline-light btn-sm"
                        onClick={() => removeTopic(topic.id)}
                        title="Delete"
                        aria-label="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ListTopic;

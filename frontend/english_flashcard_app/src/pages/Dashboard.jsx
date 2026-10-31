import { memo, Suspense } from "react";
import { Await, Link, useLoaderData } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";
import { getTopicImageSrc } from "../commons/topicImage";
import UserAvatar, { getUserDisplayName } from "../commons/userAvatar";
import TopicStatTag from "../components/TopicStatTag";
import StatusBadge from "../components/StatusBadge";

const Dashboard = memo(() => {
  const { dashboardSummaryPromise } = useLoaderData();

  const cards = [
    { key: "own_topic_count", label: "My Topics", icon: "bi-journal-text" },
    { key: "own_vocab_count", label: "My Vocabs", icon: "bi-card-text" },
    { key: "member_count", label: "Members", icon: "bi-people" },
    {
      key: "subscribed_topic_count",
      label: "Subscribed Topics",
      icon: "bi-bell",
    },
  ];

  return (
    <>
      <h2 className="text-start">Dashboard</h2>
      <hr />
      <Suspense fallback={<LoadingOverlay />}>
        <Await resolve={dashboardSummaryPromise}>
          {(dashboardSummary = {}) => (
            <>
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
                {cards.map((card) => (
                  <div className="col" key={card.key}>
                    <div className="card h-100 shadow-sm">
                      <div className="card-body d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center"
                          style={{ width: 52, height: 52 }}
                        >
                          <i className={`bi ${card.icon} fs-4`}></i>
                        </div>
                        <div className="text-start">
                          <div className="text-muted small">{card.label}</div>
                          <div className="fs-3 fw-semibold">
                            {dashboardSummary?.[card.key] ?? 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h4 className="text-start">Trending topics</h4>
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3 mt-1">
                  {(dashboardSummary?.trending_topics ?? []).map((topic, index) => (
                    <div className="col" key={topic.id}>
                      <div className="card h-100 shadow-sm">
                        <Link
                          to={`/topic/${topic.id}`}
                          className="text-decoration-none text-reset"
                        >
                          <img
                            src={getTopicImageSrc(topic?.image_info)}
                            alt={topic.name}
                            className="card-img-top"
                            style={{ height: 180, objectFit: "cover" }}
                            loading="lazy"
                          />
                          <div className="card-body text-start">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="text-muted small d-flex align-items-center gap-2">
                                  <StatusBadge
                                    text={`Rank #${index + 1}`}
                                    tone={index === 0 ? "primary" : index === 1 ? "success" : "secondary"}
                                    className="position-absolute top-0 end-0 m-2"
                                  />
                                </div>
                                <div className="d-flex flex-column justify-content-between align-items-start">
                                  <div className="fw-semibold">{topic.name}</div>
                                  <div className="d-flex align-items-center gap-1 text-muted small mt-1">
                                    <UserAvatar
                                      user={topic.created_by}
                                      size={20}
                                      className="border border-white shadow-sm"
                                    />
                                    <span>{getUserDisplayName(topic.created_by)}</span>
                                  </div>
                                </div> 
                              </div>
                              <div className="d-flex flex-column align-items-end gap-1">
                                <TopicStatTag
                                  icon="bi-card-text"
                                  value={topic.vocab_count ?? 0}
                                  label="words"
                                  tone="primary"
                                />
                                <TopicStatTag
                                  icon="bi-people"
                                  value={topic.member_count ?? 0}
                                  label="subscribers"
                                />
                              </div>
                            </div>
                            <div className="text-muted small mt-1">
                              {topic?.descriptions ?? "No description"}
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </Await>
      </Suspense>
    </>
  );
});

export default Dashboard;

import { memo, Suspense } from "react";
import { Await, useLoaderData } from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay";

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
                        <div className="card-body text-start">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="text-muted small">#{index + 1}</div>
                              <div className="fw-semibold">{topic.name}</div>
                            </div>
                            <span className="badge text-bg-primary">
                              {topic.subscriber_count ?? 0}
                            </span>
                          </div>
                          <div className="text-muted small mt-2">
                            subscribed members
                          </div>
                        </div>
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

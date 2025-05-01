import { memo, startTransition, useOptimistic } from "react";
import { Link } from "react-router-dom";

const Topics = memo(({ topics, removeTopic }) => {
  const [topicOptimistic, setTopicOptimistic] = useOptimistic(
    topics,
    (prevState, payload) => {
      switch (payload.action) {
        case "remove":
          return prevState.filter((topic) => topic.id != payload.topicId);
        default:
          return prevState;
      }
    },
  );

  const optimisticRemoveTopic = (topicId) => {
    startTransition(async () => {
      setTopicOptimistic({ action: "remove", topicId });
      await removeTopic(topicId);
    });
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Topic</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {topicOptimistic &&
            topicOptimistic.map((topic, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{topic.name}</td>
                <td>{topic.descriptions}</td>
                <td>
                  <Link to={`/topic/${topic.id}/learn`} className="me-2">
                    <i className="bi bi-clipboard-pulse text-dark"></i>
                  </Link>
                  <Link to={`/topic/${topic.id}`} className="me-2">
                    <i className="bi bi-pencil-square text-dark"></i>
                  </Link>
                  <Link onClick={() => optimisticRemoveTopic(topic.id)}>
                    <i className="bi bi-trash text-dark"></i>
                  </Link>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
});

export default Topics;

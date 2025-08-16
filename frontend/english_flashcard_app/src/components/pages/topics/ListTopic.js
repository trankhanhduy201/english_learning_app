import { memo } from "react";
import { Link } from "react-router-dom";

const Topics = memo(({ topics, removeTopic }) => {
  return (
    <div className="table-responsive">
      <table id="ListTopicsTable" className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>#</th>
            <th>Topic</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {topics &&
            topics.map((topic, index) => (
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
                  <Link onClick={() => removeTopic(topic.id)}>
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

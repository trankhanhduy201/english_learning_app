import { Link, useLoaderData } from 'react-router-dom';

const Topics = () => {
  const { topics } = useLoaderData();
  console.log('Render Topics');

  return (
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Topic</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {topics && topics.map((topic, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{topic.name}</td>
                <td>{topic.description}</td>
                <td>
                  <Link className="btn btn-primary btn-sm" to={`/topic/${topic.id}`}>Learn</Link>
                  <button className="btn btn-danger btn-sm ms-1">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default Topics;

import React, { Suspense, useEffect } from 'react';
import { useLoaderData, Await, useFetcher, useParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAlert } from '../stores/slices/alertSlice';
import * as alertConfigs from "../configs/alertConfigs";
import { ErrorBoundary } from "react-error-boundary";

const Topic = () => {
  const dispatch = useDispatch();
  const fetcher = useFetcher();
  const { topicId } = useParams();
  const { topic, vocabs: vocabsPromise } = useLoaderData();

  useEffect(() => {
    if (fetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE, 
        message: "Topic updated successfully"
      }));
    }
  }, [fetcher.data]);

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-6 text-start">
          <h2>Topic info</h2>
          <fetcher.Form action={`/topic/${topicId}`} method="put">
            <input type="hidden" name="_not_revalidate" defaultValue={'1'}/>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" className="form-control" name="name" defaultValue={topic.name}/>
            </div>
            {fetcher.data?.errors?.name && (
              <ul>
                {fetcher.data.errors.name.map((error, index) => (
                  <li className='text-danger' key={index}>{error}</li>
                ))}
            </ul>
            )}
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea className="form-control" name="description">{topic?.description}</textarea>
            </div>
            {fetcher.data?.errors?.description && (
              <ul>
                {fetcher.data.errors.description.map((error, index) => (
                  <li className='text-danger' key={index}>{error}</li>
                ))}
              </ul>
            )}
            <button type="submit" className="btn btn-primary" disabled={fetcher.state === "submitting"}>
              {fetcher.state === "submitting" ? "Saving..." : "Save"}
            </button>
          </fetcher.Form>
        </div>
        <div className="col-lg-6 text-start">
          <h2>Vocabularies</h2>
          <ErrorBoundary fallback={<p className='alert alert-danger'>Can not get data</p>}>
            <Suspense fallback={<p className='text-center'>Loading...</p>}>
              <Await resolve={vocabsPromise}>
                {(data) => (
                  <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="table table-striped">
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <tr>
                          <th>#</th>
                          <th>Word</th>
                          <th>Description</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data?.data && data.data.length > 0) ? (
                          data.data.map((vocab, index) => (
                            <tr key={index}>
                              <td>{index + 1}</td>
                              <td>{vocab.word}</td>
                              <td>{vocab?.description}</td>
                              <td>
                                <div className='d-flex justify-content-end'>
                                  <Link to={`/topic/${topicId}/vocab/${vocab.id}`} className="me-2">
                                    <i class="bi bi-pencil-square text-dark"></i>
                                  </Link>
                                  <Link to={`/topic/${topicId}/vocab/${vocab.id}/delete`}>
                                    <i class="bi bi-trash text-dark"></i>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className='text-center' colSpan="4">No vocabularies found</td>
                          </tr>
                        )}
                      </tbody>            
                    </table>
                  </div>
                )}
              </Await>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Topic;
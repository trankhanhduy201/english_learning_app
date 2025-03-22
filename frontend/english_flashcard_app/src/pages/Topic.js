import React, { Suspense, useEffect, useState } from 'react';
import { useLoaderData, Await, useFetcher, useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAlert } from '../stores/slices/alertSlice';
import * as alertConfigs from "../configs/alertConfigs";
import { ErrorBoundary } from "react-error-boundary";
import { parse } from 'qs';

const Topic = () => {
  const dispatch = useDispatch();
  const editTopicFetcher = useFetcher();
  const delTopicFetcher = useFetcher();
  const delVocabFetcher = useFetcher();
  const { topicId } = useParams();
  const { topic, vocabs: vocabsPromise } = useLoaderData();
  const [ vocabs, setVocabs ] = useState([]);
  const navigate = useNavigate();

  const isNew = () => topicId === 'new';

  useEffect(() => {
    if (!isNew()) {
      vocabsPromise.then(data => setVocabs(data.data.map((v, i) => ({ ...v, idx: i }))));
    }
  }, [vocabsPromise]);

  useEffect(() => {
    if (editTopicFetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE, 
        message: isNew() 
          ? "Topic updated successfully"
          : "Topic created successfully"
      }));
      if (isNew()) {
        const newId = editTopicFetcher.data?.data.id;
        navigate(`/topic/${newId}`);
      }
    }
  }, [editTopicFetcher.data]);

  useEffect(() => {
    if (delTopicFetcher.data?.status === "success") {
      navigate(`/topics`);
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE, 
        message: "Topic deleted successfully"
      }));
    }
  }, [delTopicFetcher.data]);

  useEffect(() => {
    if (delVocabFetcher.data?.status === "success") {
      const removeId = delVocabFetcher.data.data.id;
      setVocabs(oldState => oldState.filter(v => v.id != removeId));
    }
  }, [delVocabFetcher.data]);

  const handleDelTopic = () => {
    const formData = new FormData();
    formData.append('_not_revalidate', '1');
    delTopicFetcher.submit(formData, {
      action: `/topic/${topicId}/delete`, 
      method: 'delete'
    });
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-6 text-start mb-4">
          <h2>Topic info</h2>
          <editTopicFetcher.Form action={`/topic/${topicId}`} method={isNew() ? 'post' : 'put'}>
            <input type="hidden" name="_not_revalidate" defaultValue={'1'}/>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" className="form-control" name="name" defaultValue={topic?.name}/>
            </div>
            {editTopicFetcher.data?.errors?.name && (
              <ul>
                {editTopicFetcher.data.errors.name.map((error, index) => (
                  <li className='text-danger' key={index}>{error}</li>
                ))}
              </ul>
            )}
            <div className="mb-3">
              <label htmlFor="descriptions" className="form-label">Descriptions</label>
              <textarea rows={5} className="form-control" name="descriptions" defaultValue={topic?.descriptions}></textarea>
            </div>
            {editTopicFetcher.data?.errors?.descriptions && (
              <ul>
                {editTopicFetcher.data.errors.descriptions.map((error, index) => (
                  <li className='text-danger' key={index}>{error}</li>
                ))}
              </ul>
            )}
            <Link to={`/topics`} className="btn btn-secondary me-2">
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            <button type="submit" className="btn btn-primary me-2" disabled={editTopicFetcher.state === "submitting"}>
              <i className="bi bi-pencil-square text-white"></i> {editTopicFetcher.state === "submitting" ? "Saving..." : "Save"}
            </button>
            {!isNew() && (
              <button type="button" className="btn btn-danger" onClick={handleDelTopic} disabled={delTopicFetcher.state === "submitting"}>
                <i className="bi bi-trash text-white"></i> {delTopicFetcher.state === "submitting" ? "Deleting..." : "Delete"}
              </button>
            )}
          </editTopicFetcher.Form>
        </div>
        {!isNew() && (
          <div className="col-lg-6 text-start">
            <h2>Vocabularies</h2>
            <ErrorBoundary fallback={<p className='alert alert-danger'>Can not get data</p>}>
              <Suspense fallback={<p className='text-center'>Loading...</p>}>
                <Await resolve={vocabsPromise}>
                  {(data) => (
                    <div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {delVocabFetcher.state == 'submitting' && (<p className='text-center'>Loading...</p>)}
                      <table className="table table-striped">
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                          <tr>
                            <th>#</th>
                            <th>Word</th>
                            <th>Descriptions</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {vocabs.length > 0 ? (
                            vocabs.map((vocab, index) => (
                              <tr key={vocab.id}>
                                <td>{index + 1}</td>
                                <td>{vocab.word}</td>
                                <td>{vocab?.descriptions}</td>
                                <td>
                                  <div className='d-flex justify-content-end'>
                                    <Link  to={`/topic/${topicId}/vocab/${vocab.id}`} className="me-2">
                                      <i className="bi bi-pencil-square text-dark"></i>
                                    </Link>
                                    <delVocabFetcher.Form action={`/topic/${topicId}/vocab/${vocab.id}/delete`} method="delete">
                                      <input type="hidden" name="_not_revalidate" defaultValue={'1'} />
                                      <button disabled={delVocabFetcher.state == 'submitting'} type="submit" className="btn btn-link p-0">
                                        <i className="bi bi-trash text-dark"></i>
                                      </button>
                                    </delVocabFetcher.Form>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td className='text-center' colSpan="4">No vocabularies found</td>
                            </tr>
                          )}
                          <tr>
                            <td className='text-end' colSpan="4">
                              <Link to={`/topic/${topicId}/vocab/import`} className="btn btn-secondary me-2">
                                <i className="bi bi-download"></i> Export
                              </Link>
                              <Link to={`/topic/${topicId}/vocab/import`} className="btn btn-secondary me-2">
                                <i className="bi bi-upload"></i> Import
                              </Link>
                              <Link to={`/topic/${topicId}/vocab/new`} className="btn btn-secondary">
                                <i className="bi bi-plus-circle"></i> New
                              </Link>
                            </td>
                          </tr>
                        </tbody>            
                      </table>
                    </div>
                  )}
                </Await>
              </Suspense>
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default Topic;
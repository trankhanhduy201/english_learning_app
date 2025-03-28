import React, { Suspense, useEffect } from 'react';
import { Await, Link, useFetcher, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Form } from "react-bootstrap";
import _ from "lodash";
import * as alertConfigs from "../configs/alertConfigs";
import { setAlert } from '../stores/slices/alertSlice';
import TranslationTabs from '../components/pages/vocab/TranslationTabs';
import LoadingOverlay from '../components/LoadingOverlay';

const Vocab = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vocabFetcher = useFetcher();
  const delVocabFetcher = useFetcher();
  const { topicId, vocabId } = useParams();
  const { vocabPromise, topicsPromise } = useLoaderData();

  useEffect(() => {
    if (vocabFetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: `Vocab is ${vocabId === 'new' ? 'created' : 'updated'} successfully`
      }));
      if (vocabId === 'new') {
        if (vocabFetcher.data.data?.id) {
          navigate(`/topic/${topicId}/vocab/${vocabFetcher.data.data.id}`);
        } else {
          navigate(`/topic/${topicId}`);
        }
      }
    }
  }, [vocabFetcher.data]);

  useEffect(() => {
    if (delVocabFetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: "Vocab deleted successfully"
      }));
      navigate(`/topic/${topicId}`);
    }
  }, [delVocabFetcher.data]);

  const handleDelVocab = () => {
    const formData = new FormData();
    formData.append('_not_revalidate', '1');
    delVocabFetcher.submit(formData, {
      action: `/topic/${topicId}/vocab/${vocabId}/delete`, 
      method: 'delete'
    });
  }

  return (
    <div className="container mt-4">
      <Suspense fallback={<LoadingOverlay />}>
        <Await resolve={vocabPromise}>
          {(data) => (
            <vocabFetcher.Form action={`/topic/${topicId}/vocab/${vocabId}`} method={vocabId === 'new' ? 'POST' : 'PUT'}>
            <div className="row">
              <div className="col-lg-6 text-start mb-4">
                <h1 className='text-start'>Vocab info</h1>
                <input type="hidden" name="_not_revalidate" defaultValue={'1'}/>
                <div className="mb-3">
                  <label htmlFor="word" className="form-label">Name</label>
                  <input type="text" className="form-control" name="word" defaultValue={data.word}/>
                </div>
                {vocabFetcher.data?.errors?.word && (
                  <ul>
                    {vocabFetcher.data.errors.word.map((error, index) => (
                      <li className='text-danger' key={index}>{error}</li>
                    ))}
                </ul>
                )}
                <div className="mb-3">
                  <label htmlFor="topic" className="form-label">Topic</label>
                    <Suspense fallback={<option>Loading...</option>}>
                      <Await resolve={topicsPromise}>
                        {(dataTopic) => 
                          <>
                            <Form.Select
                              className='form-control'
                              name='topic'
                              defaultValue={topicId}
                            >
                              <option value=''>-- No choice --</option>
                              {dataTopic && (
                                dataTopic.map((item, index) => (
                                  <option key={index} value={item.id}>{item.name}</option>
                                ))
                              )}
                            </Form.Select>
                          </>
                        }
                      </Await>
                    </Suspense>
                </div>
                {vocabFetcher.data?.errors?.topic && (
                  <ul>
                    {vocabFetcher.data.errors.topic.map((error, index) => (
                      <li className='text-danger' key={index}>{error}</li>
                    ))}
                  </ul>
                )}
                <div className="mb-3">
                  <label htmlFor="descriptions" className="form-label">Descriptions</label>
                  <textarea rows={5} className="form-control" name="descriptions" defaultValue={data?.descriptions}></textarea>
                </div>
                {vocabFetcher.data?.errors?.descriptions && (
                  <ul>
                    {vocabFetcher.data.errors.descriptions.map((error, index) => (
                      <li className='text-danger' key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-lg-6 text-start">
                <h1 className='text-start'>Translations</h1>
                <div className="container mt-4">
                  <TranslationTabs data={data.translations} />
                </div>
              </div>
              <div className='d-flex justify-content-start'>
                <Link to={`/topic/${topicId}`} className="btn btn-secondary me-2">
                  <i className="bi bi-arrow-left"></i> Topic info
                </Link>
                <button type="submit" className="btn btn-primary me-2" disabled={vocabFetcher.state === "submitting"}>
                  <i className="bi bi-pencil-square text-white"></i> {vocabFetcher.state === "submitting" ? "Saving..." : "Save"}
                </button>
                <button type="button" className="btn btn-danger" disabled={delVocabFetcher.state === "submitting"} onClick={handleDelVocab}>
                  <i className="bi bi-trash text-white"></i> {delVocabFetcher.state === "submitting" ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
            </vocabFetcher.Form>
          )}
        </Await>
      </Suspense>
    </div>
  );
};

export default Vocab;
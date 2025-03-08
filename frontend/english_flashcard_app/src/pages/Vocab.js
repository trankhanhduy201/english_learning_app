import React, { Suspense, useMemo } from 'react';
import { Await, Link, useFetcher, useLoaderData, useParams } from 'react-router-dom';
import { Tab, Tabs } from "react-bootstrap";
import _ from "lodash";

const Vocab = () => {
  const { topicId, vocabId } = useParams();
  const { vocab, topics: topicsPromise } = useLoaderData();
  const fetcher = useFetcher();
  const translations = useMemo(() => {
    if (vocab.translations.length > 0) {
      return _.groupBy(vocab.translations, 'language');
    }
    return [];
  }, [vocab.translations]);

  return (
    <div className="container mt-4">
      <fetcher.Form action={`/topic/${topicId}/vocab/${vocabId}`} method="put">
      <div className="row">
        <div className="col-lg-6 text-start">
          <h1 className='text-start'>Vocab info</h1>
            <input type="hidden" name="_not_revalidate" defaultValue={'1'}/>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" className="form-control" name="name" defaultValue={vocab.word}/>
            </div>
            {fetcher.data?.errors?.name && (
              <ul>
                {fetcher.data.errors.name.map((error, index) => (
                  <li className='text-danger' key={index}>{error}</li>
                ))}
            </ul>
            )}
            <div className="mb-3">
              <label htmlFor="topic_id" className="form-label">Topic</label>
              <select className='form-control' name='topic_id' defaultValue={vocab.topic_id}>
                <option>-- No choice --</option>
                <Suspense fallback={<option>Loading...</option>}>
                  <Await resolve={topicsPromise}>
                    {(data) => 
                      <>
                        {data.data && (
                          data.data.map((item, index) => (
                            <option key={index}>{item.name}</option>
                          )
                        ))}
                      </>
                    }
                  </Await>
                </Suspense>
              </select>
            </div>
            {fetcher.data?.errors?.topic_id && (
              <ul>
                {fetcher.data.errors.topic_id.map((error, index) => (
                  <li className='text-danger' key={index}>{error}</li>
                ))}
              </ul>
            )}
        </div>
        <div className="col-lg-6 text-start">
          <h1 className='text-start'>Translations</h1>
          <div className="container mt-4">
            <Tabs defaultActiveKey="en" id="my-tabs" className="mb-3">
              {Object.keys(translations).map((lang, index) => 
                <Tab key={index} eventKey={lang} title={lang}>
                  <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table className="table table-striped">
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                        <tr>
                          <th>#</th>
                          <th>Translation</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {translations[lang].length > 0 ? (
                          translations[lang].map((item, index) => (
                            <tr key={index}>
                              <td className="align-middle">{index + 1}</td>
                              <td>
                                <input type="text" className="form-control" name={`[translations][translation]`} defaultValue={item.translation}/>
                                <input type="hidden" className="form-control" name={`[translations][id]`} defaultValue={item.id}/>
                                <input type="hidden" className="form-control" name={`[translations][language]`} defaultValue={item.language}/>
                              </td>
                              <td className="align-middle">
                                <div className='d-flex justify-content-end'>
                                  <Link to={`/topic/${topicId}/vocab/${vocabId}`} className="me-2">
                                    <i className="bi bi-floppy text-dark"></i>
                                  </Link>
                                  <Link to={`/topic/${topicId}/vocab/${vocabId}/delete`}>
                                    <i className="bi bi-trash text-dark"></i>
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className='text-center' colSpan="3">No translation found</td>
                          </tr>
                        )}
                      </tbody>            
                    </table>
                  </div>
                </Tab>
              )}
            </Tabs>
          </div>
        </div>
        <div className='d-flex justify-content-start'>
          <button type="submit" className="btn btn-primary" disabled={fetcher.state === "submitting"}>
            {fetcher.state === "submitting" ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      </fetcher.Form>
    </div>
  );
};

export default Vocab;

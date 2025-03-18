import React, { Suspense, useEffect, useState } from 'react';
import { Await, useFetcher, useLoaderData, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Tab, Tabs, Form } from "react-bootstrap";
import _ from "lodash";
import * as alertConfigs from "../configs/alertConfigs";
import { setAlert } from '../stores/slices/alertSlice';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { SortableTr } from '../components/SortableTr';

const Vocab = () => {
  const vocabFetcher = useFetcher();
  const dispatch = useDispatch();
  const { topicId, vocabId } = useParams();
  const { vocab, topics: topicsPromise } = useLoaderData();
  const [translations, setTranslations] = useState(
    _.groupBy(vocab.translations.map((t, index) => ({ ...t, idx: index })), 'language')
  );

  useEffect(() => {
    if (vocabFetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: "Vocab updated successfully"
      }));
    }
  }, [vocabFetcher.data]);

  const handleDelTrans = (idx, lang) => {
    setTranslations(oldState => ({
      ...oldState,
      [lang]: oldState[lang].filter((v) => v.idx !== idx)
    }));
  }

  const handleAddTrans = (lang) => {
    setTranslations(oldState => {
      const newId = Math.max(...oldState[lang].map(t => t.id)) + 1;
      return {
        ...oldState,
        [lang]: [...oldState[lang], { translation: '', language: lang, idx: newId }]
      };
    });
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event, lang) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTranslations(oldState => {
        const oldItems = oldState[lang];
        const oldIndex = oldItems.findIndex(item => item.idx === active.id);
        const newIndex = oldItems.findIndex(item => item.idx === over.id);
        const newItems = arrayMove(oldItems, oldIndex, newIndex);
        return {
          ...oldState,
          [lang]: newItems
        };
      });
    }
  };

  return (
    <div className="container mt-4">
      <vocabFetcher.Form action={`/topic/${topicId}/vocab/${vocabId}`} method="put">
        <div className="row">
          <div className="col-lg-6 text-start mb-4">
            <h1 className='text-start'>Vocab info</h1>
              <input type="hidden" name="_not_revalidate" defaultValue={'1'}/>
              <div className="mb-3">
                <label htmlFor="word" className="form-label">Name</label>
                <input type="text" className="form-control" name="word" defaultValue={vocab.word}/>
              </div>
              {vocabFetcher.data?.errors?.name && (
                <ul>
                  {vocabFetcher.data.errors.name.map((error, index) => (
                    <li className='text-danger' key={index}>{error}</li>
                  ))}
              </ul>
              )}
              <div className="mb-3">
                <label htmlFor="topic" className="form-label">Topic</label>
                  <Suspense fallback={<option>Loading...</option>}>
                    <Await resolve={topicsPromise}>
                      {(data) => 
                        <>
                          <Form.Select
                            className='form-control'
                            name='topic'
                            defaultValue={vocab.topic}
                          >
                            <option value=''>-- No choice --</option>
                            {data.data && (
                              data.data.map((item, index) => (
                                <option key={index} value={item.id}>{item.name}</option>
                              ))
                            )}
                          </Form.Select>
                        </>
                      }
                    </Await>
                  </Suspense>
              </div>
              {vocabFetcher.data?.errors?.topic_id && (
                <ul>
                  {vocabFetcher.data.errors.topic_id.map((error, index) => (
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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, lang)}
                    >
                      <SortableContext
                        items={translations[lang].map(item => item.idx)}
                        strategy={verticalListSortingStrategy}
                      >
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
                                <>
                                  {translations[lang].map((item, index) => (
                                    <SortableTr key={item.idx} id={item.idx}>
                                      <td className="align-middle">{index + 1}</td>
                                      <td>
                                        <input
                                          type="text"
                                          className="form-control"
                                          name={`translations[${item.idx}][translation]`}
                                          defaultValue={item.translation}
                                        />
                                        <input
                                          type="hidden"
                                          className="form-control"
                                          name={`translations[${item.idx}][language]`}
                                          defaultValue={lang}
                                        />
                                        {item.id && (
                                          <input 
                                            type="hidden"
                                            className="form-control"
                                            name={`translations[${item.idx}][id]`}
                                            defaultValue={item.id}
                                          />
                                        )}
                                      </td>
                                      <td className="align-middle">
                                        <div className='d-flex justify-content-center'>
                                          <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            onClick={(e) => handleDelTrans(item.idx, item.language)}
                                          >
                                            <i className="bi bi-trash text-dark"></i>
                                          </button>
                                        </div>
                                      </td>
                                    </SortableTr>
                                  ))}
                                </>
                              ) : (
                                <tr>
                                  <td className='text-center' colSpan="3">No translation found</td>
                                </tr>
                              )}
                              <tr>
                                <td className='text-end' colSpan="3">
                                  <button type="button" className='btn btn-secondary' onClick={() => handleAddTrans(lang)}>
                                    <i className="bi bi-plus-circle"></i> Add
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </SortableContext>
                    </DndContext>
                  </Tab>
                )}
              </Tabs>
            </div>
          </div>
          <div className='d-flex justify-content-start'>
            <button type="submit" className="btn btn-primary" disabled={vocabFetcher.state === "submitting"}>
              {vocabFetcher.state === "submitting" ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </vocabFetcher.Form>
    </div>
  );
};

export default Vocab;
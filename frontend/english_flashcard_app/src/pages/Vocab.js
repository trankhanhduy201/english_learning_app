import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Await, Link, useFetcher, useLoaderData, useNavigate, useParams } from 'react-router-dom';
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
import * as utils from '../utils/commons';

const EVENT_KEY_NEW_TAB = 'new';

const Vocab = () => {
  const navigate = useNavigate();
  const vocabFetcher = useFetcher();
  const dispatch = useDispatch();
  const { topicId, vocabId } = useParams();
  const { vocab, topics: topicsPromise } = useLoaderData();
  const [ activeTab, setActiveTab ] = useState('en');
  const [ translations, setTranslations ] = useState(
    _.groupBy(vocab?.translations.map((v, i) => ({ ...v, idx: i })), 'language')
  );


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
    const langs = Object.keys(translations)
    setActiveTab(oldState => langs.length > 0 ? langs[0] : EVENT_KEY_NEW_TAB);
  }, []);

  const handleDelTrans = (idx, lang) => {
    setTranslations(oldState => ({
      ...oldState,
      [lang]: oldState[lang].filter((v) => v.idx !== idx)
    }));
  }

  const handleAddTrans = (lang) => {
    setTranslations(oldState => {
      const newId = utils.getNextMaxId(oldState[lang], 'idx');
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

  const textRef = useRef(null);
  const languageRef = useRef(null);
  const handleAddLang = () => {
    const nWord = textRef.current.value;
    const sLang= languageRef.current.value;
    if (!nWord || !sLang) {
      textRef.current.style.borderColor = !nWord ? 'red' : '';
      languageRef.current.style.borderColor = !sLang ? 'red' : '';
      return;
    }

    setTranslations(oldState => {
      let newVocab = { 
        translation: nWord, 
        language: sLang, 
        idx: 0 
      }

      if (!oldState[sLang]) {
        return { ...oldState, [sLang]: [newVocab] };
      }

      newVocab.idx = Math.max(...oldState[sLang].map(t => t.idx)) + 1;
      return { ...oldState, [sLang]: [...oldState[sLang], newVocab]};
    });

    // Reset input fields
    textRef.current.value = "";
    languageRef.current.value = "";
    textRef.current.style.borderColor = '';
    languageRef.current.style.borderColor = '';
    setActiveTab(sLang);
  };

  const delVocabFetcher = useFetcher();
  const handleDelVocab = () => {
    const formData = new FormData();
    formData.append('_not_revalidate', '1');
    delVocabFetcher.submit(formData, {
      action: `/topic/${topicId}/vocab/${vocabId}/delete`, 
      method: 'delete'
    });
  }

  useEffect(() => {
    if (delVocabFetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: "Vocab deleted successfully"
      }));
      navigate(`/topic/${topicId}`);
    }
  }, [delVocabFetcher.data]);

  return (
    <div className="container mt-4">
      <vocabFetcher.Form action={`/topic/${topicId}/vocab/${vocabId}`} method={vocabId === 'new' ? 'POST' : 'PUT'}>
        <div className="row">
          <div className="col-lg-6 text-start mb-4">
            <h1 className='text-start'>Vocab info</h1>
              <input type="hidden" name="_not_revalidate" defaultValue={'1'}/>
              <div className="mb-3">
                <label htmlFor="word" className="form-label">Name</label>
                <input type="text" className="form-control" name="word" defaultValue={vocab?.word}/>
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
                      {(data) => 
                        <>
                          <Form.Select
                            className='form-control'
                            name='topic'
                            defaultValue={topicId}
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
              {vocabFetcher.data?.errors?.topic && (
                <ul>
                  {vocabFetcher.data.errors.topic.map((error, index) => (
                    <li className='text-danger' key={index}>{error}</li>
                  ))}
                </ul>
              )}
              <div className="mb-3">
                <label htmlFor="descriptions" className="form-label">Descriptions</label>
                <textarea rows={5} className="form-control" name="descriptions" defaultValue={vocab?.descriptions}></textarea>
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
              <Tabs activeKey={activeTab} onSelect={k => setActiveTab(k)} id="my-tabs" className="mb-3">
                {Object.keys(translations).map((lang, index) => 
                  <Tab key={index} eventKey={lang} title={lang} >
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
                                          name={`translations[${lang}][${item.idx}][translation]`}
                                          defaultValue={item.translation}
                                        />
                                        <input
                                          type="hidden"
                                          className="form-control"
                                          name={`translations[${lang}][${item.idx}][language]`}
                                          defaultValue={lang}
                                        />
                                        {item.id && (
                                          <input 
                                            type="hidden"
                                            className="form-control"
                                            name={`translations[${lang}][${item.idx}][id]`}
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
                <Tab key={Object.keys(translations).length + 1} eventKey={EVENT_KEY_NEW_TAB} title={'＋'}>
                  <div className="mb-3">
                    <label htmlFor="textInput" className="form-label">Enter word</label>
                    <input type="text" className="form-control" id="textInput" placeholder="Type something..." ref={textRef} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="languageSelect" className="form-label">Select Language</label>
                    <select className="form-select" id="languageSelect" ref={languageRef}>
                      <option value="">-- No choice --</option>
                      <option value="en">English</option>
                      <option value="ja">Japanese (日本語)</option>
                      <option value="vn">Vietnamese (Tiếng Việt)</option>
                    </select>
                  </div>
                  <div className="mb-3 text-end">
                    <button type="button" className='btn btn-secondary' onClick={() => handleAddLang()}>
                      <i className="bi bi-plus-circle"></i> Add
                    </button>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
          <div className='d-flex justify-content-start'>
            <Link to={`/topic/${topicId}`} className="btn btn-secondary me-2">
              <i className="bi bi-arrow-left"></i> Back
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
    </div>
  );
};

export default Vocab;
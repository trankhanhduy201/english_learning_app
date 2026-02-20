import React, { useEffect, useRef, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import _ from "lodash";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTr } from "../../../components/SortableTr";
import * as utils from "../../../utils/commons";
import * as transType from "../../../enums/transType";

const EVENT_KEY_NEW_TAB = "new";

const TranslationTabs = ({ data }) => {
  const textRef = useRef(null);
  const languageRef = useRef(null);
  const typeRef = useRef(null);
  const [activeTab, setActiveTab] = useState("en");
  const [translations, setTranslations] = useState(
    _.groupBy(
      data.map((v, i) => ({ ...v, idx: i })),
      "language",
    ),
  );

  useEffect(() => {
    const langs = Object.keys(translations);
    setActiveTab(langs.length > 0 ? langs[0] : EVENT_KEY_NEW_TAB);
  }, []);

  const handleDelTrans = (idx, lang) => {
    setTranslations((oldState) => ({
      ...oldState,
      [lang]: oldState[lang].filter((v) => v.idx !== idx),
    }));
  };

  const handleAddTrans = (lang) => {
    setTranslations((oldState) => {
      const newId = utils.getNextMaxId(oldState[lang], "idx");
      return {
        ...oldState,
        [lang]: [
          ...oldState[lang],
          { translation: "", language: lang, idx: newId },
        ],
      };
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event, lang) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTranslations((oldState) => {
        const oldItems = oldState[lang];
        const oldIndex = oldItems.findIndex((item) => item.idx === active.id);
        const newIndex = oldItems.findIndex((item) => item.idx === over.id);
        const newItems = arrayMove(oldItems, oldIndex, newIndex);
        return {
          ...oldState,
          [lang]: newItems,
        };
      });
    }
  };

  const handleAddLang = () => {
    const nWord = textRef.current.value;
    const sLang = languageRef.current.value;
    const sType = typeRef.current?.value;

    if (!nWord || !sLang || !sType) {
      textRef.current.style.borderColor = !nWord ? "red" : "";
      languageRef.current.style.borderColor = !sLang ? "red" : "";
      typeRef.current.style.borderColor = !sType ? "red" : "";
      return;
    }

    setTranslations((oldState) => {
      let newVocab = {
        translation: nWord,
        language: sLang,
        type: sType,
        idx: 0,
      };

      if (!oldState[sLang]) {
        return { ...oldState, [sLang]: [newVocab] };
      }

      newVocab.idx = Math.max(...oldState[sLang].map((t) => t.idx)) + 1;
      return { ...oldState, [sLang]: [...oldState[sLang], newVocab] };
    });

    // Reset input fields
    textRef.current.value = "";
    languageRef.current.value = "";
    typeRef.current.value = "";

    textRef.current.style.borderColor = "";
    languageRef.current.style.borderColor = "";
    typeRef.current.style.borderColor = "";

    setActiveTab(sLang);
  };

  return (
    <Tabs
      activeKey={activeTab}
      onSelect={(k) => setActiveTab(k)}
      id="my-tabs"
      className="mb-3"
    >
      {Object.keys(translations).map((lang) => (
        <Tab key={lang} eventKey={lang} title={lang}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, lang)}
          >
            <SortableContext
              items={translations[lang].map((item) => item.idx)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className="table-responsive"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <table className="table table-striped">
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      backgroundColor: "white",
                      zIndex: 1,
                    }}
                  >
                    <tr>
                      <th>#</th>
                      <th>Translation</th>
                      <th>Type</th>
                      <th>Note</th>
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
                                placeholder="Translation..."
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
                            <td>
                              <select
                                className="form-control"
                                name={`translations[${lang}][${item.idx}][type]`}
                                defaultValue={item.type}
                              >
                                <option></option>
                                {transType.getDatas().map((v) => (
                                  <option key={v.key} value={v.key}>
                                    {v.text}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <textarea
                                rows={1}
                                placeholder="Examples..."
                                className="form-control"
                                name={`translations[${lang}][${item.idx}][note]`}
                                defaultValue={item.note}
                              ></textarea>
                            </td>
                            <td className="align-middle">
                              <div className="d-flex justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-link p-0"
                                  onClick={(e) =>
                                    handleDelTrans(item.idx, item.language)
                                  }
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
                        <td className="text-center" colSpan="5">
                          No translation found
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="text-end" colSpan="5">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => handleAddTrans(lang)}
                        >
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
      ))}
      <Tab
        key={EVENT_KEY_NEW_TAB}
        eventKey={EVENT_KEY_NEW_TAB}
        title={"＋"}
      >
        <div className="mb-3">
          <label htmlFor="textInput" className="form-label">
            Translation
          </label>
          <input
            type="text"
            className="form-control"
            id="textInput"
            placeholder="Translation..."
            ref={textRef}
          />
        </div>
        <div className="mb-3">
          <div className="row">
            <div className="col-12 col-sm-6 mb-3 mb-sm-0">
              <label htmlFor="languageSelect" className="form-label">
                Select Language
              </label>
              <select
                className="form-select"
                id="languageSelect"
                ref={languageRef}
              >
                <option value="">-- No choice --</option>
                <option value="en">English</option>
                <option value="ja">Japanese (日本語)</option>
                <option value="vn">Vietnamese (Tiếng Việt)</option>
              </select>
            </div>
            <div className="col-12 col-sm-6">
              <label htmlFor="type" className="form-label">
                Type
              </label>
              <select id="type" className="form-control" ref={typeRef}>
                <option value="">-- No choice --</option>
                {transType.getDatas().map((v) => (
                  <option key={v.key} value={v.key}>
                    {v.text}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="note" className="form-label">
            Note
          </label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Examples..."
          ></textarea>
        </div>
        <div className="mb-3 text-end">
          <button
            type="button"
            className="btn btn-secondary w-sm-100"
            onClick={() => handleAddLang()}
          >
            <i className="bi bi-plus-circle"></i> Add
          </button>
        </div>
      </Tab>
    </Tabs>
  );
};

export default TranslationTabs;

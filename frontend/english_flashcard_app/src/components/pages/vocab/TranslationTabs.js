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

const TranslationTabs = ({ data, errors = {} }) => {
  const textRef = useRef(null);
  const languageRef = useRef(null);
  const typeRef = useRef(null);
  const noteRef = useRef(null);
  const [activeTab, setActiveTab] = useState("en");

  const getKey = () => crypto.randomUUID();

  const getFieldError = (lang, key, field) => {
    return errors?.[lang]?.[key]?.[field];
  };

  const getTabError = (lang) => 
    translations[lang]?.some(
      (item) => errors?.[lang]?.[item.key] ? true : false
    );

  const [translations, setTranslations] = useState(
    _.groupBy(
      data.map((v, i) => ({ ...v, pos: i, key: getKey() })),
      "language",
    ),
  );

  useEffect(() => {
    const langs = Object.keys(translations);
    setActiveTab(langs.length > 0 ? langs[0] : EVENT_KEY_NEW_TAB);
  }, []);

  const handleDelTrans = (key, lang) => {
    let isRemoveTab = false;
    setTranslations((oldState) => {
      const list = oldState[lang] ?? [];
      const filtered = list.filter((v) => v.key !== key);

      // still has items → keep lang
      if (filtered.length > 0) {
        return {
          ...oldState,
          [lang]: filtered,
        };
      }

      // no items → remove lang
      isRemoveTab = true;
      const { [lang]: _, ...rest } = oldState;
      return rest;
    });

    if (isRemoveTab && activeTab === lang) {
      setActiveTab(EVENT_KEY_NEW_TAB);
    }
  };

  const handleAddTrans = (lang) => {
    setTranslations((oldState) => {
      const newPos = utils.getNextMaxId(oldState[lang], "pos");
      return {
        ...oldState,
        [lang]: [
          ...oldState[lang],
          { 
            translation: null, 
            language: lang, 
            type: null,
            note: null,
            pos: newPos, 
            key: getKey() 
          },
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
        const oldItems = [ ...oldState[lang]];
        const oldIndex = oldItems.findIndex((item) => item.pos === active.id);
        const newIndex = oldItems.findIndex((item) => item.pos === over.id);
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
    const sNote = noteRef.current?.value;

    if (!nWord || !sLang) {
      textRef.current.style.borderColor = !nWord ? "red" : "";
      languageRef.current.style.borderColor = !sLang ? "red" : "";
      return;
    }

    setTranslations((oldState) => {
      const listTrans = oldState[sLang] ?? [];
      const newPos = utils.getNextMaxId(listTrans, "pos");

      return {
        ...oldState, 
        [sLang]: [
          ...listTrans, 
          {
            translation: nWord,
            language: sLang,
            type: sType,
            note: sNote,
            pos: newPos,
            key: getKey()
          }
        ] 
      };
    });

    // Reset input fields
    textRef.current.value = "";
    languageRef.current.value = "";
    typeRef.current.value = "";
    noteRef.current.value = "";

    textRef.current.style.borderColor = "";
    languageRef.current.style.borderColor = "";
    typeRef.current.style.borderColor = "";
    noteRef.current.style.borderColor = "";

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
        <Tab 
          key={lang} 
          eventKey={lang} 
          title={
            <span className="d-inline-flex align-items-center gap-1">
              {lang}
              {getTabError(lang) && (
                <i className="bi bi-exclamation-circle-fill text-danger"></i>
              )}
            </span>
          }
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, lang)}
          >
            <SortableContext
              items={translations[lang].map((item) => item.pos)}
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
                          <SortableTr key={item.pos} id={item.pos}>
                            <td className="align-middle">{index + 1}</td>
                            <td>
                              <input
                                type="text"
                                className={`form-control ${getFieldError(lang, item.key, "translation") ? "is-invalid" : ""}`}
                                name={`translations[${lang}][${item.key}][translation]`}
                                defaultValue={item.translation}
                                placeholder="Translation..."
                              />
                              <input
                                type="hidden"
                                className="form-control"
                                name={`translations[${lang}][${item.key}][language]`}
                                defaultValue={lang}
                              />
                              {item.id && (
                                <input
                                  type="hidden"
                                  className="form-control"
                                  name={`translations[${lang}][${item.key}][id]`}
                                  defaultValue={item.id}
                                />
                              )}
                            </td>
                            <td>
                              <select
                                className={`form-control ${getFieldError(lang, item.key, "type") ? "is-invalid" : ""}`}
                                name={`translations[${lang}][${item.key}][type]`}
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
                                className={`form-control ${getFieldError(lang, item.key, "note") ? "is-invalid" : ""}`}
                                name={`translations[${lang}][${item.key}][note]`}
                                defaultValue={item.note}
                              ></textarea>
                            </td>
                            <td className="align-middle">
                              <div className="d-flex justify-content-center">
                                <button
                                  type="button"
                                  className="btn btn-link p-0"
                                  onClick={(e) =>
                                    handleDelTrans(item.key, item.language)
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
            ref={noteRef}
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

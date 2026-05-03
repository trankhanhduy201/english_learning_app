import React, { memo, useCallback, useEffect, useState } from "react";
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
import CreateLanguageTabForm from "./CreateLanguageTabForm";

const EVENT_KEY_NEW_TAB = "new";

const TranslationTabs = memo(({ data, errors = {}, vocabFormRef }) => {
  const [activeTab, setActiveTab] = useState("en");

  const getKey = useCallback(() => crypto.randomUUID(), []);

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

  const handleAddTrans = useCallback((lang, transItem = {}) => {
    setTranslations((oldState) => {
      const listTrans = oldState[lang] ?? [];
      const newPos = utils.getNextMaxId(listTrans, "pos");

      // Note: Using typescript to define type of transItem later,
      // that will help to avoid error of missing field when add new translation item
      return {
        ...oldState,
        [lang]: [
          ...listTrans,
          {
            translation: transItem.translation ?? "",
            type: transItem.type ?? "",
            note: transItem.note ?? "",
            ...transItem,
            language: lang,
            pos: newPos,
            key: getKey(),
          },
        ],
      };
    });
  }, [getKey]);

  const handleCreatedTranslationTab = useCallback(
    (item) => {
      if (!item || !item.language) {
        return;
      }
      handleAddTrans(item.language, item);
      setActiveTab(item.language);
    },
    [handleAddTrans],
  );

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
        <CreateLanguageTabForm 
          onCreated={handleCreatedTranslationTab} 
          vocabFormRef={vocabFormRef}
        />
      </Tab>
    </Tabs>
  );
});

export default TranslationTabs;

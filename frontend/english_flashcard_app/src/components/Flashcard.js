import React, {
  memo,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getRandomIntWithExceptions } from "../utils/commons";
import * as transType from "../enums/transType";
import { LANGUAGES } from "../configs/langConfig";
import useAudio from "../hooks/useAudio";
import { Link, useParams } from "react-router-dom";

export const EMPTY_VOCAB = {
  idx: "",
  word: "",
  type: "",
  language: "",
  translations: [],
  topic_id: "",
  vocab_id: "",
  audio: "", // Added audio property to EMPTY_VOCAB
};

const FlashcardSettingButtons = memo(
  ({ vocab, isActive, isOrder, isOpen, onOpenCard, onReverseVocabs, onChangeOrder, onPlayAudio }) => {
    const { topicId } = useParams();
    return (
      <>
        <div className="position-absolute bottom-0 start-0" style={{ zIndex: 1 }}>
          <Link 
            disabled={!isActive} 
            className="btn btn-secondary btn-flashcard"
            to={isActive 
              ? `/topic/${topicId}/vocab/${vocab.vocab_id}`
              : `/topic/${topicId}`
            }
          >
            <i className="bi bi-pencil-square text-black"></i>
          </Link>
          <button
            disabled={!isActive}
            className="btn btn-secondary btn-flashcard"
            onClick={() => onReverseVocabs()}
          >
            <i className="bi bi-arrow-repeat text-black"></i>
          </button>
          <button
            disabled={!isActive}
            className="btn btn-secondary btn-flashcard"
            onClick={onOpenCard}
          >
            <i
              className={`bi ${isOpen ? "bi-lightbulb" : "bi-lightbulb-off"} text-black`}
            ></i>
          </button>
          {/* <button disabled={!isActive} className="btn btn-secondary btn-flashcard">
            <i className="bi bi-youtube text-black"></i>
          </button> */}
          <button
            disabled={!isActive}
            className="btn btn-secondary btn-flashcard"
            onClick={onChangeOrder}
          >
            {isOrder ? (
              <i className="bi bi-list-ol text-black"></i>
            ) : (
              <i className="bi bi-shuffle text-black"></i>
            )}
          </button>
          {vocab.audio && (
            <button
              disabled={!isActive}
              className="btn btn-secondary btn-flashcard"
              onClick={() => onPlayAudio(vocab.audio)}
            >
              <i className="bi bi-megaphone text-black"></i>
            </button>
          )}
        </div>
      </>
    );
  },
);

const CardDirectionButtons = memo(
  ({ vocab, length, isActive, isOrder, onPickVocab }) => {
    return (
      <div className="w-100 position-absolute top-0 left-0 d-flex align-item-center pt-3 px-1" style={{ zIndex: 1 }}>
        <button
          disabled={!isActive || (isOrder && vocab.idx === 0)}
          className="btn btn-secondary btn-flashcard me-auto"
          onClick={(e) => {
            e.stopPropagation();
            onPickVocab(isOrder ? "prev" : "");
          }}
        >
          <i className="bi bi-arrow-left-circle text-black"></i>
        </button>
        <button
          disabled={!isActive || (isOrder && vocab.idx === length - 1)}
          className="btn btn-secondary btn-flashcard"
          onClick={(e) => {
            e.stopPropagation();
            onPickVocab(isOrder ? "next" : "");
          }}
        >
          <i className="bi bi-arrow-right-circle text-black"></i>
        </button>
      </div>
    )
  });

const Card = memo(
  ({ vocab, isActive, isOpen, isReverse }) => {

    return (
      <div className="card w-100">
        <div className={`card-body d-flex p-0 ${ !isActive ? "align-items-center" : "" }`}>
          {isActive ? (
            <div className="w-100">
              <div className="d-flex align-items-center">
                <div className="flex-fill text-center">
                  <h2 className="m-0 mt-3">
                    {vocab.word}
                    {isReverse && (vocab?.type ? ` (${vocab.type})` : "")}
                  </h2>
                </div>
              </div>
              <div className="translation-content">
                <hr className="m-3" />
                {isOpen ? (
                  <>
                    {vocab.translations &&
                      vocab.translations.map((item, index) => (
                        <div key={index}>
                          {item.translation}
                          {!isReverse && (vocab?.type ? ` (${vocab.type})` : "")}
                          {item?.note && (
                            <div className="text-start mt-2">
                              Examples:
                              <br />
                              <p style={{ whiteSpace: "pre-wrap" }}>
                                {item.note}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </>
                ) : (
                  <p className="text-center">Click here to show translation...</p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-100">
              <p className="translation-content text-center">There is no data</p>
            </div>
          )}
        </div>
      </div>
    );
  });

const WordTypeFilterButtons = memo(({ filterTypes, onFilterVocabsByTypes }) => {
  return (
    <>
      {transType.getDatas().map((v) => (
        <button
          key={v.key}
          className={`btn ${v.key in filterTypes ? "btn-primary" : "btn-outline-primary"} d-inline-block ms-2 mt-2`}
          onClick={() => onFilterVocabsByTypes(v.key)}
        >
          {v.text}
        </button>
      ))}
    </>
  );
});

const LanguageFilterButtons = memo(({ filterLang, onFilterVocabsByLang }) => {
  return (
    <>
      {LANGUAGES.map((item) => (
        <button
          key={item.key}
          className={`btn ${item.key == filterLang ? "btn-primary" : "btn-outline-primary"} d-inline-block ms-2 mt-2`}
          onClick={() => onFilterVocabsByLang(item.key)}
        >
          {item.key}
        </button>
      ))}
    </>
  );
});

const Flashcard = memo(
  ({
    vocabs = [],
    isReverse = false,
    filterLang = "",
    filterTypes = [],
    onReverseVocabs = null,
    onFilterVocabsByTypes = null,
    onFilterVocabsByLang = null,
  }) => {
    const [vocab, setVocab] = useState(EMPTY_VOCAB);
    const [isOpen, setIsOpen] = useState(false);
    const [isOrder, setIsOrder] = useState(true);
    const isActive = vocabs.length > 0;
    const { audioRef, onPlayAudio } = useAudio();
    const pickVocab = (index) => vocabs[index] ?? EMPTY_VOCAB;

    useEffect(() => {
      let newVocab = pickVocab(0);
      setVocab(newVocab);
    }, [vocabs]);

    const onOpenCard = useCallback(() => {
      setIsOpen((state) => !state);
    });

    const onChangeOrder = useCallback(() => {
      setIsOrder((state) => !state);
    });

    const onPickVocab = useCallback(
      (direction = "") => {
        setVocab((oldVocab) => {
          if (direction === "") {
            const randomIndex = getRandomIntWithExceptions(
              0,
              vocabs.length - 1,
              [oldVocab.idx],
            );
            return pickVocab(randomIndex);
          }

          if (direction === "next") {
            const nextIndex = oldVocab.idx + 1;
            return nextIndex < vocabs.length ? vocabs[nextIndex] : oldVocab;
          }

          if (direction === "prev") {
            const prevIndex = oldVocab.idx - 1;
            return prevIndex >= 0 ? vocabs[prevIndex] : oldVocab;
          }

          return oldVocab;
        });
      },
      [vocabs],
    );

    return (
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div id="flashcard" className="d-flex align-items-center position-relative">
            <CardDirectionButtons
              vocab={vocab}
              length={vocabs.length}
              isActive={isActive}
              isOrder={isOrder}
              onPickVocab={onPickVocab}
            />
            <Card
              vocab={vocab}
              isActive={isActive}
              isOpen={isOpen}
              isReverse={isReverse}
              onPlayAudio={onPlayAudio}
            />
            <FlashcardSettingButtons
              vocab={vocab}
              isActive={isActive}
              isOrder={isOrder}
              isOpen={isOpen}
              onOpenCard={onOpenCard}
              onReverseVocabs={onReverseVocabs}
              onChangeOrder={onChangeOrder}
            />
          </div>
          <div className="col-12 mt-3">
            <WordTypeFilterButtons
              filterTypes={filterTypes}
              onFilterVocabsByTypes={onFilterVocabsByTypes}
            />
          </div>
          <div className="col-12 mt-3">
            <LanguageFilterButtons
              filterLang={filterLang}
              onFilterVocabsByLang={onFilterVocabsByLang}
            />
          </div>
        </div>
        <audio ref={audioRef} />
      </div>
    );
  },
);

export default Flashcard;

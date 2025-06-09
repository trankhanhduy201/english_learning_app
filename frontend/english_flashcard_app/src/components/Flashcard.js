import React, { memo, useEffect, useState, useRef, useCallback, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getRandomIntWithExceptions } from "../utils/commons";
import * as transTypeEnums from "../enums/transTypes";
import { TRANS_LANGS } from "../configs/langConfigs";

export const EMPTY_VOCAB = {
  idx: "",
  word: "",
  type: "",
  language: "",
  translations: [],
  audio: "", // Added audio property to EMPTY_VOCAB
};

const LeftSideButtons = memo(({ isActive, isOpen, onOpenCard, onReverseVocabs, onPlayAudio }) => {
  return (
    <>
      <button
        disabled={!isActive}
        className="btn btn-secondary d-block"
        onClick={() => onReverseVocabs()}
      >
        <i className="bi bi-arrow-repeat text-light"></i>
      </button>
      <button
        disabled={!isActive}
        className="btn btn-secondary d-block mt-1"
        onClick={onOpenCard}
      >
        <i
          className={`bi ${isOpen ? "bi-lightbulb-fill" : "bi-lightbulb-off-fill"} text-light`}
        ></i>
      </button>
      <button
        disabled={!isActive}
        className="btn btn-secondary d-block mt-1"
      >
        <i className="bi bi-youtube"></i>
      </button>
      <button
        disabled={!isActive}
        className="btn btn-secondary d-block mt-1"
        onClick={onPlayAudio}
      >
        <i className="bi bi-volume-up"></i>
      </button>
    </>
  )
});

const RightSideButtons = memo(({ vocab, length, isActive, isOrder, onChangeOrder, onPickVocab }) => {
  return (
    <>
      <button
        disabled={!isActive || (isOrder && vocab.idx === 0)}
        className="btn btn-secondary d-block text-light"
        onClick={() => onPickVocab(isOrder ? "prev" : "")}
      >
        <i className="bi bi-arrow-left-circle-fill"></i>
      </button>
      <button
        disabled={
          !isActive || (isOrder && vocab.idx === length - 1)
        }
        className="btn btn-secondary d-block mt-1 text-light"
        onClick={() => onPickVocab(isOrder ? "next" : "")}
      >
        <i className="bi bi-arrow-right-circle-fill"></i>
      </button>
      <button
        disabled={!isActive}
        className="btn btn-secondary d-block mt-1"
        onClick={onChangeOrder}
      >
        {isOrder ? (
          <i className="bi bi-list-ol"></i>
        ) : (
          <i className="bi bi-shuffle"></i>
        )}
      </button>
    </>
  )
});

const Card = memo(({ vocab, isActive, isOpen, isReverse, onOpenCard }) => {
  return (
    <div className="card flex-fill ms-3 me-3">
      <div className="card-body d-flex">
        {isActive ? (
          <div className="flashcard mx-3" onClick={onOpenCard}>
            <h2 className="flashcard-header">
              {vocab.word}
              {isReverse && (vocab?.type ? ` (${vocab.type})` : "")}
            </h2>
            <div className="flashcard-content" style={{ fontSize: '20px' }}>
              <hr />
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
                <p className="text-center">
                  Click here to show translation...
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flashcard mx-3">
            <p>There is no data</p>
          </div>
        )}
      </div>
    </div>
  );
});

const WordTypeFilterButtons = memo(({ filterTypes, onFilterVocabsByTypes }) => {
  return (
    <>
      {transTypeEnums.getDatas().map(v =>
        <button
          key={v.key}
          className={`btn ${v.key in filterTypes ? "btn-secondary" : "btn-outline-secondary"} d-inline-block ms-2`}
          onClick={() => onFilterVocabsByTypes(v.key)}
        >
          {v.text}
        </button>
      )}
    </>
  );
});

const LanguageFilterButtons = memo(({ filterLang, onFilterVocabsByLang }) => {
  return (
    <>
      {Object.keys(TRANS_LANGS).map((v) => (
        <button
          key={v}
          className={`btn ${v == filterLang ? "btn-secondary" : "btn-outline-secondary"} d-inline-block ms-2`}
          onClick={() => onFilterVocabsByLang(v)}
        >
          {v}
        </button>
    ))}
    </>
  );
});

const Flashcard = memo(({
  vocabs = [],
  isReverse = false,
  filterLang = '',
  filterTypes = [],
  onReverseVocabs = null,
  onFilterVocabsByTypes = null,
  onFilterVocabsByLang = null
}) => {
  const [vocab, setVocab] = useState(EMPTY_VOCAB);
  const [isOpen, setIsOpen] = useState(false);
  const [isOrder, setIsOrder] = useState(true);
  const isActive = vocabs.length > 0;
  const audioRef = useRef(null);
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

  const onPickVocab = useCallback((direction = "") => {
    setVocab((oldVocab) => {
      if (direction === "") {
        const randomIndex = getRandomIntWithExceptions(0, vocabs.length - 1, [ oldVocab.idx ]);
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
  }, [vocabs]);

  const onPlayAudio = useCallback(() => {
    if (!vocab.audio) {
      console.error("Audio data is not available for this vocabulary.");
      return;
    }

    // Convert the binary audio data (base64 encoded) to a playable audio URL
    const audioBlob = new Blob([new Uint8Array(atob(vocab.audio).split("").map((char) => char.charCodeAt(0)))], {
      type: "audio/mpeg",
    });
    const audioUrl = URL.createObjectURL(audioBlob);

    // Set the audio source and play
    audioRef.current.src = audioUrl;
    audioRef.current.play();
  }, [vocab]);

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6">
        <div className="d-flex align-items-center">
          <div className="mb-auto">
            <LeftSideButtons 
              isActive={isActive}
              isOpen={isOpen}
              onOpenCard={onOpenCard}
              onReverseVocabs={onReverseVocabs}
              onPlayAudio={onPlayAudio}
            />
          </div>
          <Card 
            vocab={vocab}
            isActive={isActive}
            isOpen={isOpen}
            isReverse={isReverse}
            onOpenCard={onOpenCard}
          />
          <div className="mb-auto">
            <RightSideButtons 
              vocab={vocab}
              length={vocabs.length}
              isActive={isActive}
              isOrder={isOrder}
              onChangeOrder={onChangeOrder}
              onPickVocab={onPickVocab}
            />
          </div>
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
});

export default Flashcard;

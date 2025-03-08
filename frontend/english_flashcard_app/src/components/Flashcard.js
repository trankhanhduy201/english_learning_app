import React, { useEffect, useMemo, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRandomIntWithExceptions } from '../utils/commons';

export const EMPTY_VOCAB = {
  word: '', 
  translations: []
}

function Flashcard({ vocabs = [], onReverseVocabs }) {
  const [ vocab, setVocab ] = useState(EMPTY_VOCAB);
  const [ isOpen, setIsOpen ] = useState(false);

  useEffect(() => {
    let newVocab = pickVocab(0);
    setVocab(newVocab);
  }, [vocabs]);

  const onOpenCard = () => {
    setIsOpen(state => state ? false : true);
  };

  const onRandomVocab = () => {
    setVocab(oldVocab => {
      const randomIndex = getRandomIntWithExceptions(0, vocabs.length - 1, [oldVocab.index]);
      return pickVocab(randomIndex);
    });
  }

  const pickVocab = index => {
    if (!vocabs[index]) {
      return EMPTY_VOCAB;
    }
    let newVocab = vocabs[index];
    return newVocab;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6">
        <div className="d-flex align-items-center">
          <div className="mb-auto">
            <button className="btn btn-secondary d-block" onClick={onReverseVocabs}>
              <i className="bi bi-arrow-repeat text-light"></i>
            </button>
            <button className="btn btn-secondary d-block mt-1" onClick={onOpenCard}>
              <i className={`bi ${isOpen ? 'bi-lightbulb-fill' : 'bi-lightbulb-off-fill'} text-light`}></i>
            </button>
            <button className="btn btn-secondary d-block mt-1">
              <i className="bi bi-youtube"></i>
            </button>
          </div>
          <div className="card flex-fill ms-3 me-3">
            <div className="card-body d-flex">
              <div className="flashcard mx-3" onClick={onOpenCard}>
                <h2 className="flashcard-header">{vocab.word}</h2>
                {isOpen && (
                  <div className="flashcard-content">
                    <hr />
                    {vocab.translations['en'] && vocab.translations['en'].map((item, index) => (
                      <>{item.translation + (index < vocab.translations['en'].length - 1 ? ', ' : '')}</>
                    ))}
                    <div className="text-start mt-2">
                      Examples:
                      <ul className="text-start">
                        <li>I bought ticket at that theater</li>
                        <li>That theater is so famous</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mb-auto">
            <button className="btn btn-secondary d-block text-light" onClick={onRandomVocab}>
              <i className="bi bi-arrow-left-circle-fill"></i>
            </button>
            <button className="btn btn-secondary d-block mt-1 text-light" onClick={onRandomVocab}>
              <i className="bi bi-arrow-right-circle-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;

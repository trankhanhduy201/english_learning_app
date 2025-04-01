import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRandomIntWithExceptions } from '../utils/commons';
import * as transTypeEnums from '../enums/transTypes';

export const EMPTY_VOCAB = {
  idx: '',
  word: '',
  type: '',
  language: '',
  translations: []
}

function Flashcard({ vocabs = [], onReverseVocabs = null, onFilterVocabsByTypes = null }) {
  const [ vocab, setVocab ] = useState(EMPTY_VOCAB);
  const [ isOpen, setIsOpen ] = useState(false);
  const [ isOrder, setIsOrder ] = useState(true);
  const [ filterTypes, setFilterTypes ] = useState([]);
  const isActive = vocabs.length > 0;

  useEffect(() => {
    let newVocab = pickVocab(0);
    setVocab(newVocab);
  }, [vocabs]);

  const onOpenCard = () => {
    setIsOpen(state => !state);
  };

  const onChangeOrder = () => {
    setIsOrder(state => !state);
  }

  const onPickVocab = (direction = '') => {
    setVocab(oldVocab => {
      if (direction == '') {
        const randomIndex = getRandomIntWithExceptions(0, vocabs.length - 1, [oldVocab.index]);
        return pickVocab(randomIndex);
      }

      if (direction == 'next') {
        const nextIndex = oldVocab.idx + 1;
        return nextIndex < vocabs.length ? vocabs[nextIndex] : oldVocab;
      }

      if (direction == 'prev') {
        const prevIndex = oldVocab.idx - 1;
        return prevIndex >= 0 ? vocabs[prevIndex] : oldVocab;
      }

      return oldVocab;
    });
  }

  const pickVocab = index => vocabs[index] ?? EMPTY_VOCAB;

  const pickFilterType = key => {
    let newFilter = { ...filterTypes };
    if (key in newFilter) {
      delete newFilter[key];
    } else {
      newFilter = { ...newFilter, [key]: true };
    }
    setFilterTypes(newFilter);
    onFilterVocabsByTypes(newFilter);
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6">
        <div className="d-flex align-items-center">
          <div className="mb-auto">
            <button disabled={!isActive} className="btn btn-secondary d-block" onClick={() => onReverseVocabs(filterTypes)}>
              <i className="bi bi-arrow-repeat text-light"></i>
            </button>
            <button disabled={!isActive} className="btn btn-secondary d-block mt-1" onClick={onOpenCard}>
              <i className={`bi ${isOpen ? 'bi-lightbulb-fill' : 'bi-lightbulb-off-fill'} text-light`}></i>
            </button>
            <button disabled={!isActive} className="btn btn-secondary d-block mt-1">
              <i className="bi bi-youtube"></i>
            </button>
          </div>
          <div className="card flex-fill ms-3 me-3">
            <div className="card-body d-flex">
              {isActive ? (
                <div className="flashcard mx-3" onClick={onOpenCard}>
                  <h2 className="flashcard-header">
                    {vocab.word}
                    {vocab?.type ? ` (${vocab.type})` : ''}
                  </h2>
                  <div className="flashcard-content">
                    <hr />
                    {isOpen ? (
                      <>
                        {vocab.translations && vocab.translations.map((item) => (
                          <>
                            {item.translation}
                            {item?.note && (
                              <div className="text-start mt-2">
                                Examples:<br />
                                <p style={{ whiteSpace: "pre-wrap" }}>{item.note}</p>
                              </div>
                            )}
                          </>
                        ))}
                      </>
                    ) : (
                      <p className='text-center'>
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
          <div className="mb-auto">
            <button 
              disabled={!isActive || (isOrder && vocab.idx == 0)} 
              className="btn btn-secondary d-block text-light" 
              onClick={() => onPickVocab(isOrder ? 'prev' : '')}
            >
              <i className="bi bi-arrow-left-circle-fill"></i>
            </button>
            <button 
              disabled={!isActive || (isOrder && vocab.idx == vocabs.length - 1)} 
              className="btn btn-secondary d-block mt-1 text-light" 
              onClick={() => onPickVocab(isOrder ? 'next' : '')}
            >
              <i className="bi bi-arrow-right-circle-fill"></i>
            </button>
            <button 
              disabled={!isActive} 
              className="btn btn-secondary d-block mt-1" 
              onClick={onChangeOrder}
            >
              {isOrder ? <i className="bi bi-list-ol"></i> : <i className="bi bi-shuffle"></i>}
            </button>
          </div>
        </div>
        <div className='col-12 mt-3'>
          {transTypeEnums.getDatas().map(v => (
            <button
              key={v.key}
              className={`btn ${ v.key in filterTypes ? 'btn-secondary' : 'btn-outline-secondary' } d-inline-block ms-2`}
              onClick={() => pickFilterType(v.key)}
            >
              {v.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Flashcard;

import React, { useEffect, useMemo, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getRandomIntWithExceptions } from '../utils/commons';

const EMPTY_VOCAB = {
  word: '', 
  translations: [],
  index: -1
}

function Flashcard({ vocabs = [] }) {
  const [ vocab, setVocab ] = useState(EMPTY_VOCAB);
  const [ isOpen, setIsOpen ] = useState(false);

  useEffect(() => {
    let newVocab = pickVocab(0);
    setVocab(newVocab);
  }, [vocabs]);

  const openCard = () => {
    setIsOpen(state => state ? false : true);
  };

  const randomVocab = () => {
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
    newVocab['index'] = index;
    return newVocab;
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-6">
        <div className="d-flex align-items-center">
          <button className="btn btn-primary me-auto" onClick={randomVocab}>Prev</button>
          <div className="card flex-fill ms-3 me-3">
            <div className="card-body d-flex">
              <div className="flashcard mx-3" onClick={openCard}>
                <h2 className="flashcard-header">{vocab.word}</h2>
                {isOpen && (
                  <div className="flashcard-content">
                    <hr />
                    {vocab.translations['en'] && vocab.translations['en'].map((item, index) => (
                      <>{item.translation + (index < item.translation.length - 1 ? '' : ', ')}</>
                    ))}
                    {/* <div className="text-start mt-2">
                      Examples:
                      <ul className="text-start">
                        <li>I bought ticket at that theater</li>
                        <li>That theater is so famous</li>
                      </ul>
                    </div> */}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button className="btn btn-primary ms-auto" onClick={randomVocab}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default Flashcard;

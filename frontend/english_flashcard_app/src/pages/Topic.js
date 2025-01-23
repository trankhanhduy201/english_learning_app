import React, { useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setError } from '../stores/slices/errorSlice';
import Flashcard, { EMPTY_VOCAB } from '../components/Flashcard';

const Topic = () => {
  const dispatch = useDispatch();
  const { topic, vocabs: vocabsPromise } = useLoaderData();
  const [ originVocabs, setOriginVocabs ] = useState([]);
  const [ vocabs, setVocabs ] = useState([]);
  const [ isReverse, setIsReverse ] = useState(false);
  
  let reverseVocabs = useMemo(() => {
    return vocabs.reduce((newVocabs, vocab) => {
      const translationsToVocabs = () => {
        return vocab.translations['en'].reduce((newTranslations, translation) => {
          newTranslations.push({
            ...EMPTY_VOCAB,
            word: translation.translation,
            translations: {en: [{ translation: vocab.word }]}
          });
          return newTranslations;
        }, []);
      }

      return [
        ...newVocabs, 
        ...translationsToVocabs()
      ];
    }, []);
  }, [originVocabs]);
  
  useEffect(() => {
    const getVocabs = async () => {
      const getTranslations = translations => {
        return translations.reduce((accumulator, item) => {
          const lang = item.language || '';
          if (!lang) {
            return accumulator;
          }
          if (!accumulator[lang]) {
            accumulator[lang] = [];
          }
          accumulator[lang].push(item);
          return accumulator;
        }, {});
      }

      try {
        const results = await vocabsPromise;
        const newVocabs = results.data.map(item => {
          item.translations = getTranslations(item.translations);
          return item;
        }, []);
        setVocabs(newVocabs);
        setOriginVocabs(newVocabs);
      } catch(error) {
        dispatch(setError('Can not get vocabularies'));
      }
    }

    getVocabs();
  }, []);

  const onReverseVocabs = () => {
    setVocabs(isReverse ? originVocabs : reverseVocabs);
    setIsReverse(isReverse => !isReverse)
  };

  return (
    <>
      <Flashcard vocabs={vocabs} onReverseVocabs={onReverseVocabs}/>
    </>
  );
};

export default Topic;
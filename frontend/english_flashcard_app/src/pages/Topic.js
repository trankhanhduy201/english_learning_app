import React, { useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setError } from '../stores/slices/errorSlice';
import Flashcard from '../components/Flashcard';

const Topic = () => {
  const dispatch = useDispatch();
  const { topic, vocabs: vocabsPromise } = useLoaderData();
  const [ vocabs, setVocabs ] = useState([]);
  let reverseVocabs = useMemo(() => {
    return vocabs;
  }, [vocabs]);
  
  useEffect(() => {
    const getVocabs = async () => {
      const getTranslations = (translations) => {
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
        const newVocabs = results.data.reduce((accumulator, item) => {
          item.translations = getTranslations(item.translations);
          accumulator.push(item);
          return accumulator;
        }, []);
        setVocabs(newVocabs);
      } catch(error) {
        dispatch(setError('Can not get vocabularies'));
      }
    }

    getVocabs();
  }, []);

  const reverseVocab = () => setVocabs(reverseVocabs);

  return (
    <>
      <Flashcard vocabs={vocabs} />
    </>
  );
};

export default Topic;
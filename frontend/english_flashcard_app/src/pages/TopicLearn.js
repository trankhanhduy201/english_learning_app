import React, { useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAlert } from '../stores/slices/alertSlice';
import Flashcard, { EMPTY_VOCAB } from '../components/Flashcard';
import * as alertConfigs from "../configs/alertConfigs";
import _ from "lodash";

const Topic = () => {
  const dispatch = useDispatch();
  const { topic, vocabs: vocabsPromise } = useLoaderData();
  const [ originVocabs, setOriginVocabs ] = useState([]);
  const [ vocabs, setVocabs ] = useState([]);
  const [ isReverse, setIsReverse ] = useState(false);
  
  let reverseVocabs = useMemo(() => {
    return vocabs.reduce((newVocabs, vocab) => {
      // Convert translations to vocabs
      const trans2Vocabs = () => {
        return vocab.translations['en'].reduce((newTrans, trans) => {
          newTrans.push({
            ...EMPTY_VOCAB,
            word: trans.translation,
            translations: {en: [{ trans: vocab.word }]}
          });
          return newTrans;
        }, []);
      }

      // Merge to new vocabs
      return [
        ...newVocabs, 
        ...trans2Vocabs()
      ];
    }, []);
  }, [originVocabs]);
  
  useEffect(() => {
    const getVocabs = async () => {
      try {
        const results = await vocabsPromise;
        const newVocabs = results.data.map(item => {
          item.translations = _.groupBy(item.translations, 'language');
          return item;
        }, []);
        setVocabs(newVocabs);
        setOriginVocabs(newVocabs);
      } catch(error) {
        dispatch(setAlert({
          type: alertConfigs.ERROR_TYPE,
          message: 'Can not get vocabularies'
        }));
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
import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Await, useLoaderData } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAlert } from '../stores/slices/alertSlice';
import Flashcard, { EMPTY_VOCAB } from '../components/Flashcard';
import * as alertConfigs from "../configs/alertConfigs";
import _ from "lodash";
import LoadingOverlay from "../components/LoadingOverlay"

const Topic = () => {
  const dispatch = useDispatch();
  const { topicPromise, vocabsPromise } = useLoaderData();
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
        const datas = await vocabsPromise;
        const newVocabs = datas.map(item => {
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
    <Suspense fallback={
      <>
        <Flashcard />
        <LoadingOverlay />
      </>
    }>
      <Await resolve={vocabsPromise}>
        {(data) => (
          <Flashcard vocabs={vocabs} onReverseVocabs={onReverseVocabs}/>
        )}
      </Await>
    </Suspense>
  );
};

export default Topic;
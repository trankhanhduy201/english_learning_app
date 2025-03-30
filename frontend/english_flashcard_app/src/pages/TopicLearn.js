import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Await, useLoaderData } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../stores/slices/alertSlice';
import Flashcard, { EMPTY_VOCAB } from '../components/Flashcard';
import * as alertConfigs from "../configs/alertConfigs";
import LoadingOverlay from "../components/LoadingOverlay";
import _ from "lodash";

const getOriginDatas = (vocabs) => {
  const newOriginDatas = vocabs.reduce((newVocabs, vocab) => {
    newVocabs = [
      ...newVocabs,
      ...(vocab?.translations.map(v => ({
         ...vocab, 
         language: v.language, 
         translations: [v] 
        })))
    ];
    return newVocabs;
  }, []);

  // Group data by language field
  return _.groupBy(newOriginDatas, 'language');
}

// Convert translations to vocabs
const trans2Vocabs = (vocab) => {
  return vocab.translations.reduce((newTrans, trans) => {
    newTrans.push({
      ...EMPTY_VOCAB,
      word: trans.translation,
      translations: [{ translation: vocab.word }]
    });
    return newTrans;
  }, []);
}

const Topic = () => {
  const lang = useSelector((state) => state.lang);
  const dispatch = useDispatch();
  const { topicPromise, vocabsPromise } = useLoaderData();
  const [ originVocabs, setOriginVocabs ] = useState([]);
  const [ vocabs, setVocabs ] = useState([]);
  const [ isReverse, setIsReverse ] = useState(false);
  
  let reverseVocabs = useMemo(() => {
    return vocabs.reduce((newVocabs, vocab) => {
      // Merge to new vocabs
      return [
        ...newVocabs, 
        ...trans2Vocabs(vocab)
      ];
    }, []);
  }, [originVocabs]);
  
  useEffect(() => {
    const getVocabs = async () => {
      try {
        const originDatas = getOriginDatas(await vocabsPromise);
        setOriginVocabs(originDatas);
        setVocabs(originDatas[lang] ?? []);
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
    setVocabs(isReverse ? (originVocabs[lang] ?? []) : reverseVocabs);
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
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { EMPTY_VOCAB } from "../components/Flashcard";
import { setAlert } from "../stores/slices/alertSlice";
import * as alertConfigs from "../configs/alertConfigs";
import _ from "lodash";

const getOriginDatas = (vocabs) => {
  const newDatas = vocabs.reduce((persistence, vocab) => {
    const originDatas = vocab?.translations.map(v => ({
      ...EMPTY_VOCAB,
      word: vocab.word,
      type: v.type,
      language: v.language,
      audio: vocab.audio,
      translations: [{ translation: v.translation }]
    }));

    const reverseDatas = vocab?.translations.map(v => ({
      ...EMPTY_VOCAB,
      word: v.translation,
      type: v.type,
      language: v.language,
      audio: vocab.audio,
      translations: [{ translation: vocab.word }]
    }));

    return {
      originDatas: [ ...persistence.originDatas, ...originDatas ],
      reverseDatas: [ ...persistence.reverseDatas, ...reverseDatas ]
    };
  }, {
    originDatas: [],
    reverseDatas: []
  });

  // Group data by language field
  return {
    originDatas: _.groupBy(newDatas.originDatas, 'language'),
    reverseDatas: _.groupBy(newDatas.reverseDatas, 'language')
  }
};

const useOriginVocabs = ({ vocabsPromise }) => {
  const dispatch = useDispatch();
  const [ isLoadingData, setIsLoadingData ] = useState(true);
  const [ originVocabs, setOriginVocabs ] = useState({ originDatas: [], reverseDatas: [] });
  const getOriginVocabs = useCallback((lang, reverse = false) => {
    const results = !reverse 
      ? originVocabs.originDatas
      : originVocabs.reverseDatas;
    return results[lang] ?? [];
  }, [originVocabs]);

  useEffect(() => {
    const getVocabs = async () => {
      try {
        setOriginVocabs(getOriginDatas(await vocabsPromise));
        setIsLoadingData(true);
      } catch (error) {
        dispatch(
          setAlert({
            type: alertConfigs.ERROR_TYPE,
            message: "Can not get vocabularies",
          }),
        );
        setIsLoadingData(false);
      }
    };
    getVocabs();
  }, [vocabsPromise]);

  return {
    isLoadingData,
    ...originVocabs,
    getOriginVocabs
  };
};

export default useOriginVocabs;

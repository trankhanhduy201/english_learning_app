import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Await, useLoaderData } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAlert } from "../stores/slices/alertSlice";
import Flashcard, { EMPTY_VOCAB } from "../components/Flashcard";
import * as alertConfigs from "../configs/alertConfigs";
import LoadingOverlay from "../components/LoadingOverlay";
import _ from "lodash";

const getOriginDatas = (vocabs) => {
  const newOriginDatas = vocabs.reduce((newVocabs, vocab) => {
    newVocabs = [
      ...newVocabs,
      ...vocab?.translations.map((v, i) => ({
        ...vocab,
        language: v.language,
        type: v.type,
        translations: [v],
      })),
    ];
    return newVocabs;
  }, []);

  // Group data by language field
  return _.groupBy(newOriginDatas, "language");
};

// Convert translations to vocabs
const trans2Vocabs = (vocab) => {
  return vocab.translations.reduce((newTrans, trans) => {
    newTrans.push({
      ...EMPTY_VOCAB,
      word: trans.translation,
      type: trans.type,
      translations: [
        {
          ...trans,
          translation: vocab.word,
        },
      ],
    });
    return newTrans;
  }, []);
};

const Topic = () => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.lang);
  const { topicPromise, vocabsPromise } = useLoaderData();
  const [originVocabs, setOriginVocabs] = useState([]);
  const [vocabs, setVocabs] = useState([]);
  const [isReverse, setIsReverse] = useState(false);
  const [filterTypes, setFilterTypes] = useState([]);
  const getVocabsByLang = () => originVocabs[lang] ?? [];

  let reverseVocabs = useMemo(() => {
    return getVocabsByLang().reduce((newVocabs, vocab) => {
      return [...newVocabs, ...trans2Vocabs(vocab)];
    }, []);
  }, [originVocabs]);

  useEffect(() => {
    setVocabs(getFilterVocabs([], isReverse));
  }, [originVocabs]);

  useEffect(() => {
    const getVocabs = async () => {
      try {
        const originDatas = getOriginDatas(await vocabsPromise);
        setOriginVocabs(originDatas);
      } catch (error) {
        dispatch(
          setAlert({
            type: alertConfigs.ERROR_TYPE,
            message: "Can not get vocabularies",
          }),
        );
      }
    };
    getVocabs();
  }, []);

  const getFilterVocabs = (types, reverse) => {
    let filterVocabs = !reverse ? getVocabsByLang() : reverseVocabs;
    if (Object.keys(types).length > 0) {
      filterVocabs = filterVocabs.filter((v) => v.type in types);
    }
    return filterVocabs.map((v, i) => ({ ...v, idx: i }));
  };

  const onReverseVocabs = useCallback(() => {
    setVocabs(getFilterVocabs(filterTypes, !isReverse));
    setIsReverse(!isReverse);
  }, [vocabs]);

  const onFilterVocabsByTypes = useCallback(
    (type) => {
      let newFilterTypes = { ...filterTypes };
      if (type in newFilterTypes) {
        delete newFilterTypes[type];
      } else {
        newFilterTypes = { ...newFilterTypes, [type]: true };
      }
      setFilterTypes(newFilterTypes);
      setVocabs(getFilterVocabs(newFilterTypes, isReverse));
    },
    [vocabs],
  );

  return (
    <Suspense
      fallback={
        <>
          <Flashcard />
          <LoadingOverlay />
        </>
      }
    >
      <Await resolve={vocabsPromise}>
        {(data) => (
          <Flashcard
            vocabs={vocabs}
            filterTypes={filterTypes}
            onReverseVocabs={onReverseVocabs}
            onFilterVocabsByTypes={onFilterVocabsByTypes}
          />
        )}
      </Await>
    </Suspense>
  );
};

export default Topic;

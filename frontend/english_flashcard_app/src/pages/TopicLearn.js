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
      language: trans.language,
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

const TopicLearn = () => {
  const dispatch = useDispatch();
  const { topicPromise, vocabsPromise } = useLoaderData();
  const [originVocabs, setOriginVocabs] = useState([]);
  const [vocabs, setVocabs] = useState([]);
  const [isReverse, setIsReverse] = useState(false);
  const [filterTypes, setFilterTypes] = useState([]);
  const [filterLang, setFilterLang] = useState('en');
  const getVocabsByLang = (lang = null) => lang ? (originVocabs[lang] ?? []) : originVocabs;
  const getReverseVocabsByLang = (lang = null) => lang ? (reverseVocabs[lang] ?? []) : reverseVocabs;

  let reverseVocabs = useMemo(() => {
    const flattenOriginVocabs = _.flatMap(getVocabsByLang());
    const reverseOriginVocabs = flattenOriginVocabs.reduce((newVocabs, vocab) => {
      return [...newVocabs, ...trans2Vocabs(vocab)];
    }, []);
    return _.groupBy(reverseOriginVocabs, 'language');
  }, [originVocabs]);

  useEffect(() => {
    setVocabs(getFilterVocabs(filterLang, [], isReverse));
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

  const getFilterVocabs = (lang, types, reverse) => {
    let filterVocabs = !reverse ? getVocabsByLang(lang) : getReverseVocabsByLang(lang);
    if (Object.keys(types).length > 0) {
      filterVocabs = filterVocabs.filter((v) => v.type in types);
    }
    return filterVocabs.map((v, i) => ({ ...v, idx: i }));
  };

  const onReverseVocabs = useCallback(() => {
    setVocabs(getFilterVocabs(filterLang, filterTypes, !isReverse));
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
      setVocabs(getFilterVocabs(filterLang, newFilterTypes, isReverse));
    },
    [vocabs],
  );

  const onFilterVocabsByLang = useCallback(
    (lang) => {
      setFilterLang(lang);
      setVocabs(getFilterVocabs(lang, filterTypes, isReverse));
    },
    [vocabs],
  )

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
            filterLang={filterLang}
            onReverseVocabs={onReverseVocabs}
            onFilterVocabsByTypes={onFilterVocabsByTypes}
            onFilterVocabsByLang={onFilterVocabsByLang}
          />
        )}
      </Await>
    </Suspense>
  );
};

export default TopicLearn;

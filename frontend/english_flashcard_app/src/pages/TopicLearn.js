import {
  Suspense,
  useCallback,
  useState
} from "react";
import { Await, useLoaderData } from "react-router-dom";
import Flashcard from "../components/Flashcard";
import LoadingOverlay from "../components/LoadingOverlay";
import useOriginVocabs from "../hooks/useOriginVocabs";
import _ from "lodash";
import useFilterVocabs from "../hooks/useFilterVocabs";

const TopicLearn = () => {
  const { vocabsPromise } = useLoaderData();
  const { originDatas, getOriginVocabs } = useOriginVocabs({ vocabsPromise });
  const {
    isReverse,
    filterTypes,
    filterLang,
    getFilterVocabs,
    onReverseVocabs,
    onFilterVocabsByTypes,
    onFilterVocabsByLang
  } = useFilterVocabs({ getOriginVocabs });

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
            vocabs={getFilterVocabs(filterLang, filterTypes, isReverse)}
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

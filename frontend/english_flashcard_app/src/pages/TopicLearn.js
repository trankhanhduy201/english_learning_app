import { useLoaderData } from "react-router-dom";
import Flashcard from "../components/Flashcard";
import LoadingOverlay from "../components/LoadingOverlay";
import useOriginVocabs from "../hooks/useOriginVocabs";
import useFilterVocabs from "../hooks/useFilterVocabs";
import _ from "lodash";

const TopicLearn = () => {
  const { vocabsPromise } = useLoaderData();
  const { originDatas, getOriginVocabs } = useOriginVocabs({ vocabsPromise });
  const {
    isLoadingData,
    isReverse,
    filterTypes,
    filterLang,
    getFilterVocabs,
    onReverseVocabs,
    onFilterVocabsByTypes,
    onFilterVocabsByLang,
  } = useFilterVocabs({ getOriginVocabs });

  return (
    <>
      {isLoadingData ? (
        <>
          <Flashcard />
          <LoadingOverlay />
        </>
      ) : (
        <Flashcard
          vocabs={getFilterVocabs(filterLang, filterTypes, isReverse)}
          isReverse={isReverse}
          filterTypes={filterTypes}
          filterLang={filterLang}
          onReverseVocabs={onReverseVocabs}
          onFilterVocabsByTypes={onFilterVocabsByTypes}
          onFilterVocabsByLang={onFilterVocabsByLang}
        />
      )}
    </>
  );
};

export default TopicLearn;

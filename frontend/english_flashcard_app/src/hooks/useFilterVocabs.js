import { useCallback, useState } from "react";
import { DEFAULT_LANG } from "../configs/langConfigs";

const useFilterVocabs = ({ getOriginVocabs }) => {
  const [ isReverse, setIsReverse ] = useState(false);
  const [ filterTypes, setFilterTypes ] = useState({});
  const [ filterLang, setFilterLang ] = useState(DEFAULT_LANG);
  
  const getFilterVocabs = useCallback((lang, types, reverse) => {
    let filterVocabs = getOriginVocabs(lang, reverse);
    if (Object.keys(types).length > 0) {
      filterVocabs = filterVocabs.filter((v) => v.type in types);
    }
    return filterVocabs.map((v, i) => ({ ...v, idx: i }));
  }, [getOriginVocabs]);
  
  const onReverseVocabs = useCallback(() => setIsReverse(state => !state), []);
  const onFilterVocabsByLang = useCallback((lang) => setFilterLang(lang), []);
  const onFilterVocabsByTypes = useCallback((type) => {
    let newFilterTypes = { ...filterTypes };
    if (type in newFilterTypes) {
      delete newFilterTypes[type];
    } else {
      newFilterTypes = { ...newFilterTypes, [type]: true };
    }
    setFilterTypes(newFilterTypes);
  }, [filterTypes]);

  return {
    isReverse,
    filterTypes,
    filterLang,
    getFilterVocabs,
    onReverseVocabs,
    onFilterVocabsByTypes,
    onFilterVocabsByLang
  };
};

export default useFilterVocabs;

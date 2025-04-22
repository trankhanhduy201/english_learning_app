import React, { memo, useCallback, useEffect, useState, useTransition } from "react";
import { Link, useFetcher } from "react-router-dom";
import ImportTextModal from "../topic/ImportTextModal";
import ListVocabTable from "./ListVocabTable";
import { debounce } from "lodash";
import LoadingOverlay from "../../LoadingOverlay";

const ListVocab = memo(({ vocabDatas, topicId, lang }) => {
  const [ vocabs, setVocabs ] = useState([]);
	const [ showImportTextModal, setShowImportTextModal ] = useState(false);
  const [ isSearching, transition ] = useTransition();
  const delVocabFetcher = useFetcher();

  const onCloseImportTextModal = useCallback(() => {
    setShowImportTextModal(false);
  }, [vocabDatas, topicId, lang]);

  const onDeleteVocab = useCallback((vocabId) => {
    const formData = new FormData();
    formData.append('_not_revalidate', '1');
    delVocabFetcher.submit(formData, {
      action: `/topic/${topicId}/vocab/${vocabId}/delete`,
      method: 'delete'
    });
    setVocabs((prevVocabs) => prevVocabs.filter(vocab => vocab.id !== vocabId));
  }, [vocabDatas, topicId, lang]);

  const onSearchVocab = useCallback(
    debounce((searchText) => {
      transition(() => {
        const filteredVocabs = vocabDatas.filter(vocab => 
          vocab.word.toLowerCase().includes(searchText.toLowerCase())
        );
        transition(() => {
          setVocabs(filteredVocabs);
        });
      });
    }, 300), 
    [vocabDatas, topicId, lang]
  );

  useEffect(() => {
    if (delVocabFetcher.data?.status === "success") {
      setVocabs((prevVocabs) => 
        prevVocabs.filter(vocab => vocab.id !== delVocabFetcher.data.data.id)
      );
    }
  }, [delVocabFetcher.data]);

  useEffect(() => {
    setVocabs(vocabDatas);
  }, [vocabDatas, topicId, lang])

  return (
    <div className="position-relative">
      {delVocabFetcher.state === "submitting" && 
        <LoadingOverlay position="absolute" background="white" />
      }
      <ListVocabTable 
        vocabs={vocabs}
        topicId={topicId} 
        isSearching={isSearching}
        onDeleteVocab={onDeleteVocab}
        onSearchVocab={onSearchVocab}
      />
      <div className="d-flex justify-content-end mt-2">
        <Link to={`/topic/${topicId}/vocab/export`} className="btn btn-secondary me-2">
          <i className="bi bi-download"></i> Export
        </Link>
        <button onClick={() => setShowImportTextModal(true)} className="btn btn-secondary me-2">
          <i className="bi bi-upload"></i> Import
        </button>
        <Link to={`/topic/${topicId}/vocab/new`} className="btn btn-secondary">
          <i className="bi bi-plus-circle"></i> New
        </Link>
      </div>
      {showImportTextModal && 
        <ImportTextModal 
          topicId={topicId} 
          lang={lang} 
          onClose={onCloseImportTextModal}
        />
      }
    </div>
  );
});

export default ListVocab;

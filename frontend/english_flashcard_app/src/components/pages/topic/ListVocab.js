import React, { memo, use, useCallback, useEffect, useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import ImportTextModal from "../topic/ImportTextModal";
import ListVocabTable from "./ListVocabTable";
import { set } from "lodash";

const ListVocabLoadding = () => {
  return (
    <div className="listVocabLoading-overlay">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
};

const ListVocab = memo(({ vocabDatas, topicId, lang }) => {
  const [ vocabs, setVocabs ] = useState(vocabDatas);
	const [ showImportTextModal, setShowImportTextModal ] = useState(false);
  const delVocabFetcher = useFetcher();

  const onCloseImportTextModal = useCallback(() => {
    setShowImportTextModal(false);
  }, []);

  const onDeleteVocab = useCallback((vocabId) => {
    const formData = new FormData();
    formData.append('_not_revalidate', '1');
    delVocabFetcher.submit(formData, {
      action: `/topic/${topicId}/vocab/${vocabId}/delete`,
      method: 'delete'
    });
    setVocabs((prevVocabs) => prevVocabs.filter(vocab => vocab.id !== vocabId));
  }, [topicId, lang, delVocabFetcher]);

  useEffect(() => {
    if (delVocabFetcher.data?.status === "success") {
      setVocabs((prevVocabs) => prevVocabs.filter(vocab => vocab.id !== delVocabFetcher.data.data.id));
    }
  }, [delVocabFetcher.data]);

  return (
    <div className="position-relative">
      {delVocabFetcher.state === "submitting" && <ListVocabLoadding />}
      <ListVocabTable 
        vocabs={vocabs}
        topicId={topicId} 
        onDeleteVocab={onDeleteVocab} 
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

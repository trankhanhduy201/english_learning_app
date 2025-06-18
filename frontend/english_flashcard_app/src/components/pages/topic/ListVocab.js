import {
  memo,
  useCallback,
  useEffect,
  useState,
  useTransition,
  useRef,
} from "react";
import { Link, useFetcher } from "react-router-dom";
import ImportTextModal from "../topic/ImportTextModal";
import ListVocabTable from "./ListVocabTable";
import { debounce } from "lodash";
import LoadingOverlay from "../../LoadingOverlay";
import DeleteAllButton from "../../DeleteAllButton";
import useAudio from "../../../hooks/useAudio";
import { useTopicContext } from "../../../contexts/TopicContext";

const ListVocab = memo(({ vocabDatas, topicId }) => {
  const [vocabs, setVocabs] = useState([]);
  const [showImportTextModal, setShowImportTextModal] = useState(false);
  const [isSearching, transition] = useTransition();
  const { audioRef, onPlayAudio } = useAudio();
  const delVocabFetcher = useFetcher();
  const curSearchText = useRef("");
  const { topic } = useTopicContext();

  const filterVocabs = (searchText) => {
    transition(() => {
      const filteredVocabs = vocabDatas.filter((vocab) =>
        vocab.word.toLowerCase().includes(searchText),
      );
      transition(() => {
        setVocabs(filteredVocabs);
      });
    });
  };

  useEffect(() => {
    filterVocabs(curSearchText.current);
  }, [vocabDatas]);

  const onCloseImportTextModal = useCallback(() => {
    setShowImportTextModal(false);
  });

  const onDeleteVocab = useCallback(
    (vocabId) => {
      const formData = new FormData();
      formData.append("_not_revalidate", "1");
      delVocabFetcher.submit(formData, {
        action: `/topic/${topicId}/vocab/${vocabId}/delete`,
        method: "delete",
      });
      setVocabs((prevVocabs) =>
        prevVocabs.filter((vocab) => vocab.id !== vocabId),
      );
    },
    [topicId],
  );

  const onSearchVocab = useCallback(
    debounce((searchText) => {
      curSearchText.current = searchText.toLowerCase();
      filterVocabs(searchText);
    }, 300),
    [vocabDatas],
  );

  useEffect(() => {
    if (delVocabFetcher.data?.status === "success") {
      setVocabs((prevVocabs) =>
        prevVocabs.filter((vocab) => vocab.id !== delVocabFetcher.data.data.id),
      );
    }
  }, [delVocabFetcher.data]);

  return (
    <>
      <audio ref={audioRef} />
      <div className="position-relative">
        {delVocabFetcher.state === "submitting" && (
          <LoadingOverlay position="absolute" background="white" />
        )}
        <ListVocabTable
          vocabs={vocabs}
          topicId={topicId}
          isSearching={isSearching}
          onDeleteVocab={onDeleteVocab}
          onSearchVocab={onSearchVocab}
          onPlayAudio={onPlayAudio}
        />
        <div className="d-flex justify-content-end mt-2">
          <Link
            to={`/topic/${topicId}/vocab/export`}
            className="btn btn-secondary me-2"
          >
            <i className="bi bi-download"></i> Export
          </Link>
          <button
            onClick={() => setShowImportTextModal(true)}
            className="btn btn-secondary me-2"
          >
            <i className="bi bi-upload"></i> Import
          </button>
          <Link
            to={`/topic/${topicId}/vocab/new`}
            className="btn btn-secondary me-2"
          >
            <i className="bi bi-plus-circle"></i> New
          </Link>
          <DeleteAllButton
            action={`/topic/${topicId}/vocab/delete`}
            formName={"deleting_all_vocab"}
          />
        </div>
        {showImportTextModal && (
          <ImportTextModal
            topicId={topicId}
            learningLang={topic?.learning_language} // <-- use context value
            onClose={onCloseImportTextModal}
          />
        )}
      </div>
    </>
  );
});

export default ListVocab;

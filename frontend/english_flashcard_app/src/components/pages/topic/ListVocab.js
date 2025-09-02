import {
  memo,
  useCallback,
  useEffect,
  useState,
  useTransition,
  useRef,
  startTransition,
} from "react";
import { Link, useFetcher } from "react-router-dom";
import ImportTextModal from "../topic/ImportTextModal";
import ListVocabTable from "./ListVocabTable";
import { debounce } from "lodash";
import LoadingOverlay from "../../LoadingOverlay";
import DeleteAllButton from "../../DeleteAllButton";
import useAudio from "../../../hooks/useAudio";
import { useTopicContext } from "../../../contexts/TopicContext";
import useWebSocket from "../../../hooks/useWebSocket";
import { WS_BASE_URL } from "../../../configs/apiConfig";
import { getUser as getUserLocalStorage } from "../../../commons/localStorage";

const ListVocabDetail = memo(({ vocabDatas, topicId }) => {
  const curSearchText = useRef("");
  const [ vocabs, setVocabs ] = useState([]);
  const [ showImportTextModal, setShowImportTextModal ] = useState(false);
  const [ isSearching, transition ] = useTransition();
  const { audioRef, onPlayAudio } = useAudio();
  const delVocabFetcher = useFetcher();
  const { topic } = useTopicContext();

  const filterVocabs = (searchText) => {
    transition(() => {
      setVocabs(oldState => {
        if (!searchText) {
          return [...vocabDatas];
        }
        return vocabDatas.filter((vocab) =>
          vocab.word.toLowerCase().includes(searchText),
        );
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
      startTransition(() => {
        filterVocabs(searchText);
      });
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
            <i className="bi bi-download"></i>
            <span className="btn-text --d-sm-none"> Export</span>
          </Link>
          <button
            onClick={() => setShowImportTextModal(true)}
            className="btn btn-secondary me-2"
          >
            <i className="bi bi-upload"></i>
            <span className="btn-text --d-sm-none"> Import</span>
          </button>
          <Link
            to={`/topic/${topicId}/vocab/new`}
            className="btn btn-secondary me-2"
          >
            <i className="bi bi-plus-circle"></i>
            <span className="btn-text --d-sm-none"> New</span>
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

const ListVocab = memo(({ vocabDatas, topicId }) => {
  const [vocabs, setVocabs] = useState([]);
  const userInfo = getUserLocalStorage();
  const wsUrl = userInfo.id ? `${WS_BASE_URL}/ws/notify/${userInfo.id}/` : null;
  useWebSocket(wsUrl, (message) => {
    console.log("Message from server:", message);
    if (message.data) {
      const audioDatas = JSON.parse(message.data);
      const updateVocabAudio = item => {
        if (item.word in audioDatas) {
          return { ...item, audio: audioDatas[item.word] };
        }
        return item;
      }
      setVocabs(prev => prev.map(updateVocabAudio));
    }
  });

  useEffect(() => {
    setVocabs(vocabDatas)
  }, [vocabDatas])
  
  return (
    <ListVocabDetail
      vocabDatas={vocabs} 
      topicId={topicId} 
    />
  )
});

export default ListVocab;

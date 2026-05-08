import { memo, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { List } from "react-window";

const ROW_HEIGHT = 60;
const LIST_HEIGHT = ROW_HEIGHT * 7;
const LIST_WIDTH = "100%";

const RowComponent = ({ index, style, ...rest }) => {
  const { vocabs, topicId, onDeleteVocab, onPlayAudio } = rest;
  const vocab = vocabs[index];

  return (
    <div style={style} className="vocab-row">
      <div className="vocab-cell vocab-index">{index + 1}</div>
      <div className="vocab-cell vocab-word">
        {onPlayAudio && vocab.audio && (
          <Link
            to="#"
            className="audio-link me-2"
            onClick={(e) => {
              e.preventDefault();
              onPlayAudio(vocab.audio);
            }}
          >
            <i className="bi bi-volume-up"></i>
          </Link>
        )}
        <span>{vocab.word}</span>
      </div>
      <div className="vocab-cell vocab-description">{vocab.descriptions}</div>
      <div className="vocab-cell vocab-author">{vocab?.created_by?.username}</div>
      <div className="vocab-cell vocab-actions">
        <div className="actions-container">
          <Link to={`/topic/${topicId}/vocab/${vocab.id}`} className="action-link">
            <i className="bi bi-pencil-square text-dark"></i>
          </Link>
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => onDeleteVocab(vocab.id)}
          >
            <i className="bi bi-trash text-dark"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const ListVocabTable = memo(
  ({
    vocabs,
    topicId,
    isSearching,
    onDeleteVocab,
    onSearchVocab,
    onPlayAudio = null,
  }) => {
    const listRef = useRef(null);
    const itemData = useMemo(
      () => ({ vocabs, topicId, onDeleteVocab, onPlayAudio }),
      [vocabs, topicId, onDeleteVocab, onPlayAudio],
    );

    return (
      <div className="vocab-table-container">
        {/* Header */}
        <div className="vocab-header">
          <div className="vocab-row vocab-header-row">
            <div className="vocab-cell vocab-index">#</div>
            <div className="vocab-cell vocab-word">Word</div>
            <div className="vocab-cell vocab-description">Descriptions</div>
            <div className="vocab-cell vocab-author">Author</div>
            <div className="vocab-cell vocab-actions"></div>
          </div>

          {/* Search Input */}
          <div className="vocab-search-row">
            <input
              type="text"
              name="search_word"
              className="form-control vocab-search-input"
              placeholder="Search word, description..."
              onChange={(e) => onSearchVocab(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="vocab-content">
          {isSearching ? (
            <div className="vocab-message">Searching...</div>
          ) : vocabs.length > 0 ? (
            <List
              listRef={listRef}
              style={{ height: LIST_HEIGHT, width: LIST_WIDTH }}
              rowComponent={RowComponent}
              rowCount={vocabs.length}
              rowHeight={ROW_HEIGHT}
              rowProps={itemData}
            />
          ) : (
            <div className="vocab-message">No vocabularies found</div>
          )}
        </div>
      </div>
    );
  },
);

export default ListVocabTable;

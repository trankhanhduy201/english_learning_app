import React, { memo } from "react";
import { Link } from "react-router-dom";

const ListVocabTable = memo(({ vocabs, topicId, onDeleteVocab }) => {
  return (
    <div className="table-responsive" style={{ maxHeight: "265px", overflowY: "auto" }}>
      <table className="table table-striped">
        <thead style={{ position: "sticky", top: 0, backgroundColor: "white", zIndex: 1 }}>
          <tr>
            <th>#</th>
            <th>Word</th>
            <th>Descriptions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {vocabs.length > 0 ? (
            vocabs.map((vocab, index) => (
              <tr key={vocab.id}>
                <td>{index + 1}</td>
                <td>{vocab.word}</td>
                <td>{vocab.descriptions}</td>
                <td>
                  <div className="d-flex justify-content-end">
                    <Link to={`/topic/${topicId}/vocab/${vocab.id}`} className="me-2">
                      <i className="bi bi-pencil-square text-dark"></i>
                    </Link>
                    <button type="submit" className="btn btn-link p-0" onClick={() => onDeleteVocab(vocab.id)}>
                      <i className="bi bi-trash text-dark"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="text-center" colSpan="4">
                No vocabularies found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
});

export default ListVocabTable;

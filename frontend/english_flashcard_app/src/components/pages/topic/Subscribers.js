import { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { debounce } from "lodash";
import useFetch from "../../../hooks/useFetch";
import { getMembers } from "../../../services/topicApi";

export default function Subscribers({ defaultMembers, topicId, onRemoveMember }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [modalMembers, setModalMembers] = useState([]);

  const callApiFunc = useCallback((options = {}) => getMembers(topicId, options), [topicId]);
  const { data: allMembers, loading, refetch } = useFetch({ 
    callApiFunc, manualFetch: true, throttlingFetch: 60
  });

  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
      }, 300),
    []
  );  

  useEffect(() => {
    if (showModal) {
      refetch();
    }
  }, [showModal, refetch]);

  useEffect(() => {
    if (!allMembers) return;

    if (search.trim() === "") {
      setModalMembers(allMembers);
      return;
    }

    setModalMembers(
      allMembers.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [allMembers, search]);

  const displayedMembers = useMemo(() => {
    return allMembers ? allMembers.slice(0, 15) : defaultMembers;
  }, [allMembers, defaultMembers]);

  return (
    <>
      <div className="d-flex align-items-center">
        {displayedMembers.map((user) => (
          <img
            key={user.id}
            src={
              user?.avartar ??
              "https://ui-avatars.com/api/?name=User&background=0D6EFD&color=fff&size=30"
            }
            alt={user.member_name}
            title={user.member_name}
            className="rounded-circle subcriber-avatar me-2"
          />
        ))}

        {displayedMembers.length > 0 && (
          <button
            type="button"
            className="btn p-0 vertical-align-middle text-secondary ms-1"
            onClick={() => setShowModal(true)}
            style={{ fontSize: "1.5rem", fontWeight: "bold", lineHeight: 1 }}
            title="View all members"
          >
            &#x2026;
          </button>
        )}
      </div>

      {displayedMembers.length === 0 && (
        <div className="text-muted text-center">No subscribers yet.</div>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search members..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </InputGroup>
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "200px" }}
            >
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : modalMembers.length > 0 ? (
            <div className="list-group">
              {modalMembers.map((user) => (
                <div
                  key={user.member_id}
                  className="d-flex align-items-center justify-content-between list-group-item"
                >
                  <div className="d-flex align-items-center">
                    <img
                      src={
                        user.avartar ??
                        "https://ui-avatars.com/api/?name=User&background=0D6EFD&color=fff&size=40"
                      }
                      alt={user.member_name}
                      className="rounded-circle subcriber-avatar me-2"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                    <span>{user.member_name}</span>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onRemoveMember(user.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted text-center">No members found.</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
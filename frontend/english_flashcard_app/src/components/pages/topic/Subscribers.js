import { useState, useEffect, useMemo, useCallback } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { debounce } from "lodash";
import { useFetcher } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import { getMembers } from "../../../services/topicApi";
import RadioButtons from "../../RadioButtons";
import { SUBCRIBER_STATUS } from "../../../configs/appConfig";

export default function Subscribers({ defaultMembers, topicId }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [modalMembers, setModalMembers] = useState([]);

  const fetcher = useFetcher();

  const callApiFunc = useCallback(
    (options = {}) => getMembers(topicId, options),
    [topicId]
  );

  const { data: allMembers, loading, refetch } = useFetch({
    callApiFunc,
    manualFetch: true,
    throttlingFetch: 60,
  });

  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch(value);
      }, 300),
    []
  );

  useEffect(() => {
    if (showModal) refetch();
  }, [showModal, refetch]);

  useEffect(() => {
    if (!allMembers) return;

    let filtered = allMembers;

    if (search.trim() !== "") {
      filtered = allMembers.filter((u) =>
        u.username.toLowerCase().includes(search.toLowerCase())
      );
    }

    setModalMembers(filtered);
  }, [allMembers, search]);

  const toggleRemove = useCallback((index) => {
    setModalMembers((prev) => {
      const arr = [...prev];
      const user = arr[index];
      arr[index] = {
        ...user,
        is_remove: !user?.is_remove,
      };
      return arr;
    });
  });

  const onChangeStatus = useCallback((index, status) => {
    setModalMembers((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], status };
      return arr;
    });
  })

  const displayedMembers = useMemo(
    () => (allMembers ? allMembers.slice(0, 15) : defaultMembers),
    [allMembers, defaultMembers]
  );

  const initialMap = useMemo(() => {
    const map = {};
    (allMembers || []).forEach((m) => {
      map[m.member_id] = m;
    });
    return map;
  }, [allMembers]);

  const changedItems = useMemo(() => {
    return (modalMembers || [])
      .filter((u) => {
        const initial = initialMap[u.member_id];
        if (!initial) return true;
        if (u.is_remove) return true;
        if (u.status !== initial.status) return true;
        return false;
      })
      .map((u) => ({
        member_id: u.member_id,
        status: u.status,
        is_remove: u.is_remove ? 1 : 0,
      }));
  }, [modalMembers, initialMap]);

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
            className="btn p-0 text-secondary ms-1"
            onClick={() => setShowModal(true)}
            style={{ fontSize: "1.5rem", fontWeight: "bold" }}
          >
            &#x2026;
          </button>
        )}
      </div>

      {displayedMembers.length === 0 && (
        <div className="text-muted text-center">No subscribers yet.</div>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <InputGroup>
            <Form.Control
              placeholder="Search members..."
              onChange={(e) => handleSearch(e.target.value)}
            />
          </InputGroup>
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: 200 }}
            >
              <Spinner animation="border" />
            </div>
          ) : modalMembers && modalMembers.length > 0 ? (
            <div className="list-group">
              {modalMembers.map((user, index) => (
                <div
                  key={user.member_id}
                  className="list-group-item position-relative"
                  style={{ minHeight: "50px" }}
                >
                  {user.is_remove && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                          background: "rgba(255,255,255,0.65)",
                          zIndex: 10,
                        }}
                      ></div>

                      <Button
                        className="ms-auto me-2"
                        variant="primary"
                        size="sm"
                        onClick={() => toggleRemove(index)}
                        style={{ zIndex: 20 }}
                      >
                        <i className="bi bi-arrow-counterclockwise"></i> Undo
                      </Button>
                    </div>
                  )}

                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ opacity: user.is_remove ? 0.4 : 1 }}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          user.avartar ??
                          "https://ui-avatars.com/api/?name=User&background=0D6EFD&color=fff&size=40"
                        }
                        className="rounded-circle me-2"
                        style={{ width: 30, height: 30, objectFit: "cover" }}
                      />
                      <span>{user.member_name}</span>
                    </div>

                    <div className="d-flex align-items-center">
                      <RadioButtons
                        name={`status-${index}`}
                        options={Object.values(SUBCRIBER_STATUS)}
                        selectedOption={user.status}
                        disabled={user.is_remove}
                        onChange={(e) => onChangeStatus(index, e.target.value)}
                      />

                      <a
                        className="btn p-0 ms-2"
                        onClick={() => toggleRemove(index)}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-trash"></i>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted text-center">No members found.</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <fetcher.Form method="post" action={`/topic/${topicId}/members/update`}>
            <input type="hidden" name="_not_revalidate" defaultValue={"1"} />
            <input
              type="hidden"
              name="updating_member_data"
              value={JSON.stringify(changedItems)}
            />
            <Button type="submit" variant="primary">
              <i className="bi bi-pencil-square text-white"></i> Save
            </Button>
          </fetcher.Form>

          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="bi bi-arrow-left"></i> Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

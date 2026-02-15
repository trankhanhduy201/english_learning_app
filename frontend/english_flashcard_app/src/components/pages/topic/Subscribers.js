import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Modal, Button, Form, InputGroup, Spinner } from "react-bootstrap";
import { debounce } from "lodash";
import { useFetcher } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import { getMembers } from "../../../services/topicApi";
import RadioButtons from "../../RadioButtons";
import FieldErrors from "../../FieldErrors";
import { SUBCRIBER_STATUS } from "../../../configs/appConfig";

const Subscribers = memo(({ defaultMembers, topicId }) => {
  const fetcher = useFetcher();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [initialMap, setInitialMap] = useState();
  const [modalMembers, setModalMembers] = useState({
    'displayedMembers': [],
    'updatedMembers': {}
  });

  const callApiFunc = useCallback(
    (options = {}) => getMembers(topicId, options),
    [topicId]
  );

  const { data: allMembers, loading, refetch } = useFetch({
    callApiFunc,
    manualFetch: true,
    throttlingFetch: 60
  });

  const handleSearch = useMemo(
    () =>
      debounce((value) => {
        setSearch((value ?? "").toString());
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

  useEffect(() => {
    // For first assignment
    setInitialMap(prev =>
      (allMembers || []).reduce((data, item) => {
        data[item.member_id] = item;
        return data;
      }, {}));
  }, [allMembers]);

  useEffect(() => {
    if (showModal) refetch();
  }, [showModal, refetch]);

  useEffect(() => {
    if (!initialMap) return;

    let filtered = [...Object.values(initialMap)];
    if (search.trim() !== "") {
      filtered = filtered.filter((u) =>
        u.member_name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setModalMembers(prev => ({ ...prev, displayedMembers: filtered }));
  }, [initialMap, search]);

  useEffect(() => {
    if (fetcher.state !== 'idle') return;
    if (fetcher.data?.status !== 'success') return;

    // Reset updated data in modal
    setModalMembers(prev => ({ ...prev, updatedMembers: {} }));

    if (!Array.isArray(fetcher.data?.data)) return;

    // Set data for initial mapping for second time when settings are changed
    setInitialMap(prev => {
      const newMemberDatas = { ...prev };
      fetcher.data.data.forEach(item => {
        if (item?.is_remove) {
          delete newMemberDatas[item.member];
        } else {
          newMemberDatas[item.member] = {...item}
        }
      });
      return newMemberDatas;
    });
  }, [fetcher.state, fetcher.data]);

  const changeSettings = useCallback(
    (index, updatedData) => {
      setModalMembers(prev => {
        const oldSettings = prev.displayedMembers[index];
        if (!oldSettings) return prev;

        const memberId = oldSettings.member_id;
        const baseStatus = initialMap?.[memberId]?.status;

        const newSettings = {
          ...oldSettings,
          ...updatedData
        };

        // Clone state safely
        const nextDisplayedMembers = [...prev.displayedMembers];
        const nextUpdatedMembers = {
          ...prev.updatedMembers
        };

        // Apply updates
        nextDisplayedMembers[index] = newSettings;
        nextUpdatedMembers[memberId] = newSettings;

        // Remove from updatedMembers if unchanged
        if (
          !newSettings.is_remove &&
          baseStatus !== undefined &&
          newSettings.status === baseStatus
        ) {
          delete nextUpdatedMembers[memberId];
        }

        return {
          ...prev,
          displayedMembers: nextDisplayedMembers,
          updatedMembers: nextUpdatedMembers
        };
      });
    },
    [initialMap]
  );


  const toggleRemove = useCallback(
    (index, isRemove) => changeSettings(index, { is_remove: isRemove })
  );

  const onChangeStatus = useCallback(
    (index, status) => changeSettings(index, { status })
  );

  const defaultDisplayedMembers = useMemo(
    () => {
      const sliceMembers = initialMap
        ? [...Object.values(initialMap)]
        : [];
      return sliceMembers.length > 0
        ? sliceMembers.slice(0, 15)
        : defaultMembers;
    },
    [initialMap, defaultMembers]
  );

  const updateMemberErrors = useMemo(() => {
    if (fetcher.data?.status !== "error") return {};
    return fetcher.data?.errors ?? {};
  }, [fetcher.data]);

  const getMemberErrors = useCallback((index) => {
    const itemErrors = updateMemberErrors?.updating_member_data?.[index];
    if (!itemErrors || typeof itemErrors !== "object") return [];

    return Object.values(itemErrors).reduce((acc, fieldErrors) => {
      if (Array.isArray(fieldErrors)) {
        acc.push(...fieldErrors);
      }
      return acc;
    }, []);
  }, [updateMemberErrors]);

  return (
    <>
      <div className="d-flex align-items-center">
        {defaultDisplayedMembers.map((user) => (
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

        {defaultDisplayedMembers.length > 0 && (
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

      {defaultDisplayedMembers.length === 0 && (
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

        <Modal.Body style={{ minHeight: 67 }}>
          {(loading || fetcher.state === 'submitting') && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
              style={{
                backdropFilter: "blur(2px)",
                background: "rgba(255,255,255,0.6)",
                zIndex: 50,
              }}
            >
              <Spinner animation="border" />
            </div>
          )}
          {(modalMembers.displayedMembers && modalMembers.displayedMembers.length > 0) ? (
            <div className="list-group">
              {modalMembers.displayedMembers.map((user, index) => (
                <div
                  key={user.member_id}
                  className="list-group-item position-relative"
                  style={{ minHeight: 50 }}
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
                        onClick={() => toggleRemove(index, !user.is_remove)}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-trash"></i>
                      </a>
                    </div>
                  </div>

                  {getMemberErrors(index).length > 0 && (
                    <FieldErrors errors={getMemberErrors(index)} />
                  )}
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
              value={JSON.stringify(modalMembers.updatedMembers)}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={Object.values(modalMembers.updatedMembers).length == 0}
            >
              <i className="bi bi-pencil-square text-white"></i>{" "}
              <span className="btn-text">
                {fetcher.state === "submitting" ? "Saving..." : "Save"}
              </span>
            </Button>
          </fetcher.Form>

          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="bi bi-arrow-left"></i> Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
});

export default Subscribers;

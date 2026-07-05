import { memo, useEffect } from "react";
import { useFetcher } from "react-router-dom";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";

const DeleteConfirmButton = memo(
  ({
    action,
    method = "delete",
    formName = "",
    allowHideBtnText = true,
    revalidate = true,
    additionalCallback = null,
    btnClass = "btn-danger",
    color = "white",
    label = "Delete",
    confirmMessage = "Are you sure you want to delete data?",
  }) => {
    const deleteAllFetcher = useFetcher();
    const confirmDeleteModal = useConfirmModal({ 
      submitActionCallback: async () => {
        const formData = new FormData();
        if (!revalidate) {
          formData.append("_not_revalidate", "1");
        }
        if (formName) {
          formData.append("_form_name", formName);
        }
        return await deleteAllFetcher.submit(formData, { action, method });
      }
    });

    useEffect(() => {
      if (additionalCallback &&
          deleteAllFetcher.state === 'idle' && 
          deleteAllFetcher.data?.status === 'success') {
        additionalCallback();
      }
    }, [deleteAllFetcher.state, deleteAllFetcher.data, additionalCallback]);

    return (
      <>
        <button
          className={`btn ${btnClass}`}
          onClick={() => confirmDeleteModal.showConfirmModal()}
        >
          <i className="bi bi-trash" style={{ color }}></i>
          <span
            className={`btn-text ${allowHideBtnText ? '--d-sm-none' : ''}`}
            style={{ color }}
          > {label}</span>
        </button>
        {confirmDeleteModal.isShowModal && (
          <ConfirmModal
            message={confirmMessage}
            isShow={confirmDeleteModal.isShowModal}
            isSubmmiting={confirmDeleteModal.isSubmmiting}
            onClose={confirmDeleteModal.onClickNo}
            onSubmit={confirmDeleteModal.onClickYes}
          />
        )}
      </>
    );
  },
);
export default DeleteConfirmButton;
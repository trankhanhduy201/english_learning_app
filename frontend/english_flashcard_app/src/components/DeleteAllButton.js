import { memo, useEffect } from "react";
import { useFetcher } from "react-router-dom";
import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";
import { useCallback } from "react";

const DeleteAllButton = memo(
  ({ action, method = "delete", formName = "", revalidate = true, additionalCallback = null }) => {
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
          className="btn btn-danger"
          onClick={() => confirmDeleteModal.showConfirmModal()}
        >
          <i className="bi bi-trash text-white"></i> Delete all
        </button>
        {confirmDeleteModal.isShowModal && (
          <ConfirmModal
            message="Are you sure you want to delete all of data?"
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

export default DeleteAllButton;
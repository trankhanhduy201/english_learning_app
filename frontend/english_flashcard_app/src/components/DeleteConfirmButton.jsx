
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
    fetcher: parentFetcher = null,
    expectedId = null,
    disabled = false,
  }) => {
    // Fetcher
    const localFetcher = useFetcher();
    const submitFetcher = parentFetcher ?? localFetcher;

    // Submission state
    const currentSubmittedId =
      expectedId == null
        ? null
        : submitFetcher.formData?.get("_submit_id");

    const isDeletingThisItem =
      submitFetcher.state === "submitting" &&
      (expectedId == null
        ? true
        : String(currentSubmittedId ?? "") === String(expectedId));

    // Confirm modal
    const confirmDeleteModal = useConfirmModal({
      submitActionCallback: async () => {
        const formData = new FormData();

        if (!revalidate) {
          formData.append("_not_revalidate", "1");
        }

        if (formName) {
          formData.append("_form_name", formName);
        }

        if (expectedId != null) {
          formData.append("_submit_id", String(expectedId));
        }

        return await submitFetcher.submit(formData, {
          action,
          method,
        });
      },
    });

    // Success callback
    useEffect(() => {
      if (!additionalCallback) return;

      if (
        submitFetcher.state !== "idle" ||
        submitFetcher.data?.status !== "success"
      ) {
        return;
      }

      const respId = submitFetcher.data?.data?.id;
      additionalCallback(respId);
    }, [
      submitFetcher.state,
      submitFetcher.data,
      additionalCallback,
    ]);

    // Button configuration
    const displayLabel = isDeletingThisItem
      ? "Deleting..."
      : label;

    return (
      <>
        <button
          type="button"
          className={`btn ${btnClass}`}
          onClick={() => confirmDeleteModal.showConfirmModal()}
          disabled={isDeletingThisItem || disabled}
        >
          <i
            className="bi bi-trash"
            style={{ color }}
          ></i>

          {label && (
            <span
              className={`btn-text ${
                allowHideBtnText ? "--d-sm-none" : ""
              }`}
              style={{ color }}
            >
              {displayLabel}
            </span>
          )}
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
  }
);

export default DeleteConfirmButton;
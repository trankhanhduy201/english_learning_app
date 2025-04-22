import { useState } from "react";

const useConfirmModal = ({ submitActionCallback }) => {
  const [ isShowModal, setIsShowModal ] = useState(false);
  const showConfirmModal = () => setIsShowModal(true);
  const hideConfirmModal = () => setIsShowModal(false);
  const onClickYes = () => {
    if (submitActionCallback) {
      submitActionCallback();
    }
  }

  return {
    isShowModal,
    showConfirmModal,
    hideConfirmModal,
    onClickNo: hideConfirmModal,
    onClickYes
  }
}
export default useConfirmModal
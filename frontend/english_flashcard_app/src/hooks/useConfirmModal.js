import { useEffect, useOptimistic, useState } from "react";

const useConfirmModal = ({ submitActionCallback }) => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [isSubmmiting, setIsSubmmiting] = useState(false);
  // const [ isSubmmiting, setIsSubmmiting ] = useOptimistic(false, (prev, next) => next);
  const showConfirmModal = () => setIsShowModal(true);
  const hideConfirmModal = () => setIsShowModal(false);
  const onClickYes = async () => {
    setIsSubmmiting(true);
    if (submitActionCallback) {
      await submitActionCallback();
    }
    setIsSubmmiting(false);
    hideConfirmModal();
  };

  return {
    isShowModal,
    isSubmmiting,
    showConfirmModal,
    hideConfirmModal,
    onClickNo: hideConfirmModal,
    onClickYes,
  };
};
export default useConfirmModal;

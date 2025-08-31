import useConfirmModal from "../hooks/useConfirmModal";
import ConfirmModal from "./ConfirmModal";
import { memo } from "react";
import { useNavigate, useFetcher } from "react-router-dom";

const LogoutItem = memo(({ children, revokeTokens = false}) => {
  const logoutFetcher = useFetcher();
  const navigate = useNavigate();
  const confirmLogoutModal = useConfirmModal({
    submitActionCallback: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          return resolve(
            (async () => {
              const formData = new FormData();
              formData.append("_not_revalidate", "1");
              formData.append("revoke_tokens", revokeTokens ? 1 : 0);
              return await logoutFetcher.submit(formData, {
                action: '/logout',
                method: 'post'
              })}
            )()
          );
        }, 3000);
      });
    },
  });

  return (
    <>
      <div onClick={() => confirmLogoutModal.showConfirmModal()}>
        {children}
      </div>
      {confirmLogoutModal.isShowModal && (
        <ConfirmModal
          message={revokeTokens 
            ? "Are you sure you want to logout all machines? " 
            : "Are you sure you want to logout?"
          }
          isShow={confirmLogoutModal.isShowModal}
          isSubmmiting={confirmLogoutModal.isSubmmiting}
          onClose={confirmLogoutModal.onClickNo}
          onSubmit={confirmLogoutModal.onClickYes}
        />
      )}
    </>
  );
});

export default LogoutItem;

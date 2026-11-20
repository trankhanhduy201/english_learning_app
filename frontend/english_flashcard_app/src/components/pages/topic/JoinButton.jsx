
import { memo, useCallback, useEffect, useRef } from "react";
import { useFetcher } from "react-router-dom";

const JoinButton = memo(({
  buttonType = '',
  topicId,
  topicMember = null,
  updateTopicMember = null
}) => {
  const handleJoinFetcher = useFetcher();
  const processedResult = useRef(null);

  // Button state
  const hasMemberRecord = Boolean(topicMember?.has_member_record);
  const isAccepted = Boolean(topicMember?.is_accepted);
  const isSubmitting = handleJoinFetcher.state === 'submitting';

  // Button configuration
  const buttonConfig = hasMemberRecord
    ? {
        action: 'leave',
        icon: 'bi-dash-circle',
        className: 'btn-danger',
        label: isSubmitting
          ? 'Leaving...'
          : isAccepted
            ? 'Leave'
            : 'Confirming',
      }
    : {
        action: 'join',
        icon: 'bi-plus-circle',
        className: 'btn-primary',
        label: isSubmitting 
          ? 'Joining...' 
          : 'Join',
      };

  const handleJoin = useCallback((action) => {
    const formData = new FormData();
    formData.append("_not_revalidate", "1");

    handleJoinFetcher.submit(formData, {
      action: `/topic/${topicId}/${action}`,
      method: "post"
    });
  }, [handleJoinFetcher, topicId]);

  useEffect(() => {
    if (
      handleJoinFetcher.state === 'idle' &&
      handleJoinFetcher.data?.status === 'success' &&
      processedResult.current !== handleJoinFetcher.data
    ) {
      processedResult.current = handleJoinFetcher.data;
      updateTopicMember?.({
        ...handleJoinFetcher.data.data
      });
    }
  }, [
    handleJoinFetcher.state,
    handleJoinFetcher.data,
    updateTopicMember,
  ]);

  if (!topicMember || topicMember.is_owner) {
    return null;
  }

  return (
    <button
      className={`btn btn-${buttonType} ${buttonConfig.className} ms-auto`}
      onClick={() => handleJoin(buttonConfig.action)}
      disabled={isSubmitting}
    >
      <i className={`bi ${buttonConfig.icon} text-white me-1`}></i>
      {buttonConfig.label}
    </button>
  );
});

export default JoinButton;


import { memo, useCallback, useEffect, useRef } from "react";
import { useFetcher } from "react-router-dom";

const JoinButton = memo(({
  buttonType = '',
  compact = false,
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
        icon: 'bi-box-arrow-in-left',
        className: 'btn-danger',
        label: isSubmitting
          ? 'Leaving...'
          : isAccepted
            ? 'Leave'
            : 'Confirming',
      }
    : {
        action: 'join',
        icon: 'bi-box-arrow-in-right',
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

  const sizeClass = buttonType ? `btn-${buttonType}` : '';
  const compactClass = compact
    ? 'badge border-0 py-1 px-2 text-uppercase small'
    : '';

  return (
    <button
      type="button"
      className={`btn ${sizeClass} ${compactClass} ${buttonConfig.className} ${compact ? '' : 'ms-auto'}`}
      onClick={() => handleJoin(buttonConfig.action)}
      disabled={isSubmitting}
    >
      <i className={`bi ${buttonConfig.icon} text-white me-1`}></i>
      {buttonConfig.label}
    </button>
  );
});

export default JoinButton;

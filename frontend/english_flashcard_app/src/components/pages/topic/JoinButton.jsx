import { memo, useCallback, useEffect } from "react";
import { useFetcher } from "react-router-dom";

const JoinButton = memo(({ buttonType = '', topicId, topicMember = null, updateTopicMember = null }) => {
  const btnSmallClass = `btn-${buttonType}`;
  const isMember = Boolean(topicMember?.is_member);
  const isAccepted = Boolean(topicMember?.is_accepted);
  const btnTypeClass = `btn-${isMember ? 'danger' : 'primary'}`;
  const handleJoinFetcher = useFetcher();

  const handleJoin = useCallback((action) => {
    const formData = new FormData();
    formData.append("_not_revalidate", "1");
    handleJoinFetcher.submit(formData, {
      action: `/topic/${topicId}/${action}`,
      method: "post"
    });
  }, [handleJoinFetcher, topicId]);

  useEffect(() => {
    if (handleJoinFetcher.state === 'idle' &&
        handleJoinFetcher.data?.status === 'success'
      ) {
        updateTopicMember?.({
          ...handleJoinFetcher.data?.data
        });
    }
  }, [
    handleJoinFetcher.state,
    handleJoinFetcher.data,
    updateTopicMember,
  ]);

  return (
    <>
      {(topicMember && !topicMember.is_owner) && (
        <button
          className={`btn ${btnSmallClass} ${btnTypeClass} ms-auto`}
          onClick={() => handleJoin(
            isMember ? 'leave' : 'join'
          )}
          disabled={handleJoinFetcher.state === 'submitting'}
        >
          {isMember ? (
            <>
              <i className="bi bi-dash-circle text-white me-1"></i>
              {handleJoinFetcher.state === 'submitting'
                ? 'Leaving...'
                : isAccepted
                  ? 'Leave'
                  : 'Accepting'
              }
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle text-white me-1"></i>
              {handleJoinFetcher.state === 'submitting'
                ? 'Joining...'
                : 'Join'
              }
            </>
          )}
        </button>
      )}
    </>
  );
});

export default JoinButton;
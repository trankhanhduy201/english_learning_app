import { memo, useCallback, useEffect } from "react";
import { useFetcher } from "react-router-dom";

const SubcribeButton = memo(({ buttonType = '', topicId, topicMember = null, updateTopicMember = null }) => {
	const btnSmallClass = `btn-${buttonType}`;
	const btnTypeClass = `btn-${topicMember.is_subcribing ? 'danger' : 'primary'}`;
	const handleSubcribeFetcher = useFetcher();

	const handleSubcribe = useCallback((action) => {
		const formData = new FormData();
    formData.append("_not_revalidate", "1");
    handleSubcribeFetcher.submit(formData, {
      action: `/topic/${topicId}/${action}`,
      method: "post"
    });
	}, [topicId]);

	useEffect(() => {
		if (handleSubcribeFetcher.state === 'idle' && 
				handleSubcribeFetcher.data?.status === 'success'
			) {
				updateTopicMember({
					is_subcribing: !topicMember.is_subcribing
				});
		}
	}, [
		handleSubcribeFetcher.state, 
		handleSubcribeFetcher.data
	]);

	return (
		<>
			{(topicMember && !topicMember.is_owner) && (
				<button 
					className={`btn ${btnSmallClass} ${btnTypeClass} ms-auto`}
					onClick={() => handleSubcribe(
						topicMember.is_subcribing ? 'unsubcribe' : 'subcribe'
					)}
					disabled={handleSubcribeFetcher.state === 'submitting'}
				>
					{topicMember.is_subcribing ? (
						<>
							<i className="bi bi-dash-circle text-white me-1"></i>
							{handleSubcribeFetcher.state === 'submitting' 
								? 'Unsubcribing...' 
								: topicMember.is_accepted 
									? 'Unsubcribe' 
									: 'Accepting'}
						</>
					) : (
						<>
							<i className="bi bi-plus-circle text-white me-1"></i>
							{handleSubcribeFetcher.state === 'submitting' 
								? 'Subcribing...' 
								: 'Subcribe'
							}
						</>
					)}
				</button>
			)}
		</>
	);
});

export default SubcribeButton;
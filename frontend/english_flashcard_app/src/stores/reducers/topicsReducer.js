export const setIsFetchedReducer = (state, action) => 
	({ ...state, isFetched: action.payload });

export const setTopicsReducer = (state, action) => 
	({ ...state, data: action.payload });

export const clearTopicsReducer = (state, action) => 
	({ ...state, data: [] });

export const setTopicReducer = (state, action) => {
	const topicData = action.payload;
	const index = state.data.findIndex(topic => 
		parseInt(topic.id) === parseInt(topicData.id)
	);
	if (index === -1) {
		return { 
			...state, 
			data: [...state.data, topicData] 
		};
	}
	return { 
		...state, 
		data: state.data.map((topic, i) => 
			(index === i) ? topicData : topic
		)
	};
};

export const clearTopicReducer = (state, action) => {
	const topicData = action.payload;
	return {
		...state,
		data: state.data.filter(topic => 
			parseInt(topic.id) !== parseInt(topicData.id)
		)
	}
};
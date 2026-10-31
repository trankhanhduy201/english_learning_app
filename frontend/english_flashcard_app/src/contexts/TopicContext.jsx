import { createContext, useContext, useState, useMemo } from "react";

const TopicContext = createContext();

export const useTopicContext = () => useContext(TopicContext);

export const TopicProvider = ({ initialTopic, children }) => {
  const [topic, setTopic] = useState(initialTopic);

  const value = useMemo(
    () => ({
      topic,
      setTopic,
    }),
    [topic],
  );

  return (
    <TopicContext.Provider value={value}>{children}</TopicContext.Provider>
  );
};

import { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router-dom";

const MOCK_TOPICS = [
  { id: 1, name: "Travel English" },
  { id: 2, name: "Business Meetings" },
  { id: 3, name: "Daily Conversation" },
  { id: 4, name: "Food & Restaurants" },
  { id: 5, name: "Job Interview" },
  { id: 6, name: "IELTS Speaking" },
  { id: 7, name: "TOEIC Vocabulary" },
  { id: 8, name: "Movies & Entertainment" },
  { id: 9, name: "Health & Fitness" },
  { id: 10, name: "Shopping" },
];

const getMockTopicImageUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0D6EFD&color=fff&size=64`;

export default function TopicAutocompleteSearch({
  placeholder = "Search topics...",
  debounceMs = 350,
  limit = 5
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const debouncedSearch = useMemo(
    () =>
      debounce((rawValue) => {
        const value = (rawValue || "").trim().toLowerCase();

        if (!value) {
          setResults([]);
          return;
        }

        const filtered = MOCK_TOPICS.filter((t) =>
          t.name.toLowerCase().includes(value)
        ).slice(0, limit);

        setResults(filtered);
      }, debounceMs),
    [debounceMs, limit]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    const onDocumentMouseDown = (e) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(e.target)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", onDocumentMouseDown);
    return () => document.removeEventListener("mousedown", onDocumentMouseDown);
  }, []);

  const onChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    debouncedSearch(value);
  };

  const onPick = (topic) => {
    setQuery(topic.name);
    setIsOpen(false);
    navigate(`/topic/${topic.id}`);
  };

  const onSearchClick = () => {
    const value = query.trim();
    setIsOpen(false);
    if (!value) {
      // navigate("/topics");
      return;
    }
    navigate(`/topics?text_search=${encodeURIComponent(value)}`);
  };

  return (
    <div
      id="header__search-bar"
      className="input-group input-group-sm me-2 position-relative"
      ref={containerRef}
    >
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={query}
        onChange={onChange}
        onFocus={() => setIsOpen(true)}
        aria-label="Search topics"
        autoComplete="off"
      />
      <button
        type="button"
        className="input-group-text bg-white"
        aria-label="Search"
        onClick={onSearchClick}
      >
        <i className="bi bi-search"></i>
      </button>

      {isOpen && query.trim() && results.length > 0 && (
        <div
          className="position-absolute top-100 start-0 w-100 bg-white border rounded mt-1 z-3"
          role="listbox"
        >
          <div className="list-group list-group-flush">
            {results.map((topic) => (
              <button
                key={topic.id}
                type="button"
                className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(topic)}
              >
                <img
                  src={getMockTopicImageUrl(topic.name)}
                  alt={topic.name}
                  className="rounded"
                  style={{ width: "28px", height: "28px" }}
                />
                <span className="text-truncate">{topic.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

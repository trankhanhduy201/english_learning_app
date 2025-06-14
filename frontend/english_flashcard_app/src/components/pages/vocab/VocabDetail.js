import { memo } from "react";
import { Form } from "react-bootstrap";
import _ from "lodash";
import { LANGUAGES } from "../../../configs/langConfigs";

const VocabDetail = memo(
  ({
    vocabData = {},
    topicData = null,
    topicId = "",
    errors = {},
  }) => {
    const defaultLanguage = vocabData?.language || topicData?.learning_language || "";

    return (
      <>
        <div className="mb-3">
          <label htmlFor="word" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            name="word"
            defaultValue={vocabData?.word}
            placeholder="Word..."
          />
        </div>
        {errors?.word && (
          <ul>
            {errors.word.map((error, index) => (
              <li className="text-danger" key={index}>
                {error}
              </li>
            ))}
          </ul>
        )}
        <div className="row">
          <div className="mb-3 col-lg-6">
            <label htmlFor="language" className="form-label">
              Language
            </label>
            <Form.Select
              className="form-control"
              name="language"
              defaultValue={defaultLanguage}
            >
              {LANGUAGES.map(item => (
                <option key={item.key} value={item.key}>
                  {item.text}
                </option>
              ))}
            </Form.Select>
            {errors?.language && (
              <ul>
                {errors.language.map((error, index) => (
                  <li className="text-danger" key={index}>
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-3 col-lg-6">
            <label htmlFor="topic" className="form-label">
              Topic
            </label>
            <Form.Select
              className="form-control"
              name="topic"
              defaultValue={topicId}
              disabled
            >
              {topicData && (
                <option value={topicData.id}>{topicData.name}</option>
              )}
            </Form.Select>
            {errors?.topic && (
              <ul>
                {errors.topic.map((error, index) => (
                  <li className="text-danger" key={index}>
                    {error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="descriptions" className="form-label">
            Descriptions
          </label>
          <textarea
            rows={5}
            className="form-control"
            name="descriptions"
            defaultValue={vocabData?.descriptions}
            placeholder="Description..."
          ></textarea>
        </div>
        {errors?.descriptions && (
          <ul>
            {errors.descriptions.map((error, index) => (
              <li className="text-danger" key={index}>
                {error}
              </li>
            ))}
          </ul>
        )}
      </>
    );
  },
);

export default VocabDetail;

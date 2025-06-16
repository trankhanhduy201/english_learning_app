import { memo } from "react";
import _ from "lodash";
import { LANGUAGES } from "../../../configs/langConfigs";
import FieldErrors from "../../../components/FieldErrors";
import Dropdown from "../../../components/Dropdown";


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
          {errors?.word && (
            <FieldErrors errors={errors.word} />
          )}
        </div>
        <div className="row">
          <div className="mb-3 col-lg-6">
            <label htmlFor="language" className="form-label">
              Language
            </label>
            <Dropdown
              name="language"
              defaultValue={defaultLanguage}
              options={LANGUAGES}
            />
            {errors?.language && (
              <FieldErrors errors={errors.language} />
            )}
          </div>
          <div className="mb-3 col-lg-6">
            <label htmlFor="topic" className="form-label">
              Topic
            </label>
            <Dropdown
              name="topic"
              defaultValue={defaultLanguage}
              options={[{
                key: topicData?.id,
                text: topicData?.name,
              }]}
              disabled={1}
            />
            {errors?.topic && (
              <FieldErrors errors={errors.topic} />
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
          {errors?.descriptions && (
            <FieldErrors errors={errors.descriptions} />
          )}
        </div>
      </>
    );
  },
);

export default VocabDetail;

import React, { memo, Suspense } from "react";
import { Await } from "react-router-dom";
import { Form } from "react-bootstrap";
import _ from "lodash";
import { LANGUAGES } from "../../../configs/langConfigs";

const VocabDetail = memo(
  ({ topicId = "", data = {}, errors = {}, topicsPromise = null }) => {
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
            defaultValue={data?.word}
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
              defaultValue={data?.language}
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
            {topicsPromise && (
              <Suspense fallback={<option>Loading...</option>}>
                <Await resolve={topicsPromise}>
                  {(dataTopic) => (
                    <>
                      <Form.Select
                        className="form-control"
                        name="topic"
                        defaultValue={topicId}
                      >
                        <option value="">-- No choice --</option>
                        {dataTopic &&
                          dataTopic.map((item, index) => (
                            <option key={index} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                      </Form.Select>
                    </>
                  )}
                </Await>
              </Suspense>
            )}
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
            defaultValue={data?.descriptions}
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

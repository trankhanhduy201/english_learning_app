import { memo, Suspense } from "react";
import {
  Await,
  Link,
  Navigate,
  useFetcher,
  useLoaderData,
  useParams,
} from "react-router-dom";
import TranslationTabs from "../components/pages/vocab/TranslationTabs";
import LoadingOverlay from "../components/LoadingOverlay";
import VocabDetail from "../components/pages/vocab/VocabDetail";
import { useTopicContext } from "../contexts/TopicContext";
import { ErrorBoundary } from "react-error-boundary";

const Vocab = memo(() => {
  const vocabFetcher = useFetcher();
  const delVocabFetcher = useFetcher();
  const { topicId, vocabId } = useParams();
  const { vocabPromise } = useLoaderData();
  const isNew = () => vocabId === "new";
  const { topic: topicData } = useTopicContext();

  const handleDelVocab = () => {
    const formData = new FormData();
    formData.append("_form_name", "deleting_vocab");
    delVocabFetcher.submit(formData, {
      action: `/topic/${topicId}/vocab/${vocabId}/delete`,
      method: "delete",
    });
  };

  const isDisableButton = () =>
    vocabFetcher.state === "submitting" ||
    delVocabFetcher.state === "submitting";

  return (
    <ErrorBoundary fallback={<Navigate to={`/topic/${topicId}`} />}>
      <vocabFetcher.Form
        action={`/topic/${topicId}/vocab/${vocabId}`}
        method={isNew() ? "POST" : "PUT"}
      >
        <input
          type="hidden"
          name="_form_name"
          value={`${isNew() ? "creating" : "updating"}_vocab`}
        />
        <div className="row">
          <div className="col-lg-6 text-start mb-4">
            <h1 className="text-start">Vocab info</h1>
            <Suspense
              fallback={
                <>
                  <VocabDetail />
                  <LoadingOverlay />
                </>
              }
            >
              <Await resolve={vocabPromise}>
                {(vocabData) => (
                  <VocabDetail
                    vocabData={vocabData}
                    topicData={topicData}
                    topicId={topicId}
                    errors={vocabFetcher.data?.errors ?? {}}
                  />
                )}
              </Await>
            </Suspense>
          </div>
          <div className="col-lg-6 text-start">
            <h1 className="text-start">Translations</h1>
            <div className="container mt-4">
              <Suspense fallback={<p className="text-center">Loadding...</p>}>
                <Await resolve={vocabPromise}>
                  {(data) => (
                    <TranslationTabs data={data?.translations ?? []} />
                  )}
                </Await>
              </Suspense>
            </div>
          </div>
          <div className="d-sm-flex justify-content-start">
            <div className="d-flex justify-content-start">
              <Link to={`/topic/${topicId}`} className="btn btn-secondary me-2 w-sm-50">
                <i className="bi bi-arrow-left"></i> Topic info
              </Link>
              <button
                type="submit"
                className={`btn btn-primary ${!isNew() ? 'me-sm-2' : ''} w-sm-50`}
                disabled={isDisableButton()}
              >
                <i className="bi bi-pencil-square text-white"></i>{" "}
                {vocabFetcher.state === "submitting" ? "Saving..." : "Save"}
              </button>
            </div>
            {!isNew() && (
              <button
                type="button"
                className="btn btn-danger w-sm-100 mt-sm-0 mt-2"
                disabled={isDisableButton()}
                onClick={handleDelVocab}
              >
                <i className="bi bi-trash text-white"></i>{" "}
                {delVocabFetcher.state === "submitting"
                  ? "Deleting..."
                  : "Delete"}
              </button>
            )}
          </div>
        </div>
      </vocabFetcher.Form>
    </ErrorBoundary>
  );
});

export default Vocab;

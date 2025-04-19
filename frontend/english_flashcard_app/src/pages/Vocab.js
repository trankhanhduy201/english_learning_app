import React, { Suspense } from 'react';
import { Await, Link, useFetcher, useLoaderData, useParams } from 'react-router-dom';
import _ from "lodash";
import TranslationTabs from '../components/pages/vocab/TranslationTabs';
import LoadingOverlay from '../components/LoadingOverlay';
import VocabDetail from '../components/pages/vocab/VocabDetail';

const Vocab = () => {
  const vocabFetcher = useFetcher();
  const delVocabFetcher = useFetcher();
  const { topicId, vocabId } = useParams();
  const { topicsPromise, vocabPromise } = useLoaderData();
  const isNew = () => vocabId === 'new';

  const handleDelVocab = () => {
    const formData = new FormData();
    formData.append('_form_name', 'deleting_vocab');
    delVocabFetcher.submit(formData, {
      action: `/topic/${topicId}/vocab/${vocabId}/delete`,
      method: 'delete'
    });
  }

  return (
    <div className="container mt-4">
      <vocabFetcher.Form action={`/topic/${topicId}/vocab/${vocabId}`} method={isNew() ? 'POST' : 'PUT'}>
        <input type='hidden' name='_form_name' value={`${isNew() ? 'creating' : 'updating'}_vocab`} />
        <div className="row">
          <div className="col-lg-6 text-start mb-4">
            <h1 className='text-start'>Vocab info</h1>
            <Suspense fallback={
              <>
                <VocabDetail />
                <LoadingOverlay />
              </>
            }>
              <Await resolve={vocabPromise}>
                {(data) => (
                  <VocabDetail
                    topicId={topicId}
                    data={data}
                    errors={vocabFetcher.data?.errors ?? {}}
                    topicsPromise={topicsPromise}
                  />
                )}
              </Await>
            </Suspense>
          </div>
          <div className="col-lg-6 text-start">
            <h1 className='text-start'>Translations</h1>
            <div className="container mt-4">
              <Suspense fallback={<p className='text-center'>Loadding...</p>}>
                <Await resolve={vocabPromise}>
                  {(data) => (
                    <TranslationTabs data={data?.translations ?? []} />
                  )}
                </Await>
              </Suspense>
            </div>
          </div>
          <div className='d-flex justify-content-start'>
            <Link to={`/topic/${topicId}`} className="btn btn-secondary me-2">
              <i className="bi bi-arrow-left"></i> Topic info
            </Link>
            <button type="submit" className="btn btn-primary me-2" disabled={vocabFetcher.state === "submitting"}>
              <i className="bi bi-pencil-square text-white"></i> {vocabFetcher.state === "submitting" ? "Saving..." : "Save"}
            </button>
            {!isNew() && (
              <button type="button" className="btn btn-danger" disabled={delVocabFetcher.state === "submitting"} onClick={handleDelVocab}>
                <i className="bi bi-trash text-white"></i> {delVocabFetcher.state === "submitting" ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>
      </vocabFetcher.Form>
    </div>
  );
};

export default Vocab;
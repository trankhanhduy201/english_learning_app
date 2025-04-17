import React, { Suspense, useEffect } from 'react';
import { Await, Link, useFetcher, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import _ from "lodash";
import * as alertConfigs from "../configs/alertConfigs";
import { setAlert } from '../stores/slices/alertSlice';
import TranslationTabs from '../components/pages/vocab/TranslationTabs';
import LoadingOverlay from '../components/LoadingOverlay';
import VocabDetail from '../components/pages/vocab/VocabDetail';

const Vocab = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const vocabFetcher = useFetcher();
  const delVocabFetcher = useFetcher();
  const { topicId, vocabId } = useParams();
  const { topicsPromise, vocabPromise } = useLoaderData();
  const isNew = () => vocabId === 'new';

  useEffect(() => {
    if (vocabFetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: `Vocab is ${vocabId === 'new' ? 'created' : 'updated'} successfully`
      }));
      if (vocabId === 'new') {
        if (vocabFetcher.data.data?.id) {
          navigate(`/topic/${topicId}/vocab/${vocabFetcher.data.data.id}`);
        } else {
          navigate(`/topic/${topicId}`);
        }
      }
    }
  }, [vocabFetcher.data]);

  useEffect(() => {
    if (delVocabFetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: "Vocab deleted successfully"
      }));
      navigate(`/topic/${topicId}`);
    }
  }, [delVocabFetcher.data]);

  const handleDelVocab = () => {
    delVocabFetcher.submit(null, {
      action: `/topic/${topicId}/vocab/${vocabId}/delete`,
      method: 'delete'
    });
  }

  return (
    <div className="container mt-4">
      <vocabFetcher.Form action={`/topic/${topicId}/vocab/${vocabId}`} method={vocabId === 'new' ? 'POST' : 'PUT'}>
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
import React, { memo, useEffect } from 'react';
import { useFetcher, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAlert } from '../../../stores/slices/alertSlice';
import * as alertConfigs from "../../../configs/alertConfigs";

const TopicDetail = memo(({ topic = null, topicId = '', isNew = false }) => {
  const editTopicFetcher = useFetcher();
  const delTopicFetcher = useFetcher();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (editTopicFetcher.data?.status === "success") {
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: isNew
          ? "Topic created successfully"
          : "Topic updated successfully"
      }));
      if (isNew) {
        const newId = editTopicFetcher.data?.data.id;
        navigate(`/topic/${newId}`);
      }
    }
  }, [editTopicFetcher.data]);

  useEffect(() => {
    if (delTopicFetcher.data?.status === "success") {
      navigate(`/topics`);
      dispatch(setAlert({
        type: alertConfigs.SUCCESS_TYPE,
        message: "Topic deleted successfully"
      }));
    }
  }, [delTopicFetcher.data]);

  const handleDelTopic = () => {
    const formData = new FormData();
    formData.append('_not_revalidate', '1');
    delTopicFetcher.submit(formData, {
      action: `/topic/${topicId}/delete`, 
      method: 'delete'
    });
  }

  return (
    <editTopicFetcher.Form action={`/topic/${topicId}`} method={isNew ? 'post' : 'put'}>
			<input type="hidden" name="_not_revalidate" defaultValue={'1'}/>
			<div className="mb-3">
				<label htmlFor="name" className="form-label">Name</label>
				<input type="text" className="form-control" name="name" defaultValue={topic?.name} placeholder='Name...'/>
			</div>
			{editTopicFetcher.data?.errors?.name && (
				<ul>
					{editTopicFetcher.data.errors.name.map((error, index) => (
						<li className='text-danger' key={index}>{error}</li>
					))}
				</ul>
			)}
			<div className="mb-3">
				<label htmlFor="descriptions" className="form-label">Descriptions</label>
				<textarea rows={5} className="form-control" name="descriptions" defaultValue={topic?.descriptions} placeholder='Description...'></textarea>
			</div>
			{editTopicFetcher.data?.errors?.descriptions && (
				<ul>
					{editTopicFetcher.data.errors.descriptions.map((error, index) => (
						<li className='text-danger' key={index}>{error}</li>
					))}
				</ul>
			)}
			<Link to={`/topics`} className="btn btn-secondary me-2">
				<i className="bi bi-arrow-left"></i> List topic
			</Link>
      {!isNew && (
				<Link to={`/topic/${topicId}/learn`} className='btn btn-success me-2'>
          <i className="bi bi-clipboard-pulse text-white"></i> Learn
        </Link>
			)}
			<button type="submit" className="btn btn-primary me-2" disabled={editTopicFetcher.state === "submitting"}>
				<i className="bi bi-pencil-square text-white"></i> {editTopicFetcher.state === "submitting" ? "Saving..." : "Save"}
			</button>
			{!isNew && (
				<button type="button" className="btn btn-danger" onClick={handleDelTopic} disabled={delTopicFetcher.state === "submitting"}>
					<i className="bi bi-trash text-white"></i> {delTopicFetcher.state === "submitting" ? "Deleting..." : "Delete"}
				</button>
			)}
		</editTopicFetcher.Form>
  );
});

export default TopicDetail;
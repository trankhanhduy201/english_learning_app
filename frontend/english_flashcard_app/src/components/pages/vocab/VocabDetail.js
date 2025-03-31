import React, { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router-dom';
import { Form } from "react-bootstrap";
import _ from "lodash";

const VocabDetail = ({ topicId = '', data = {}, errors = {} }) => {
	const { topicsPromise } = useLoaderData();

	return (
		<>
			<div className="mb-3">
				<label htmlFor="word" className="form-label">Name</label>
				<input type="text" className="form-control" name="word" defaultValue={data?.word} placeholder='Word...' />
			</div>
			{errors?.word && (
				<ul>
					{errors.word.map((error, index) => (
						<li className='text-danger' key={index}>{error}</li>
					))}
				</ul>
			)}
			<div className="mb-3">
				<label htmlFor="topic" className="form-label">Topic</label>
				<Suspense fallback={<option>Loading...</option>}>
					<Await resolve={topicsPromise}>
						{(dataTopic) =>
							<>
								<Form.Select
									className='form-control'
									name='topic'
									defaultValue={topicId}
								>
									<option value=''>-- No choice --</option>
									{dataTopic && (
										dataTopic.map((item, index) => (
											<option key={index} value={item.id}>{item.name}</option>
										))
									)}
								</Form.Select>
							</>
						}
					</Await>
				</Suspense>
			</div>
			{errors?.topic && (
				<ul>
					{errors.topic.map((error, index) => (
						<li className='text-danger' key={index}>{error}</li>
					))}
				</ul>
			)}
			<div className="mb-3">
				<label htmlFor="descriptions" className="form-label">Descriptions</label>
				<textarea rows={5} className="form-control" name="descriptions" defaultValue={data?.descriptions} placeholder='Description...'></textarea>
			</div>
			{errors?.descriptions && (
				<ul>
					{errors.descriptions.map((error, index) => (
						<li className='text-danger' key={index}>{error}</li>
					))}
				</ul>
			)}
		</>
	);
};

export default VocabDetail;
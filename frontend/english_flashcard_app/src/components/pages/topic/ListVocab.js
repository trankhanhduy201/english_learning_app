import React, { useEffect, useState } from 'react';
import { useFetcher, Link, useAsyncValue } from 'react-router-dom';

const ListVocab = ({ topicId }) => {
	const [ vocabs, setVocabs ] = useState(useAsyncValue());
	const delVocabFetcher = useFetcher();

	useEffect(() => {
		setVocabs(vocabs.map((v, i) => ({ ...v, idx: i })));
	}, []);

	useEffect(() => {
		if (delVocabFetcher.data?.status === "success") {
			const rmId = delVocabFetcher.data.id;
			setVocabs(oldState => oldState.filter(v => v.id != rmId));
		}
	}, [delVocabFetcher.data]);

	return (
		<div className="table-responsive" style={{ maxHeight: '250px', overflowY: 'auto' }}>
			{delVocabFetcher.state == 'submitting' && (<p className='text-center'>Loading...</p>)}
			<table className="table table-striped">
				<thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
					<tr>
						<th>#</th>
						<th>Word</th>
						<th>Descriptions</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{vocabs.length > 0 ? (
						vocabs.map((vocab, index) => (
							<tr key={vocab.id}>
								<td>{index + 1}</td>
								<td>{vocab.word}</td>
								<td>{vocab?.descriptions}</td>
								<td>
									<div className='d-flex justify-content-end'>
										<Link to={`/topic/${topicId}/vocab/${vocab.id}`} className="me-2">
											<i className="bi bi-pencil-square text-dark"></i>
										</Link>
										<delVocabFetcher.Form action={`/topic/${topicId}/vocab/${vocab.id}/delete`} method="delete">
											<input type="hidden" name="_not_revalidate" defaultValue={'1'} />
											<button disabled={delVocabFetcher.state == 'submitting'} type="submit" className="btn btn-link p-0">
												<i className="bi bi-trash text-dark"></i>
											</button>
										</delVocabFetcher.Form>
									</div>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td className='text-center' colSpan="4">No vocabularies found</td>
						</tr>
					)}
					<tr>
						<td className='text-end' colSpan="4">
							<Link to={`/topic/${topicId}/vocab/import`} className="btn btn-secondary me-2">
								<i className="bi bi-download"></i> Export
							</Link>
							<Link to={`/topic/${topicId}/vocab/import`} className="btn btn-secondary me-2">
								<i className="bi bi-upload"></i> Import
							</Link>
							<Link to={`/topic/${topicId}/vocab/new`} className="btn btn-secondary">
								<i className="bi bi-plus-circle"></i> New
							</Link>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};

export default ListVocab;
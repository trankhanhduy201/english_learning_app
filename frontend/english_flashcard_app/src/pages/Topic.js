import React, { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setError } from '../stores/slices/errorSlice';

const Topic = () => {
  const dispatch = useDispatch();
  const { topic, vocabsPromise } = useLoaderData();
  const [ vocabs, setVocabs ] = useState([]);

  useEffect(() => {
    const getVocabs = async () => {
      try {
        const data = await vocabsPromise.json();
        setVocabs(data);
      } catch(error) {
        dispatch(setError('Can not get vocabularies'));
      }
    }
    getVocabs();
  }, [topic.id])

  return (
    <>
      <h1>{topic.name}</h1>
      <hr />
      
    </>
  );
};

export default Topic;
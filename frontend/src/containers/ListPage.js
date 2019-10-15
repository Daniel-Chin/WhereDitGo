import React from 'react';
import LoadingCard from '../components/LoadingCard.js';
import ListEntry from  '../components/ListEntry.js';
import './ListPage.css';

const ListPage = ({ database }) => {
  if (! database) {
    return (
      <LoadingCard />
    )
  }
  return (
    <div className="ListPage">
      {
        database
        .filter(({ payload }) => (payload.type === 'expense'))
        .map(({ payload }, i) => (
          <ListEntry key={i} payload={payload} 
            backgroundColor={i%2 ? '#000' : '#333'} 
          />
        ))
      }
    </div>
  );
};

export default ListPage;

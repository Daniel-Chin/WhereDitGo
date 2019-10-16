import React from 'react';
import { CURRENCY_SYMBOL } from '../helpers/misc';

const ListEntry = ({ payload, backgroundColor, tagbase }) => {
  const { amount, currency_type, tags, comment } = payload;
  const style = {
    backgroundColor, 
  };
  return (
    <div className='ListEntry' style={style}>
      <div className='EntryLeft'>
        <div className="tags">
          <div>
            {tags.map((tag, i) => (
              <span className="TagSpan" key={i}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="comment">
          {comment}
        </div>
      </div>
      <div className='EntryRight'>
        <div>{CURRENCY_SYMBOL[currency_type]} {amount}</div>
      </div>
    </div>
  );
};

export default ListEntry;

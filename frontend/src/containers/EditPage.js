// new=false
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PORT, DEFAULT_CURRENCY } from '../helpers/misc';
import { recommendTags, newTag, updateCorrelation } from '../helpers/tags';
import AmountBar   from '../components/EditPage/AmountBar';
import TagsCard    from '../components/EditPage/TagsCard';
import TimeBar     from '../components/EditPage/TimeBar';
import CommentBar  from '../components/EditPage/CommentBar';
import Calculator  from '../components/EditPage/Calculator';
import AskSaveCard from '../components/AskSaveCard';
import axios from 'axios';

const EditPage = ({
  tagbase, setTagbase, save_dialog, setSave_dialog, 
  markExpensebaseDirty, 
}) => {
  const params = useParams();
  if (params.id) {
    if (params.new !== 'false') throw new Error('param mismatch');
    params.new = false;
  } else {
    if (params.new !== 'true') throw new Error('param mismatch');
    params.new = true;
  }
  let original_tags = [];

  const [math, setMath] = useState({
    first: '0', 
    operator: null, 
  });
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [show_tags, setShow_tags] = useState([]);
  const [active_tags, setActive_tags] = useState([]);
  const [time, setTime] = useState(+ new Date());
  const [comment, setComment] = useState('');
  const [keyboard_up, setKeyboard_up] = useState(false);

  if (! params.new) {
    axios.get(`http://localhost:${PORT}/get`, {
      params: {
        whichdb: 'expense', 
        id: params.id, 
      }
    }).then(({ data }) => {
      const { amount, currency_type, tags, comment } = data.payload;
      setMath({
        first: amount.toString(), 
        operator: null, 
      });
      setCurrency(currency_type);
      setActive_tags(tags);
      setComment(comment);
      original_tags.push(...tags);
    });
  }

  useEffect(() => {
    if (tagbase !== null) {
      recommendTags(tagbase, active_tags, math, currency)
        .then(setShow_tags);
    } else {
      setShow_tags([]);
    }
  }, [tagbase, active_tags, math, currency, setShow_tags]);

  const read_only = save_dialog === 'ask';

  const pickle = () => (
    {
      amount: parseFloat('0' + math.first), 
      currency_type: currency, 
      tags: active_tags.map(({ id }) => (id)), 
      comment, 
    }
  );

  const save = async function () {
    const pickled = pickle();
    // amount tag
    const amount_tag_id = pickled.amount.toString() + ' ' + currency;
    let amount_tag = tagbase.get(amount_tag_id);
    if (amount_tag === undefined) {
      amount_tag = await newTag({
        type: 'amount', 
        id: amount_tag, 
      });
    }
    const tags = [...active_tags, amount_tag];
    pickled.tags.push(amount_tag_id);

    // Submit changes
    axios.post(`http://localhost:${PORT}/${
      params.new ? 'add' : 'modify'
    }`, {
      whichdb: 'expense',
      entry: pickled, 
      id: params.id, 
    }).then(markExpensebaseDirty);

    updateCorrelation(original_tags, tags).then(() => {
      setTagbase(null);
    });
  };

  return (
    <div>
      <AmountBar 
        math={math} currency={currency} 
        setCurrency={setCurrency} read_only={read_only} 
      />
      <TagsCard 
        show_tags={show_tags} active_tags={active_tags} 
        setActive_tags={setActive_tags} read_only={read_only}
      />
      <TimeBar 
        time={time} setTime={setTime} read_only={read_only}
      />
      <CommentBar 
        comment={comment} setComment={setComment} 
        read_only={read_only} setKeyboard_up={setKeyboard_up}
      />
      {!read_only && !keyboard_up &&
        <Calculator math={math} setMath={setMath} />
      }
      {read_only &&
        <AskSaveCard 
          setSave_dialog={setSave_dialog} 
          save={save} 
          link_to='/list' 
        />
      }
    </div>
  );
};

export default EditPage;

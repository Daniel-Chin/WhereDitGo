import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import WithFooter from './containers/WithFooter';
import EntryPage from './containers/EntryPage';
import EditPage from './containers/EditPage';
import TagPage from './containers/TagPage';
import EditTagPage from './containers/EditTagPage';

const App = () => {
  const [needGetAll, setNeedGetAll] = useState(true);
  const [database, setDatabase] = useState(null);
  const [tagbase, setTagbase] = useState(null);
  
  useEffect(() => {
    if (needGetAll) {
      axios.get('http://localhost:2344/BACKENDgetAll')
      .then((response) => {
        response.data.forEach((entry) => {
          entry.payload = JSON.parse(entry.payload);
        })
        setDatabase(response.data);
        setNeedGetAll(false);
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }, [needGetAll, setDatabase, setNeedGetAll]);

  useEffect(() => {
    if (! database) return;
    const tags = new Map();
    const getTag = (name) => {
      if (tags.has(name)) {
        return tags.get(name);
      } else {
        const new_tag = {
          explanation: null, 
          correlations: new Map(), 
          amounts: new Map(), 
        };
        tags.set(name, new_tag);
        return new_tag;
      }
    }
    database.forEach((entry) => {
      if (entry.payload.type === 'tag') {
        const { tag_name, explanation } = entry.payload;
        const tag_0 = getTag(tag_name);
        tag_0.explanation = explanation;
      } else if (entry.payload.type === 'expense') {
        const tag_names = entry.payload.tags;
        tag_names.forEach((name) => {
          const tag_1 = getTag(name);
          const old_amount = tag_1.amounts.get(entry.payload.amount) || 0;
          tag_1.amounts.set(entry.payload.amount, old_amount + 1);
          tag_names.forEach((other_name) => {
            if (other_name !== name) {
              const old = tag_1.correlations.get(other_name) || 0;
              tag_1.correlations.set(other_name, old + 1)
            }
          });
        });
      } else {
        throw new Error(`Illegal payload type "${entry.payload.type}"`);
      }
    });
    setTagbase(tags);
  }, [database, setTagbase]);

  return (
    <Switch>
      <Route exact path='/list'>
        <WithFooter database={database} tagbase={tagbase} />
      </Route>
      <Route exact path='/tags'>
        <WithFooter database={database} tagbase={tagbase} />
      </Route>
      <Route exact path='/analysis'>
        <WithFooter database={database} tagbase={tagbase} />
      </Route>
      <Route exact path='/menu'>
        <WithFooter database={database} tagbase={tagbase} />
      </Route>
      <Route exact path='/entry'>
        <EntryPage database={database} tagbase={tagbase} />
      </Route>
      <Route exact path='/edit'>
        <EditPage database={database} tagbase={tagbase} 
          setNeedGetAll={setNeedGetAll} 
        />
      </Route>
      <Route exact path='/tag'>
        <TagPage tagbase={tagbase} />
      </Route>
      <Route exact path='/editTag'>
        <EditTagPage database={database} tagbase={tagbase} 
          setNeedGetAll={setNeedGetAll} 
        />
      </Route>
    </Switch>
  );
}

export default App;

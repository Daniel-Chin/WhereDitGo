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
    const getTag = (token) => {
      if (tags.has(token)) {
        return tags.get(token);
      } else {
        const new_tag = {
          name: null, 
          explanation: null, 
          correlations: new Map(), 
        };
        tags.set(token, new_tag);
        return new_tag;
      }
    }
    database.forEach((entry) => {
      entry.payload = JSON.parse(entry.payload);
      if (entry.payload.type === 'tag') {
        const { tag_token, tag_name, explanation } = entry.payload;
        const tag_0 = getTag(tag_token);
        tag_0.name = tag_name;
        tag_0.explanation = explanation;
      } else if (entry.payload.type === 'expense') {
        const tag_tokens = entry.payload.tags;
        tag_tokens.forEach((token) => {
          const tag_1 = getTag(token);
          tag_tokens.forEach((token_other) => {
            if (token_other !== token) {
              const old = tag_1.correlations.get(token_other) || 0;
              tag_1.correlations.set(token_other, old + 1)
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
        <EntryPage database={database} />
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

import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import WithFooter from './containers/WithFooter';
import EntryPage from './containers/EntryPage';
import EditPage from './containers/EditPage';
import TagPage from './containers/TagPage';
import EditTagPage from './containers/EditTagPage';
import AskSaveContext from './containers/AskSaveContext';
import { getAllTags } from './helpers/tags';

const App = () => {
  const [tagbase, setTagbase] = useState(null);
  const [expensebase_version, setExpensebase_version] = useState(0);
  const markExpensebaseDirty = () => {
    setExpensebase_version(expensebase_version + 1);
  };
  
  useEffect(() => {
    if (tagbase === null) {
      getAllTags().then((allTags) => {
        setTagbase(allTags);
      });
    }
  }, [tagbase, setTagbase]);

  return (
    <Switch>
      <Route exact path='/list'>
        <WithFooter 
          tagbase={tagbase} setTagbase={setTagbase} 
          markExpensebaseDirty={markExpensebaseDirty}
        />
      </Route>
      <Route exact path='/tags'>
        <WithFooter tagbase={tagbase} />
      </Route>
      <Route exact path='/analysis'>
        <WithFooter tagbase={tagbase} />
      </Route>
      <Route exact path='/menu'>
        <WithFooter tagbase={tagbase} />
      </Route>
      <Route exact path='/entry'>
        <EntryPage tagbase={tagbase} />
      </Route>
      <Route exact path='/edit/:new?/:id?'>
        <AskSaveContext 
          Child={EditPage} child_props={{
            tagbase, 
            setTagbase, 
            markExpensebaseDirty, 
          }}
        />
      </Route>
      <Route exact path='/tag'>
        <TagPage tagbase={tagbase} />
      </Route>
      <Route exact path='/editTag'>
        <EditTagPage 
          tagbase={tagbase} setTagbase={setTagbase} 
          markExpensebaseDirty={markExpensebaseDirty}
        />
      </Route>
      <Route exact path='/'>
        <Redirect to='/edit?new=true' />
      </Route>
    </Switch>
  );
}

export default App;

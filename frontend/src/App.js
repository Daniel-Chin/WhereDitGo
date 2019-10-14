import React from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';
import WithFooter from './containers/WithFooter';
import EntryPage from './containers/EntryPage';
import EditPage from './containers/EditPage';
import TagPage from './containers/TagPage';

const App = () => {
  return (
    <Switch>
      <Route exact path='/list' component={WithFooter} />
      <Route exact path='/tags' component={WithFooter} />
      <Route exact path='/analysis' component={WithFooter} />
      <Route exact path='/menu' component={WithFooter} />
      <Route exact path='/entry' component={EntryPage} />
      <Route exact path='/edit' component={EditPage} />
      <Route exact path='/tag' component={TagPage} />
    </Switch>
  );
}

export default App;

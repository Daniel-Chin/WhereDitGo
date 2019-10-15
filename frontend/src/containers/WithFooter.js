import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ListPage from './ListPage';
import TagsPage from './TagsPage';
import AnalysisPage from './AnalysisPage';
import MenuPage from './MenuPage';
import Footer from '../components/Footer';

const WithFooter = ({ database, tagbase }) => {
  return (
    <div>
      <div className="AboveFooter">
        <Switch>
          <Route exact path='/list'>
            <ListPage database={database} />
          </Route>
          <Route exact path='/tags'>
            <TagsPage database={database} tagbase={tagbase} />
          </Route>
          <Route exact path='/analysis'>
            <AnalysisPage database={database} tagbase={tagbase} />
          </Route>
          <Route exact path='/menu'>
            <MenuPage />
          </Route>
        </Switch>
      </div>
      <Footer />
    </div>
  );
};

export default WithFooter;

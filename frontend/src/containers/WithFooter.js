import React from 'react';
import { Switch, Route } from 'react-router-dom';
import ListPage from './ListPage';
import TagsPage from './TagsPage';
import AnalysisPage from './AnalysisPage';
import MenuPage from './MenuPage';
import Footer from '../components/Footer';

const WithFooter = () => {
  return (
    <div>
      <div className="AboveFooter">
        <Switch>
          <Route exact path='/list' component={ListPage} />
          <Route exact path='/tags' component={TagsPage} />
          <Route exact path='/analysis' component={AnalysisPage} />
          <Route exact path='/menu' component={MenuPage} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
};

export default WithFooter;

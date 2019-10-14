import React, {useState} from 'react';
import { Switch, Route } from 'react-router-dom';
import './App.css';

const App = (props) => {
  return (
    <>
    <Switch>
      <Route exact path='/' component={C1} />
      )}/>
    </Switch>
    <a href='a'>a</a>
    <a href='/'>b</a>
    </>
  );
}

const C1 = () => {
  const [s, setS] = useState(0);
  return (
    <div>
      <button onClick={()=>{setS(4);}}>{s}</button>
    </div>
  );
}

export default App;

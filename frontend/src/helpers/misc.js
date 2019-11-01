import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const CURRENCY_SYMBOL = {
  dollar: '$', 
};

const PORT = 2344;
const DEFAULT_CURRENCY = 'dollar';

export {
  CURRENCY_SYMBOL, 
  history, 
  PORT, 
  DEFAULT_CURRENCY, 
};

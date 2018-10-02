import axios from 'axios';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import './index.css';

axios.defaults.baseURL = 'https://nr.lyscnd.com/';

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);

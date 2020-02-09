import React from 'react';
import {YellowBox} from 'react-native';

import Routes from './routes';

YellowBox.ignoreWarnings(['WebSocket']);

const App: () => React$Node = () => {
  return (
    <>
      <Routes />
    </>
  );
};

export default App;

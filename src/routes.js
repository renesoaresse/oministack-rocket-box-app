import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import Box from './screens/Box';
import Main from './screens/Main';

export default createAppContainer(
  createSwitchNavigator({
    Main,
    Box,
  }),
);

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from './src/screens/HomeScreen';
import {NfcCardDetailsScreen} from './src/screens/NfcCardDetailsScreen';
import {NfcCard} from './src/models/NfcCard';

export type RootStackParamList = {
  Home: undefined;
  CardDetails: {card: NfcCard};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CardDetails"
          component={NfcCardDetailsScreen}
          options={{title: 'Card Details'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

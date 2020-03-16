import 'react-native-gesture-handler';

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Login from './src/Login';
import HomeScreen from './src/HomeScreen';
import SignUp from './src/SignUp';
import EnterMealDailyInput from './src/EnterMealDailyInput';
import EnterCharacteristics from './src/EnterCharacteristics';
import HealthProfile from './src/HealthProfile';
import ExerciseInput from './src/ExerciseInput';
import ChangePass from './src/ChangePass';
import SetGoal from './src/SetGoal';

const Stack = createStackNavigator();

function App() {
  console.disableYellowBox = true;
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} headerShown="false" />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          headerShown={'false'}
        />
        <Stack.Screen name="SignUp" component={SignUp} headerShown="false" />
        <Stack.Screen
          name="MealInput"
          component={EnterMealDailyInput}
          headerShown={'false'}
        />
        <Stack.Screen
          name="EnterCharacteristics"
          component={EnterCharacteristics}
          headerShown={'false'}
        />
        <Stack.Screen
          name="HealthProfile"
          component={HealthProfile}
          headerShown={'false'}
        />

        <Stack.Screen
          name="ExerciseInput"
          component={ExerciseInput}
          headerShown={'false'}
        />
        <Stack.Screen
          name="ChangePass"
          component={ChangePass}
          headerShown={'false'}
        />
        <Stack.Screen
          name="SetGoal"
          component={SetGoal}
          headerShown={'false'}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

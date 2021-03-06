import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  Switch,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import React from 'react';
import {Dropdown} from 'react-native-material-dropdown';
import URL from './url';

// TODO: In android, toggle switch to change units overlaps with sex dropdown

let {screenHeight, screenWidth} = Dimensions.get('window');

export default class EnterCharacteristics extends React.Component {
  state = {
    switchValue: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      height: '', //stored in cm
      weight: '', //stored in kg
      age: '',
      sex: '',
      feet: '',
      inches: '',
      lifestyle: '',
    };
  }

  isInvalid(str) {
    return /[-,_]/g.test(str);
  }

  isAgeInvalid(str) {
    return /[-,_.]/g.test(str);
  }

  addCharacteristics = () => {
    const {route} = this.props;
    let {height, weight, age, sex, feet, inches, lifestyle} = this.state;
    const {userId} = route.params;
    console.log('id: ' + userId);

    if (this.state.switchValue) {
      //imperial
      height = (parseFloat(feet * 12) + parseFloat(inches)) * 2.54;
      weight = parseFloat(weight) * 0.453592;
    }
    if (!height) {
      Alert.alert('Height Empty', 'Please enter your height.', [{text: 'OK'}]);
      return;
    }
    if (!weight) {
      Alert.alert('Weight Empty', 'Please enter your weight.', [{text: 'OK'}]);
      return;
    }
    if (!age) {
      Alert.alert('Age Empty', 'Please enter your age.', [{text: 'OK'}]);
      return;
    }
    if (!sex) {
      Alert.alert('Sex Field empty', 'Please enter your sex.', [{text: 'OK'}]);
      return;
    }
    if (!lifestyle) {
      Alert.alert('Lifestyle Field empty', 'Please enter your lifestyle.', [{text: 'OK'}]);
      return;
    }
    if (height <= 0 || this.isInvalid(height)) {
      Alert.alert('Invalid height', 'Please enter a valid height.', [
        {text: 'OK'},
      ]);
      return;
    }
    if (weight <= 0 || this.isInvalid(weight)) {
      Alert.alert('Invalid weight', 'Please enter a valid weight.', [
        {text: 'OK'},
      ]);
      return;
    }
    if (age <= 0 || this.isAgeInvalid(age)) {
      Alert.alert('Invalid age', 'Please enter a valid age.', [{text: 'OK'}]);
      return;
    }
    //sending request to retrieve the corresponding user object for login
    fetch(
      Platform.OS === 'android'
        ? `${URL.android}/User/addCharacteristics?userId=${userId}&height=${height}&weight=${weight}&age=${age}&sex=${sex}&isMetric=${!this.state.switchValue}`
        : `${URL.ios}/User/addCharacteristics?userId=${userId}&height=${height}&weight=${weight}&age=${age}&sex=${sex}&isMetric=${!this.state.switchValue}`,
    )
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.error) {
          //throwing error when addCharacteristics fails (invalid userId)
          if (
            data.message ===
            'There was an error locating your account, please try signing up again'
          ) {
            Alert.alert('User Not Found', data.message, [{text: 'OK'}]);
          }
        } else {
          //going to home screen
          this.props.navigation.replace('EnterDietaryRestrictions', {
            userId: userId,
          });
        }
      });
  };

  toggleSwitch = value => {
    this.setState({switchValue: value});
  };

  renderHeight() {
    if (!this.state.switchValue) {
      return (
        <View style={styles.flexRowContainer}>
          <TextInput
            onChangeText={height => this.setState({height})}
            placeholder={'Enter Height'}
            keyboardType={'numeric'}
            autoCorrect={false}
            returnKeyType="done"
            style={styles.input}
          />
          <Text>{this.state.switchValue ? ' inch' : ' cm'}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.flexRowContainer}>
          <TextInput
            onChangeText={feet => this.setState({feet})}
            placeholder={'Enter feet'}
            keyboardType={'numeric'}
            autoCorrect={false}
            returnKeyType="done"
            style={styles.smallInput}
          />
          <Text>{' feet '}</Text>
          <TextInput
            onChangeText={inches => this.setState({inches})}
            placeholder={'Enter inches'}
            keyboardType={'numeric'}
            autoCorrect={false}
            returnKeyType="done"
            style={styles.smallInput}
          />
          <Text>{' inches'}</Text>
        </View>
      );
    }
  }

  render() {
    return (
      <View style={styles.fullContainer}>
        <Text style={styles.paragraph}>
          Bamboo does ...
          {'\n'}...
          {'\n'}...
        </Text>

        <View style={styles.flexRowContainer}>{this.renderHeight()}</View>
        <View style={{padding: '2%'}} />
        <View style={styles.flexRowContainer}>
          <TextInput
            onChangeText={weight => this.setState({weight})}
            placeholder={'Enter Weight'}
            keyboardType={'numeric'}
            autoCorrect={false}
            returnKeyType="done"
            style={styles.input}
          />
          <Text>{this.state.switchValue ? ' lb' : ' kg'}</Text>
        </View>
        <View style={{padding: '2%'}} />

        <View style={styles.flexRowContainer}>
          <TextInput
            onChangeText={age => this.setState({age})}
            placeholder={'Enter Age'}
            keyboardType={'numeric'}
            autoCorrect={false}
            returnKeyType="done"
            style={styles.input}
          />
          <Text> years</Text>
        </View>

        <View style={{flex: 0.3, width: '50%'}}>
          <Dropdown
            selectedItemColor="#3eb245"
            label="Sex"
            data={[{value: 'Female'}, {value: 'Male'}, {value: 'Other'}]}
            onChangeText={value => {
              this.setState({sex: value});
            }}
          />
        </View>
        <View style={{flex: 0.3, width: '50%'}}>
          <Dropdown
            selectedItemColor="#3eb245"
            label="Lifestyle"
            data={[
              {value: 'Sedentary'},
              {value: 'Low Active'},
              {value: 'Moderately Active'},
              {value: 'Extremely Active'},
            ]}
            onChangeText={value => {
              this.setState({lifestyle: value});
            }}
          />
        </View>

        <Text>{this.state.switchValue ? 'Imperial' : 'Metric'}</Text>
        <Switch
          style={styles.switch}
          onValueChange={this.toggleSwitch}
          value={this.state.switchValue}
        />
        <View style={{padding: '5%'}} />
        <TouchableOpacity
          onPress={this.addCharacteristics}
          style={styles.btnStyle}>
          <Text>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: '10%',
    textAlign: 'center',
    alignItems: 'center',
  },
  flexRowContainer: {
    width: '80%',
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  btnStyle: {
    backgroundColor: '#3eb245',
    color: 'black',
    borderRadius: 2,
    borderColor: '#3eb245',
    width: '75%',
    height: '7%',
    justifyContent: 'center', //text in the middle of the button
    alignItems: 'center', //text in the middle of the button
  },
  input: {
    width: '80%',
    //height: screenHeight * 0.05,
    marginBottom: 10,
    borderBottomWidth: 1,
    backgroundColor: '#ecf0f1',
    textAlign: 'center',
  },
  smallInput: {
    width: '50%',
    //height: screenHeight * 0.05,
    marginBottom: 10,
    borderBottomWidth: 1,
    backgroundColor: '#ecf0f1',
    textAlign: 'center',
  },
  switch: {
    textAlign: 'center',
    justifyContent: 'center',
  },
});

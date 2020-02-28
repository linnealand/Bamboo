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

let {screenHeight, screenWidth} = Dimensions.get('window');

export default class EnterCharacteristics extends React.Component {
  state = {
    switchValue: false,
  };
  constructor(props) {
    super(props);
    this.state = {
      userEmail: '',
      height: '', //stored in cm
      weight: '', //stored in kg
      age: '',
      sex: '',
      feet: '',
      inches: '',
    };
  }

  addCharacteristics = () => {
    const {route} = this.props;
    const {email} = route.params;
    let {height, weight, age, sex, feet, inches} = this.state;
    if (!height && feet && inches) {
      height = (feet * 12 + inches) * 2.54;
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
    if (height <= 0) {
      Alert.alert('Invalid height', 'Please enter a valid height.', [
        {text: 'OK'},
      ]);
      return;
    }
    if (weight <= 0) {
      Alert.alert('Invalid weight', 'Please enter a valid weight.', [
        {text: 'OK'},
      ]);
      return;
    }
    if (age <= 0) {
      Alert.alert('Invalid age', 'Please enter a valid age.', [{text: 'OK'}]);
      return;
    }
    //sending request to retrieve the corresponding user object for login
    fetch(
      Platform.OS === 'android'
        ? `http://10.0.2.2:8080/User/addCharacteristics?email=${JSON.stringify(
            email,
          )}&height=${height}&weight=${weight}&age=${age}&sex=${sex}`
        : `http://localhost:8080/User/addCharacteristics?email=${JSON.stringify(
            email,
          )}&height=${height}&weight=${weight}&age=${age}&sex=${sex}`,
    )
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.error) {
          //throwing error when addCharacteristics fails (invalid email)
          if (
            data.message ===
            'There was an error locating your account, please try signing up again'
          ) {
            Alert.alert('User Not Found', data.message, [{text: 'OK'}]);
          }
        } else {
          //going to home screen
          this.props.navigation.replace('HomeScreen', {
            email: email,
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

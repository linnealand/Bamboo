import React, {Component} from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Switch,
} from 'react-native';
import BUTTONS from './styles/buttons';
import URL from './url';

// TODO:
// 1. put user's name in header
// 2. validate inputs, display errors
// 3. display correct units

export default class HealthProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: '', //stored in cm
      weight: '', //stored in kg
      age: '',
      sex: '',
      feet: '',
      inches: '',
      isMetric: '',
      weightLb: '',
      buttonValue: 'Edit',
      editable: false,
      inputStyle: styles.text,
    };
  }
  UNSAFE_componentWillMount(): void {
    const {route} = this.props;
    const {userId} = route.params;
    fetch(
      Platform.OS === 'android'
        ? `${URL.android}/User/getCharacteristics?userId=${userId}`
        : `${URL.ios}/User/getCharacteristics?userId=${userId}`,
    )
      .then(res => res.json())
      .then(data => {
        this.setState({
          height: data.height.toString(),
          weight: data.weight.toString(),
          age: data.age.toString(),
          sex: data.sex,
          isMetric: data.metric,
        });
        let weightLb = (data.weight * 2.20462).toString();
        this.setState({weighLb: weightLb});
        this.calculateFeetInches();
      });
  }

  calculateFeetInches() {
    let feet = Math.floor(this.state.height / 30.48);
    let inches =
      (this.state.height / 30.48 - Math.floor(this.state.height / 30.48)) * 12;
    this.setState({feet: feet.toString()});
    this.setState({inches: inches.toString()});
  }

  isInvalid(str) {
    return /[-,_]/g.test(str);
  }

  isAgeInvalid(str) {
    return /[-,_.]/g.test(str);
  }

  toggleSwitch = value => {
    this.setState({isMetric: value});
  };

  onSave = () => {
    let {height, weight, age, sex, feet, inches, isMetric} = this.state;
    const {route} = this.props;
    const {userId} = route.params;
    if (!height && feet && inches) {
      height = (feet * 12 + inches) * 2.54;
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
    if (!isMetric) {
      height = (parseFloat(feet * 12) + parseFloat(inches)) * 2.54;
      weight = parseFloat(weight) * 0.453592;
    }
    fetch(
      Platform.OS === 'android'
        ? `${URL.android}/User/addCharacteristics?userId=${userId}&height=${height}&weight=${weight}&age=${age}&sex=${sex}&isMetric=${isMetric}`
        : `${URL.ios}/User/addCharacteristics?userId=${userId}&height=${height}&weight=${weight}&age=${age}&sex=${sex}&isMetric=${isMetric}`,
    )
      .then(res => res.json())
      .then(data => {
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
        }
      });
  };

  onPress = () => {
    if (this.state.buttonValue === 'Edit') {
      this.setState({
        buttonValue: 'Save',
        editable: true,
        inputStyle: styles.textEdit,
      });
    } else {
      this.onSave();
      this.setState({
        buttonValue: 'Edit',
        editable: false,
        inputStyle: styles.text,
      });
    }
  };

  renderHeight() {
    if (this.state.isMetric) {
      return (
        <View style={styles.inputContainer}>
          <Text style={[styles.text, {padding: 2}]}>Height:</Text>
          <TextInput
            onChangeText={height => this.setState({height})}
            keyboardType={'numeric'}
            style={[
              styles.textInput,
              this.state.inputStyle,
              styles.text,
              {width: 80},
            ]}
            defaultValue={this.state.height}
            value={this.state.height}
            placeholderTextColor="#000000"
            editable={this.state.editable}
            maxLength={20}
          />
          <Text style={[styles.text, {padding: 2}]}>cm</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.inputContainer}>
          <Text style={[styles.text, {padding: 2}]}>Height:</Text>
          <TextInput
            onChangeText={feet => this.setState({feet})}
            keyboardType={'numeric'}
            style={[
              styles.textInput,
              this.state.inputStyle,
              styles.text,
              {width: 40},
            ]}
            defaultValue={this.state.feet}
            value={this.state.feet}
            placeholderTextColor="#000000"
            editable={this.state.editable}
            maxLength={20}
          />
          <Text style={{fontSize: 20, padding: 2, paddingRight: '2%'}}>
            feet
          </Text>
          <TextInput
            onChangeText={inches => this.setState({inches})}
            keyboardType={'numeric'}
            style={[
              styles.textInput,
              this.state.inputStyle,
              styles.text,
              {width: 40},
            ]}
            defaultValue={this.state.inches}
            value={this.state.inches}
            placeholderTextColor="#000000"
            editable={this.state.editable}
            maxLength={20}
          />
          <Text style={[styles.text, {padding: 2}]}>inch</Text>
        </View>
      );
    }
  }


  render() {
    let {height, weight, age, sex, feet, inches, isMetric} = this.state;
    const {route} = this.props;
    const {userId} = route.params;
    fetch(
      Platform.OS === 'android'
        ? `${URL.android}/User/getCharacteristics?userId=${userId}`
        : `${URL.ios}/User/getCharacteristics?userId=${userId}`,
    )
      .then(res => res.json())
      .then(data => {});
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/*<Text style={styles.header}>[Name]'s Health Profile</Text>*/}
          <ScrollView>
            <View>{this.renderHeight()}</View>
            <View style={styles.inputContainer}>
              <Text style={[styles.text, {padding: 2}]}>Weight:</Text>
              <TextInput
                onChangeText={weight => {
                  this.setState({weight});
                  this.setState({weightLb: (weight * 2.20462).toString()});
                }}
                keyboardType={'numeric'}
                style={[
                  styles.textInput,
                  this.state.inputStyle,
                  styles.text,
                  {width: 80},
                ]}
                defaultValue={isMetric ?  this.state.weight : this.state.weighLb}
                placeholderTextColor="#000000"
                editable={this.state.editable}
                maxLength={20}
              />
              <Text style={[styles.text, {padding: 2}]}>{isMetric ? 'kg' : 'lb'}</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.text, {padding: 2}]}>Age:</Text>
              <TextInput
                onChangeText={age => this.setState({age})}
                keyboardType={'numeric'}
                style={[
                  styles.textInput,
                  this.state.inputStyle,
                  styles.text,
                  {width: 80},
                ]}
                defaultValue={age}
                placeholderTextColor="#000000"
                editable={this.state.editable}
                maxLength={20}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.text, {padding: 2}]}>Sex:</Text>
              <TextInput
                onChangeText={sex => this.setState({sex})}
                style={[
                  styles.textInput,
                  this.state.inputStyle,
                  styles.text,
                  {width: 80},
                ]}
                defaultValue={sex}
                placeholderTextColor="#000000"
                editable={this.state.editable}
                maxLength={20}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={[styles.text, {padding: 2}]}>
                {this.state.isMetric ? 'Metric' : 'Imperial'}
              </Text>
              <Switch
                style={styles.switch}
                onValueChange={this.toggleSwitch}
                value={this.state.isMetric}
              />
            </View>
          </ScrollView>
        </View>
        <TouchableOpacity style={BUTTONS.primaryButton} onPress={this.onPress}>
          <Text style={BUTTONS.primaryButtonText}>
            {this.state.buttonValue}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    fontSize: 25,
    textAlign: 'center',
    margin: 10,
    fontWeight: 'bold',
  },
  textEdit: {
    borderBottomWidth: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    // alignSelf: 'center',
    paddingTop: 35,
    paddingLeft: '20%',
  },
  text: {
    fontSize: 20,
    width: 100,
  },
  switch: {
    textAlign: 'center',
    justifyContent: 'center',
  },
});

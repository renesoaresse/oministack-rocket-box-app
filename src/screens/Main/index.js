import React, {Component} from 'react';
import {View, Text, Image, TouchableOpacity, TextInput} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import api from '../../services/api';

import styles from './styles';
import logo from '../../assets/logo.png';

export default class Main extends Component {
  state = {
    newBox: '',
  };

  async componentDidMount() {
    const box = await AsyncStorage.getItem('@RocketBox:id');

    if (box) {
      this.props.navigation.navigate('Box');
    }
  }

  handleSubmit = async () => {
    const response = await api.post('/boxes', {
      title: this.state.newBox,
    });

    if (!response.data) {
      return;
    }

    await AsyncStorage.setItem('@RocketBox:id', response.data._id);

    this.props.navigation.navigate('Box');
  };

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={logo} />
        <TextInput
          style={styles.input}
          placeholder="Crie um box"
          placeholderTextColor="#999999"
          autoCapitalize="none"
          autoCorrect={false}
          underlineColorAndroid="transparent"
          value={this.state.newBox}
          onChangeText={text => this.setState({newBox: text})}
        />
        <TouchableOpacity onPress={this.handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Criar</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
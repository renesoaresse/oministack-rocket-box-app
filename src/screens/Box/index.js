import React, {Component} from 'react';

import {View, Text, FlatList, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
Icon.loadFont();

import {formatDistance} from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import socket from 'socket.io-client';

import api from '../../services/api';
import styles from './styles';

export default class Box extends Component {
  state = {
    box: {},
  };

  async componentDidMount() {
    const id = await AsyncStorage.getItem('@RocketBox:id');
    this.subscribeToNewFiles(id);

    const response = await api.get(`boxes/${id}`);

    if (!response.data) {
      return;
    }

    this.setState({box: response.data});
  }

  subscribeToNewFiles = id => {
    const io = socket('http://localhost:3300');

    io.emit('connectRoom', id);

    io.on('file', data => {
      this.setState({
        box: {...this.state.box, files: [data, ...this.state.box.files]},
      });
    });
  };

  handleUpload = () => {
    ImagePicker.launchImageLibrary({}, async upload => {
      if (upload.error || upload.didCancel) {
        console.log('Action');
      } else {
        const data = new FormData();
        const [prefix, sufix] = upload.fileName
          ? upload.fileName.split('.')
          : `IMG_${upload.width}.jpg`.split('.');

        const ext = sufix.toLowerCase() === 'heic' ? 'jpg' : sufix;

        data.append('file', {
          uri: upload.uri,
          type: upload.type,
          name: `${prefix}.${ext}`,
        });

        api.post(`boxes/${this.state.box._id}/files`, data);
      }
    });
  };

  openFile = async ({url, title}) => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${title}`;
      await RNFS.downloadFile({
        fromUrl: url,
        toFile: filePath,
      });

      await FileViewer.open(filePath);
    } catch (error) {
      console.log('Error -> ', error);
    }
  };

  dataFile = ({item}) => (
    <TouchableOpacity onPress={() => this.openFile(item)} style={styles.file}>
      <View style={styles.fileInfo}>
        <Icon name="insert-drive-file" size={24} color="#A5CFFF" />
        <Text style={styles.fileTitle}>{item.title}</Text>
      </View>

      <Text style={styles.fileDate}>
        há{' '}
        {formatDistance(new Date(item.createdAt), new Date(), {
          locale: pt,
        })}
      </Text>
    </TouchableOpacity>
  );

  render() {
    const {title, files} = this.state.box;

    return (
      <View style={styles.container}>
        <Text style={styles.boxTitle}>{title}</Text>
        <FlatList
          style={styles.list}
          data={files}
          keyExtractor={file => `${file._id}`}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={this.dataFile}
        />

        <TouchableOpacity onPress={this.handleUpload} style={styles.fab}>
          <Icon size={24} name="cloud-upload" color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  }
}

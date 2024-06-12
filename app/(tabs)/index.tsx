import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

interface SongData {
  imgPath: string; // Store the file path for desktop
  imgUrl: string; // Store the URL for web
  name: string;
  composer: string;
  bpm: string;
}

export default function index() {
  const [songData, setSongData] = useState<SongData>({
    imgPath: "",
    imgUrl: "",
    name: "",
    composer: "",
    bpm: "",
  });

  useEffect(() => {
    // Load data from JSON on mount (and on every re-render)
    const loadSongData = async () => {
      try {
        const jsonString = await FileSystem.readAsStringAsync("song_data.json");
        const data: SongData[] = JSON.parse(jsonString);
        if (data.length > 0) {
          setSongData(data[0]);
        }
      } catch (error) {
        console.error("Error loading JSON:", error);
      }
    };
    loadSongData();
  }, [songData]); // Add songData as dependency

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (Platform.OS === "web") {
        setSongData({ ...songData, imgUrl: result.assets[0].uri });
      } else {
        setSongData({ ...songData, imgPath: result.assets[0].uri });
      }
    }
  };

  const handleChange = (name: keyof SongData, value: string) => {
    setSongData({ ...songData, [name]: value });
  };

  const generateJSON = async () => {
    try {
      // Adjust imgUrl or imgPath based on platform
      const dataToSave =
        Platform.OS === "web" ? { ...songData, imgPath: "" } : songData;
      const jsonString = JSON.stringify(dataToSave, null, 2);

      // Save to file for both web and desktop
      await FileSystem.writeAsStringAsync("song_data.json", jsonString);

      // If on desktop, also send to Electron main process for native save dialog
      if (window.electronAPI) {
        window.electronAPI.saveJSON(jsonString);
      }
    } catch (error) {
      console.error("Error saving JSON:", error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1, // Allow content to take up available space
      padding: 20,
      backgroundColor: "#f4f4f4",
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      marginBottom: 5,
      fontWeight: "bold",
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
    },
    image: {
      width: 200,
      height: 200,
      resizeMode: "contain",
      marginBottom: 20,
      borderRadius: 10,
    },
    button: {
      backgroundColor: "#007bff",
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      color: "white",
      fontWeight: "bold",
      textAlign: "center",
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button
        title="Pick an image from camera roll"
        onPress={pickImage}
        color="#007bff"
      />
      {songData.imgUrl ? (
        <Image
          source={{ uri: songData.imgUrl }}
          style={styles.image}
          onError={() => setSongData({ ...songData, imgUrl: "" })}
        />
      ) : null}
      {songData.imgPath ? (
        <Image source={{ uri: songData.imgPath }} style={styles.image} /> // For desktop
      ) : null}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Song Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Song Name"
          onChangeText={(text) => handleChange("name", text)}
          value={songData.name}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Composer:</Text>
        <TextInput
          style={styles.input}
          placeholder="Composer"
          onChangeText={(text) => handleChange("composer", text)}
          value={songData.composer}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>BPM:</Text>
        <TextInput
          style={styles.input}
          placeholder="BPM"
          onChangeText={(text) => handleChange("bpm", text)}
          value={songData.bpm}
          keyboardType="numeric"
        />
      </View>

      <Button title="Generate JSON" onPress={generateJSON} color="#007bff" />
    </ScrollView>
  );
}

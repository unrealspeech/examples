import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

function blobToDataURI(blob: Blob) {
  // Create a new FileReader
  const reader = new FileReader();

  // Return a promise to handle the load event
  return new Promise((resolve, reject) => {
    reader.onloadend = function () {
      // Resolve the promise with the Data URI
      resolve(reader.result);
    };

    reader.onerror = function () {
      // Reject the promise on error
      reject(reader.error);
    };

    // Read the blob as a data URL
    reader.readAsDataURL(blob);
  });
}

export default function App() {
  const [sound, setSound] = useState<Audio.Sound>();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [playing, setPlaying] = useState(false);

  const pauseSound = async () => {
    if (sound) {
      setPlaying(false);
      await sound.pauseAsync();
    }
  };

  const replaySound = async () => {
    if (sound) {
      await sound.replayAsync();
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleSubmit = async () => {
    if (value.trim() === "") {
      alert("Please enter some text");
      return;
    }

    setLoading(true);
    try {
      setPlaying((play) => !play);
      // Replace URI with your IP Address
      const response = await fetch("http://172.20.10.2:3000/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: value }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Extract the Blob from the response
      const blob = response?._bodyBlob;

      // Convert Blob to Data URI
      const audioUri = await blobToDataURI(blob);

      // Create and play the sound from the data URI
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, {});

      setSound(sound);

      await sound.playAsync();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      // Button Linear Gradient
      colors={["#DD8C9B", "#FFA489"]}
      style={styles.container}
    >
      <Text style={styles.headline}>Unreal Speech sample app runtime</Text>
      <TextInput
        value={value}
        placeholder="Sample Text"
        onChangeText={(text) => setValue(text)}
        style={styles.textfield}
        cursorColor={"#FFA489"}
        placeholderTextColor={"#ffffffcc"}
      />
      <StatusBar style="auto" />
      {loading ? (
        <ActivityIndicator
          style={styles.loadingBtn}
          size="large"
          color="#fff"
        />
      ) : (
        <View style={styles.flexbtn}>
          <TouchableOpacity
            onPress={() => setValue("")}
            style={styles.btn}
            activeOpacity={0.7}
          >
            <Feather name="x" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={playing ? pauseSound : handleSubmit}
            style={[styles.btn2, { marginHorizontal: 20 }]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={playing ? "pause" : "play"}
              size={50}
              color="#FFA489"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={replaySound}
            style={styles.btn}
            activeOpacity={0.7}
          >
            <Feather name="repeat" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headline: { fontSize: 45, marginBottom: 100, color: "#fff" },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 130,
  },
  flexbtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: "10%",
  },
  textfield: {
    width: 350,
    height: 100,
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderRadius: 10,
    borderColor: "#cccccc98",
    color: "#ffffffcc",
  },
  btn: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#00000060",
    height: 70,
    borderRadius: 100,
  },
  btn2: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    backgroundColor: "#fff",
    height: 80,
    borderRadius: 100,
  },
  btnText: {
    color: "#fff",
  },
  loadingBtn: {
    position: "absolute",
    bottom: "10%",
  },
});

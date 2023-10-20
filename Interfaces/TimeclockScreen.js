import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  StatusBar,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Camera } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";

export default function App() {
  const [reload, setReload] = useState(false);
  const [bienvenu, setBienvenu] = useState(true);
  const [nouveau, setNouveau] = useState(false);
  const [show, setShow] = useState(false);
  const [nom, setNom] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.front);
  const [departMessage, setDepartMessage] = useState("");
  const [showResult, setShowResult] = useState(false);

  // Create a ref for the capture button
  const buttonRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === null) {
    return <View />;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const captureImage = async () => {
    if (cameraRef.current) {
      let options = {
        quality: 0.5,
        base64: true,
      };

      let newPhoto = await cameraRef.current.takePictureAsync(options);
      setShow(false);
      setReload(true);
      setDepartMessage("Image captured, processing...");
      setCapturedImage(newPhoto.uri);
      const formData = new FormData();
      formData.append("filee", newPhoto.base64);
      axios.post("http://192.168.1.13:4000/stat", formData).then((res) => {
        setNom(res.data.aya);
        setNouveau(true);
        setReload(false);
        setDepartMessage("");

        // Show the result for 2 seconds and then reset the camera and other states
        setShowResult(true);
        setTimeout(() => {
          setShowResult(false);
          setNom("");
          setCapturedImage(null);
          setShow(true);
          setNouveau(false);
        }, 5000);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        {show ? (
          <Camera
            autoFocus={Camera.Constants.AutoFocus.off}
            ref={cameraRef}
            style={styles.camera}
            type={type}
          />
        ) : null}
        {capturedImage ? (
          <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
        ) : null}
      </View>
  
      {/* Corrected part: Wrap showResult within a Text component */}
      {showResult && <Text style={styles.resultText}>Result: {nom}</Text>}
  
      {bienvenu ? (
        <TouchableOpacity
          onPress={() => {
            setShow(true);
            setBienvenu(false);
          }}
          style={styles.startButton}
        >
          <MaterialIcons name="play-arrow" size={30} color="white" />
        </TouchableOpacity>
      ) : null}
      
      {nom !== "" ? <Text style={styles.bienvenueText}>welcome {nom}</Text> : null}
      {departMessage ? <Text style={styles.departText}>{departMessage}</Text> : null}
      {show && !nouveau ? (
        <TouchableOpacity
          onPress={captureImage}
          style={styles.captureButton}
          ref={buttonRef} // Set the ref to the capture button
        >
          <MaterialIcons name="camera" size={30} color="white" />
        </TouchableOpacity>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundContainer: {
    flex: 1,
    position: "relative",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
venueText: {
    fontSize: 30,
    fontWeight: "bold",
    //style italic pour le texte de bienvenue
    fontStyle: "italic",
    marginTop: 20,
    marginVertical: 20,
  },
  departText: {
    fontSize: 20,
    marginTop: 10,
  },
  captureButton: {
    position: "absolute",
    bottom: 8,
    right: 200,
    backgroundColor: "#FF0000",
    width: 100,
    height: 100,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",

  },
  capturedImage: {
    width: 500,
    height: 500,
    marginTop: 20,
    borderRadius: 10,
  },
  startButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#18B6EC",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  resultText: {
    fontSize: 25,
    fontWeight: "bold",
    //rendre style italic pour le texte de resultat
    fontStyle: "italic",
    color: "orange",
    marginTop: 20,
  },
});

import { Box, Text } from "@chakra-ui/react";
import React, { useContext, useRef, useState } from "react";
import RecorderMicButton from "./RecorderMicButton";
import { TranslationContext } from "./TranslationContext";
import { recognizeAndTranslate } from "@/common_functions/translationAPIServices";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";

const SpeechRecorder = () => {
  const { state, dispatch } = useContext(TranslationContext);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleAudioUpload = async (audioBlob) => {
    const destLang = state.targetLanguage || "hi";
    const result = await recognizeAndTranslate(audioBlob, destLang);
    if (result.error) {
      setError(result.error);
    } else {
      dispatch({ type: "SET_SOURCE_TEXT", payload: result.transcription || "" });
      dispatch({ type: "SET_TRANSLATIONS", payload: result.translated_text || "" });
    }
  };

  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support audio recording.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleAudioUpload(audioBlob);
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
      dispatch({ type: "SET_IS_RECORDING", payload: true });
    } catch (err) {
      setError("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      dispatch({ type: "SET_IS_RECORDING", payload: false });
    }
  };

  const handleMicClick = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Box>
      {error && (
        <Text textAlign={"center"} color="red">
          {error}
        </Text>
      )}
      <Box display="flex" justifyContent="center">
        <RecorderMicButton
          isMicOn={recording}
          onClick={handleMicClick}
        />
      </Box>
    </Box>
  );
};

export default SpeechRecorder;

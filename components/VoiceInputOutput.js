'use client';

import React, { useState, useEffect } from "react";
import Script from 'next/script';
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { FaMicrophone, FaSpinner, FaCheck, FaStop, FaRocket } from "react-icons/fa";

const VoiceInputOutput = () => {
  const { transcript, resetTranscript } = useSpeechRecognition();
  const [response, setResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // New state for speaking
  const [isStopped, setIsStopped] = useState(false); // State for stopping speech

  const playTingSound = () => {
    const audio = new Audio("/beep-22.mp3");
    audio.play();
  };

  useEffect(() => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert("Browser Anda tidak mendukung pengenalan suara. Gunakan Chrome atau Edge.");
    }
  }, []);

  const handleStartListening = () => {
    setIsListening(true);
    playTingSound(); // Play sound when starting listening
    SpeechRecognition.startListening({ continuous: true, language: 'id-ID' });
  };

  const handleStopListening = () => {
    setIsListening(false);
    SpeechRecognition.stopListening();
    playTingSound(); // Play sound when stopping listening
  };

  const handleResponsiveVoiceTTS = (text) => {
    if (typeof window !== "undefined" && window.responsiveVoice) {
      setIsSpeaking(true); // Set speaking state to true
      window.responsiveVoice.speak(text, "Indonesian Female", {
        onend: () => {
          playTingSound(); // Bunyi setelah selesai berbicara
          setIsSpeaking(false); // Set speaking state to false after speaking ends
        },
      });
    } else {
      alert("ResponsiveVoice tidak tersedia.");
    }
  };

  const handleAskAPI = async (prompt) => {
    if (!prompt) {
      alert("Masukkan pertanyaan atau gunakan pengenalan suara.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/assistant/prompt_view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, user_id: "alex" }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const cleanedResponse = data.response.replace(/[^\w\s.,?'"\-()!]/g, "");
      setResponse(cleanedResponse);
      handleResponsiveVoiceTTS(cleanedResponse);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Terjadi kesalahan saat menghubungi API.");
    }
  };

  const handleVoiceInteraction = async () => {
    setIsProcessing(true);
    handleStopListening();

    if (transcript) {
      await handleAskAPI(transcript);
      resetTranscript();
    } else {
      alert("Tidak ada teks dari pengenalan suara.");
    }

    setIsProcessing(false);
  };

  const toggleListening = () => {
    if (isSpeaking) {
      // Stop speaking if already speaking
      window.responsiveVoice.cancel();
      setIsSpeaking(false); // Set speaking state to false
      alert("TechFusion Berhenti berbicara.");
    } else if (!isListening && !isProcessing) {
      handleStartListening();
    } else if (isListening) {
      handleVoiceInteraction();
    }
  };

  // Button styles and animations
  const buttonStyles = {
    base: {
      width: "300px",
      height: "300px",
      borderRadius: "50%",
      fontSize: "100px",
      color: "white",
      border: "none",
      cursor: "pointer",
      outline: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
    },
    ready: { backgroundColor: "#4caf50", transform: "scale(1)" },
    listening: { backgroundColor: "#2196f3", transform: "scale(1.1)", animation: "pulse 1s infinite" },
    processing: { backgroundColor: "#ff9800", transform: "scale(1.2)", animation: "spin 1s linear infinite" },
    speaking: { backgroundColor: "#ff5722", transform: "scale(1.1)", animation: "pulse 1s infinite" }, // New style when speaking
    keyframes: `
      @keyframes pulse {
        0% { transform: scale(1.1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1.1); }
      }
      @keyframes spin {
        from { transform: rotate(0deg) scale(1.2); }
        to { transform: rotate(360deg) scale(1.2); }
      }
    `,
  };

  const currentStyle = isSpeaking
    ? buttonStyles.speaking
    : isListening
    ? buttonStyles.listening
    : isProcessing
    ? buttonStyles.processing
    : buttonStyles.ready;

  const currentIcon = isSpeaking
    ? <FaStop /> // Stop icon when speaking
    : isListening
    ? <FaMicrophone />
    : isProcessing
    ? <FaSpinner />
    : <FaRocket />;

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <Script src="https://code.responsivevoice.org/responsivevoice.js" strategy="beforeInteractive" />
      <style>{buttonStyles.keyframes}</style>

      <button
        onClick={toggleListening}
        disabled={isProcessing}
        style={{ ...buttonStyles.base, ...currentStyle }}
        aria-pressed={isListening}
        aria-busy={isProcessing}
      >
        {currentIcon}
      </button>
    </div>
  );
};

export default VoiceInputOutput;

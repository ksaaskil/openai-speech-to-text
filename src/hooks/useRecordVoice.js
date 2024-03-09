"use client";
import { useEffect, useState, useRef } from "react";
import { blobToBase64 } from "@/utils/blobToBase64";
import { createMediaStream } from "@/utils/createMediaStream";

export const useRecordVoice = () => {
  const [state, setState] = useState("Waiting")
  const [text, setText] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recording, setRecording] = useState(false);
  const isRecording = useRef(false);
  const chunks = useRef([]);

  const startRecording = () => {
    console.log(`Starting recording`)
    if (mediaRecorder) {
      isRecording.current = true;
      mediaRecorder.start();
      setRecording(true);
    }
    setState("Recording...")
  };

  const stopRecording = () => {
    console.log(`Stop recording`)
    if (mediaRecorder) {
      isRecording.current = false;
      mediaRecorder.stop();
      setRecording(false);
    }
    setState("Stopped recording")
  };

  function setAudioURL(url) {
    const audio = document.getElementById('audio');
    audio.src = url
  }

  function onRecordingReady(e) {
    var audio = document.getElementById('audio');
    // e.data contains a blob representing the recording
    const url = URL.createObjectURL(chunks.current[0]);
    audio.src = url
    audio.play();
  }

  const getText = async (base64data) => {
    setState("Transcribing...")
    console.log(`Transcribing`)
    try {
      const response = await fetch("/api/speechToText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: base64data,
        }),
      }).then((res) => res.json());
      const { text } = response;
      console.log(`Got response: ${text}`)
      setText(text);
      setState("Waiting")
    } catch (error) {
      console.error(error);
    }
    // onRecordingReady();
  };

  const initializeMediaRecorder = (stream) => {
    console.log(`Initializing media recorder...`)
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.onstart = () => {
      console.log(`Media recorder onstart`)
      createMediaStream(stream);
      chunks.current = [];
    };

    mediaRecorder.ondataavailable = (ev) => {
      chunks.current.push(ev.data);
    };

    mediaRecorder.onstop = () => {
      console.log(`Media recorder onstop`)
      console.log(`Converting ${chunks.current.length} chunks`)
      const type = mediaRecorder.mimeType
      const audioBlob = new Blob(chunks.current, { type });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioURL(audioUrl);
      blobToBase64(audioBlob, getText);
    };

    setMediaRecorder(mediaRecorder);
  };

  useEffect(() => {
    async function initialize() {
      if (typeof window !== "undefined") {
        const stream = await navigator.mediaDevices
          .getUserMedia({ audio: true })
        initializeMediaRecorder(stream);
        // window.dontGCThis = stream;
      }
    }
    initialize()
  }, []);

  return { recording, startRecording, stopRecording, text, state };
};

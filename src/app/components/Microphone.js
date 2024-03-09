"use client";

import { useRecordVoice } from "@/hooks/useRecordVoice";
import { IconMicrophone } from "@/app/components/IconMicrophone";

const Microphone = () => {
  const { startRecording, stopRecording, text, state } = useRecordVoice();

  return (
    <div className="flex flex-col justify-center items-center">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        className="border-none bg-transparent w-10"
      >
        <IconMicrophone />
      </button>
      <p>{state}</p>
      <p>{text}</p>
      <p><audio id="audio" controls></audio></p>
    </div>
  );
};

export { Microphone };

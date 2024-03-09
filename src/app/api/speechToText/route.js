import { NextResponse } from "next/server";
import fs from "fs";
import * as dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI();

export async function POST(req) {
  const body = await req.json();
  const base64Audio = body.audio;
  const audio = Buffer.from(base64Audio, "base64");
  console.log(`Transcribing audio of ${audio.byteLength} bytes`)
  const filePath = "tmp/input.webm";

  try {
    console.log(`Writing file: ${filePath}`)
    fs.writeFileSync(filePath, audio);
    const readStream = fs.createReadStream(filePath);
    console.log(`Sending to OpenAI...`)
    const data = await openai.audio.transcriptions.create({
      file: readStream,
      model: "whisper-1",
      language: "fi"
    });
    console.log(`Got OpenAI transcription: ${data.text}`)
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error transcribing audio", error);
    return NextResponse.error();
  }
}

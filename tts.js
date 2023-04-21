require("dotenv").config();
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');

async function downloadAudio(text) {
  const client = new textToSpeech.TextToSpeechClient({
    projectId: process.env.PROJECT_ID,
    keyFilename: process.env.KEYFILE_PATH
  });

  const request = {
    input: { text },
    voice: { languageCode: 'cmn-CN', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };
  const [response] = await client.synthesizeSpeech(request);
  const buffer = response.audioContent;
  fs.writeFileSync('mp3s/audio.mp3', buffer);
}

downloadAudio('甜點')

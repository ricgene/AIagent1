import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize the client with the API key
const client = new TextToSpeechClient({
  apiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY
});

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  try {
    // Construct the request
    const request = {
      input: { text },
      voice: {
        languageCode: 'en-US',
        name: 'en-US-Chirp-HD-F',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
      },
    };

    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    if (!response.audioContent) {
      throw new Error('No audio content received from Google Cloud TTS');
    }

    // Convert audio content to ArrayBuffer
    const audioData = response.audioContent as Uint8Array;
    return audioData.buffer;
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw error;
  }
}

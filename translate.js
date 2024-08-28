import 'dotenv/config'; // Load environment variables from .env file
import { Translate } from '@google-cloud/translate/build/src/v2/index.js';

const apiKey = process.env.GOOGLE_API_KEY;

const translate = new Translate({key: apiKey});


export async function translateText(text, target) {
    const [translation] = await translate.translate(text, target);
    return translation;
}
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '@/lib/config';

const gemini_key = config.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(gemini_key);

const MODEL_CHAIN = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash-8b',
  'gemini-2.0-flash',
  'gemini-1.5-pro-latest',
];

async function generateWithFallback(prompt) {
  let lastError;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      console.log(`✓ Vehicle route used model: ${modelName}`);
      return result.response.text();
    } catch (err) {
      console.warn(`✗ Vehicle model ${modelName} failed: ${err.message?.slice(0, 80)}`);
      lastError = err;
      if (!err.message?.includes('429') && !err.message?.includes('404') && !err.message?.includes('quota')) {
        break;
      }
    }
  }
  throw lastError;
}

export async function POST(request) {
  let name = '';
  try {
    const body = await request.json();
    name = body.name || '';

    if (!name?.trim()) {
      return Response.json({ error: 'Vehicle name is required.' }, { status: 400 });
    }

    if (!gemini_key) {
      return Response.json({ error: 'Gemini API key not configured.' }, { status: 500 });
    }

    const systemPrompt = `You are a vehicle specification lookup assistant.
The user wants to look up the fuel efficiency (mileage) averages for the vehicle: "${name}".
Provide realistic mileage values for the Indian driving cycle (ARAI standard or real-world average).
Return ONLY a valid JSON object matching this structure, with no markdown code blocks, no backticks, and no extra text:
{
  "brand": "Brand Name",
  "model": "Model Name",
  "petrol": 18.2, // km/l as a number, or null if this vehicle does not support petrol/has no petrol variant
  "diesel": null, // km/l as a number, or null if no diesel variant
  "cng": 26.5 // km/kg as a number, or null if no factory CNG variant
}

Important details:
- Ensure the values are numbers, not strings.
- Do not wrap the JSON output in markdown backticks like \`\`\`json.
- If the vehicle is electric (EV), return petrol: null, diesel: null, cng: null but add an extra key "ev": true and "batteryRange": range_in_km.
- If you cannot find the exact car, estimate based on similar class vehicles (e.g. if it is a generic hatchback, assume a standard 1.2L engine with ~18 km/l petrol, etc.).`;

    const responseText = await generateWithFallback(systemPrompt);
    
    // Clean up any potential markdown wrapping just in case Gemini ignored the rule
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    try {
      const vehicleData = JSON.parse(cleanJson);
      return Response.json(vehicleData);
    } catch (parseError) {
      console.error('Failed to parse Gemini JSON:', responseText, parseError);
      return Response.json({
        error: 'Invalid response format from Gemini model.',
        rawText: responseText
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Vehicle lookup error, falling back to local heuristics:', error);
    
    const lowerName = name.toLowerCase();
    let brand = "Generic";
    let model = name.charAt(0).toUpperCase() + name.slice(1);
    let petrol = 16.5;
    let diesel = null;
    let cng = null;
    let ev = null;
    let batteryRange = null;

    if (lowerName.includes('ev') || lowerName.includes('electric') || lowerName.includes('tesla') || lowerName.includes('tiago.ev') || lowerName.includes('nexon ev')) {
      ev = true;
      batteryRange = lowerName.includes('long') ? 450 : 315;
      petrol = null;
      brand = lowerName.includes('tesla') ? 'Tesla' : lowerName.includes('nexon') ? 'Tata' : 'Electric';
    } else if (lowerName.includes('wagon') || lowerName.includes('alto') || lowerName.includes('celerio') || lowerName.includes('i10') || lowerName.includes('santro') || lowerName.includes('kwid')) {
      petrol = 21.0;
      cng = 28.0;
      brand = lowerName.includes('i10') ? 'Hyundai' : 'Maruti Suzuki';
    } else if (lowerName.includes('swift') || lowerName.includes('baleno') || lowerName.includes('i20') || lowerName.includes('glanza') || lowerName.includes('altroz') || lowerName.includes('punch')) {
      petrol = 19.5;
      cng = 26.5;
      brand = lowerName.includes('i20') ? 'Hyundai' : lowerName.includes('altroz') || lowerName.includes('punch') ? 'Tata' : 'Maruti Suzuki';
      if (lowerName.includes('diesel') || lowerName.includes('altroz')) diesel = 23.0;
    } else if (lowerName.includes('creta') || lowerName.includes('nexon') || lowerName.includes('seltos') || lowerName.includes('brezza') || lowerName.includes('venue') || lowerName.includes('sonet') || lowerName.includes('suv')) {
      petrol = 15.5;
      diesel = 19.0;
      brand = lowerName.includes('creta') || lowerName.includes('venue') ? 'Hyundai' : lowerName.includes('nexon') ? 'Tata' : 'Kia';
      if (lowerName.includes('brezza') || lowerName.includes('nexon')) cng = 25.0;
    } else if (lowerName.includes('fortuner') || lowerName.includes('endeavour') || lowerName.includes('scorpio') || lowerName.includes('xuv700') || lowerName.includes('safari') || lowerName.includes('harrier')) {
      petrol = 9.5;
      diesel = 12.5;
      brand = lowerName.includes('fortuner') ? 'Toyota' : lowerName.includes('safari') || lowerName.includes('harrier') ? 'Tata' : 'Mahindra';
    } else if (lowerName.includes('city') || lowerName.includes('verna') || lowerName.includes('ciaz') || lowerName.includes('slavia') || lowerName.includes('virtus') || lowerName.includes('sedan')) {
      petrol = 17.5;
      diesel = 21.0;
      brand = lowerName.includes('city') ? 'Honda' : lowerName.includes('verna') ? 'Hyundai' : 'Skoda';
    } else if (lowerName.includes('cng')) {
      petrol = 18.0;
      cng = 26.0;
    }

    const fallbackData = {
      brand,
      model,
      petrol,
      diesel,
      cng,
      note: "Estimated via local heuristics (API Offline)"
    };

    if (ev) {
      fallbackData.ev = true;
      fallbackData.batteryRange = batteryRange;
    }

    return Response.json(fallbackData);
  }
}

import aj from "@/lib/arcjet";
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from "openai";

const PROMPT = `You are an expert AI Travel Consultant. Your goal is to plan a personalized itinerary for the user.
Follow this strict conversation flow to gather necessary details. ASK ONLY ONE QUESTION AT A TIME. Wait for the user's response before proceeding to the next step.

### Conversation Steps & UI States:
1. **Starting Location**: Ask where they are starting from. (UI: 'location')
2. **Destination**: Ask for the destination city or country. (UI: 'destination')
3. **Group Size**: Ask who they are traveling with (Solo, Couple, Family, Friends). (UI: 'groupSize')
4. **Budget**: Ask for their budget preference (Low, Medium, High). (UI: 'budget')
5. **Duration**: Ask for the trip duration (number of days). (UI: 'duration')
6. **Interests**: Ask about travel style (e.g., Adventure, Relaxing, Cultural, Foodie). (UI: 'interests')
7. **Confirmation/Final**: Confirm details or ask for any special requirements. Once fully satisfied, generate the final plan. (UI: 'final')

### Guidelines:
- **Tone**: Professional, friendly, and enthusiastic.
- **One Question Only**: Never ask multiple questions in a single response (unless the user has already provided all trip details).
- **All Details Provided**: If the user's message already contains all essential travel details (starting location/origin, destination, duration, group size, budget, and travel style/interests), warmly acknowledge their choices, summarize the parameters in "resp", and set "ui": "final".
- **Validation**: If an answer is unclear, politely ask for clarification.
- **Output Format**: You must ALWAYS return a JSON object. Do not output markdown or plain text.

### JSON Output Schema:
{
  "resp": "Your conversational response here",
  "ui": "Current UI state (location | destination | groupSize | budget | duration | interests | final)"
}`

const FINAL_PROMPT = `You are a professional travel planner. Generate a highly accurate, realistic, and detailed Travel Plan based on the provided details (origin, destination, duration, budget, and group/people size).

### Critical Accuracy Requirements:
1. **Real & Accurate Geo Coordinates**: The geographic coordinates (latitude and longitude) for all hotels and itinerary activities MUST be highly accurate and correspond to their true physical locations. These will be plotted directly on Google Maps. Do not hallucinate or use random/centered coordinates for a city.
2. **Logically Sequenced Routing**: For each day's itinerary, organize activities sequentially (Morning -> Afternoon -> Evening). Group activities geographically to minimize travel time and driving distance (avoid zig-zagging or crisscrossing the city).
3. **Realistic Travel Times**: Provide practical travel time estimates in "time_travel_each_location". For example, write "15 mins drive from hotel", "20 mins walk from [Previous Attraction]", or "10 mins taxi". Avoid generic placeholders like "30 minutes from hotel".
4. **Accurate Budget Alignment**:
   - Suggest hotels and activities that strictly match the requested budget tier:
     * 'Low' budget: Clean, budget-friendly options, hostels, guesthouses, and free/low-cost activities.
     * 'Medium' budget: Standard 3-star or 4-star hotels, moderate pricing, and popular standard attractions.
     * 'High' budget: Premium/luxury 5-star hotels, resorts, and premium curated activities.
   - Specify "price_per_night" and "ticket_pricing" in realistic numbers, using INR for all destinations (e.g. "₹2,500"). If entry to an attraction is free, state "Free entry".
5. **MakeMyTrip Hotel Booking**: Suggest hotels that are real, well-known, and bookable on MakeMyTrip. The hotel names and addresses must match how they appear on MakeMyTrip to allow successful searches.
6. **Detailed Day Plans**: Provide a comprehensive description of the day's theme/plan under "day_plan", including practical travel/insider tips (e.g., best attire, local customs, peak hour warnings).

Output Schema (strict JSON format):
{
  "origin": "string",
  "destination": "string",
  "duration": "string",
  "budget": "string",
  "people_size": "string",
  "hotels": [
    {
      "hotel_name": "string",
      "hotel_address": "string",
      "price_per_night": "string",
      "hotel_image_url": "string",
      "geo_coordinates": {
        "latitude": "number",
        "longitude": "number"
      },
      "rating": "number",
      "description": "string"
    }
  ],
  "itinerary": [
    {
      "day": "number",
      "day_plan": "string",
      "best_time_to_visit_day": "string",
      "activities": [
        {
          "place_name": "string",
          "place_details": "string",
          "place_image_url": "string",
          "geo_coordinates": {
            "latitude": "number",
            "longitude": "number"
          },
          "place_address": "string",
          "ticket_pricing": "string",
          "time_travel_each_location": "string",
          "best_time_to_visit": "string"
        }
      ]
    }
  ]
}
`


export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API;

  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY or OPENROUTER_API is missing in environment variables." }, { status: 500 });
  }

  try {
    const { messages, isFinal } = await req.json();
    let userId = "";
    let hasPremiumAccess = false;
    try {
      const authObj = await auth();
      userId = authObj.userId ?? "";
      if (authObj.has) {
        hasPremiumAccess = authObj.has({ plan: 'monthly' });
      }
    } catch (authErr) {
      console.warn("Clerk auth check warning:", authErr);
    }

    let decision;
    try {
      decision = await aj.protect(req, { userId: userId || "anonymous", requested: isFinal ? 5 : 0 });
    } catch (ajErr) {
      console.warn("Arcjet protect check warning:", ajErr);
    }

    if (decision && !hasPremiumAccess && (decision.isDenied() || (decision.reason && (decision.reason as any).remaining <= 0))) {
      return NextResponse.json({ resp: "No Free Credits Left", ui: "limit" });
    }
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: apiKey
    });

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      response_format: { type: 'json_object' },
      messages: [
        {
          "role": "system",
          "content": isFinal ? FINAL_PROMPT : PROMPT
        },
        ...messages
      ]
    });

    const message = completion.choices[0].message;

    return NextResponse.json(JSON.parse(message.content ?? ""));
  }
  catch (error: any) {
    console.error("Error in POST requestDetails:", error);
    try {
      const fs = require('fs');
      const logContent = `${new Date().toISOString()} - ERROR: ${error.message}\nSTACK: ${error.stack}\nDETAILS: ${JSON.stringify(error)}\n\n`;
      fs.appendFileSync('aimodel-error.log', logContent);
    } catch (logErr) {
      console.error("Failed to write log file:", logErr);
    }
    return NextResponse.json({
      error: error.message || "Internal Server Error",
      details: error.response?.data || error.error || "No additional details"
    }, { status: 500 });
  }
}
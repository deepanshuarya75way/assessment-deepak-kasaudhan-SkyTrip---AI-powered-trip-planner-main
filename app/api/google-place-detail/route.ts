import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const BASE_URL = "https://places.googleapis.com/v1/places:searchText";
    const config = {
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY?.trim(),
            "X-Goog-FieldMask": [
                'places.photos',
                'places.displayName',
                'places.id'
            ].join(',')
        }
    }

    const { placeName } = await req.json();

    try {
        const result = await axios.post(BASE_URL, {
            textQuery: placeName,
        }, config);

        const placesRefName = result?.data?.places[0]?.photos[0]?.name;
        const placesRefURL = `https://places.googleapis.com/v1/${placesRefName}/media?maxHeightPx=1000&maxWidthPx=1000&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`

        return NextResponse.json(placesRefURL);
    }
    catch (error: any) {
        const errorDetails = error?.response?.data || error.message;
        console.error("Google Place Detail Error:", JSON.stringify(errorDetails, null, 2));
        return NextResponse.json({ error: "External API Error", details: errorDetails }, { status: 500 });
    }
}
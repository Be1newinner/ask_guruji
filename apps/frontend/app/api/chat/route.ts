import { type NextRequest, NextResponse } from "next/server";

// IMPORTANT: Replace this with your actual backend API URL in your environment variables.
// For example, in a .env.local file: BACKEND_API_URL=http://your-backend-url.com
const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

const astroNames = [
  "गुरुजी राम शर्मा",
  "पंडित विष्णु गुप्ता",
  "आचार्य सुरेश जी",
  "गुरुजी अनिल शास्त्री",
  "पंडित राजेश तिवारी",
];

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Step 1: Retrieve documents for context based on the user's message.
    // This calls the /query/retrieve endpoint from the Swagger documentation.
    const retrieveResponse = await fetch(`${BACKEND_API_URL}/query/retrieve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: message }),
    });

    if (!retrieveResponse.ok) {
      const errorBody = await retrieveResponse.text();
      console.error(
        "Failed to retrieve documents from backend:",
        retrieveResponse.status,
        errorBody
      );
      return NextResponse.json(
        {
          error: `Failed to retrieve context from backend. Status: ${retrieveResponse.status}`,
        },
        { status: 500 }
      );
    }

    // The Swagger doc says "Returns a list of relevant documents."
    // We'll assume this is a JSON array of strings.
    const context = await retrieveResponse.json();

    // Step 2: Generate an answer using the original message and the retrieved context.
    // This calls the /query/generate endpoint from the Swagger documentation.
    const generateResponse = await fetch(`${BACKEND_API_URL}/query/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: message, context: context }),
    });

    if (!generateResponse.ok) {
      const errorBody = await generateResponse.text();
      console.error(
        "Failed to generate answer from backend:",
        generateResponse.status,
        errorBody
      );
      return NextResponse.json(
        {
          error: `Failed to generate answer from backend. Status: ${generateResponse.status}`,
        },
        { status: 500 }
      );
    }

    // The Swagger doc says "Returns the generated answer." This could be plain text or a JSON object.
    // This code handles both possibilities.
    let responseText: string;
    const contentType = generateResponse.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const generatedData = await generateResponse.json();
      responseText =
        generatedData.answer ||
        generatedData.response ||
        generatedData.text ||
        "Sorry, I could not find an answer in the response.";
    } else {
      responseText = await generateResponse.text();
    }

    if (!responseText) {
      responseText = "Sorry, the backend returned an empty response.";
    }

    // We still return a random astrologer name as the backend API doesn't provide one.
    const randomName =
      astroNames[Math.floor(Math.random() * astroNames.length)];

    return NextResponse.json({
      response: responseText,
      astrologer: randomName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in chat API route:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `An internal server error occurred: ${error.message}` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "An unknown internal server error occurred" },
      { status: 500 }
    );
  }
}

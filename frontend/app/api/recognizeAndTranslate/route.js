import { NextResponse } from 'next/server';

export async function POST(request) {
  // Extract form data from the request
  const formData = await request.formData();

  // Ensure that the environment variable is being used correctly
  const url = process.env.NEXT_PUBLIC_TRANSLATOR_API_URL + '/recognize-and-translate';
  
  try {
    // Sending the POST request to your backend
    const response = await fetch(url, {
      method: 'POST',
      body: formData, // formData containing the audio file and other params
    });

    if (!response.ok) {
      // Handle error when the response status is not 2xx
      throw new Error('Error while recognizing and translating speech');
    }

    // Get the data from the response
    const data = await response.json();

    // Return the response data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error during API call:', error);
    // Return error message with a status of 500
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

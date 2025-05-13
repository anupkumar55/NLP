import { NextResponse } from 'next/server';

export async function POST(request) {
  const formData = await request.formData();
  const url = process.env.NEXT_PUBLIC_TRANSLATOR_API_URL + '/recognize-and-translate';

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error while recognizing and translating speech');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
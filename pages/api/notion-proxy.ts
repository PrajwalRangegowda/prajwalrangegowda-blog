import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  try {
    const notionResponse = await fetch("https://api.notion.com/v1/search", { // Replace with your Notion API URL
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    if (!notionResponse.ok) {
      console.error(await notionResponse.text())
      return res.status(notionResponse.status).json({ error: notionResponse.statusText });
    }

    const data = await notionResponse.json();
    res.status(200).json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
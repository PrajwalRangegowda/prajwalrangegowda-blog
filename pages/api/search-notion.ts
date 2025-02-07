import { type NextApiRequest, type NextApiResponse } from 'next'

import type * as types from '../../lib/types'
// import { search } from '../../lib/notion'

export default async function searchNotion(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).send({ error: 'method not allowed' })
  }

  const searchParams: types.SearchParams = req.body

  console.log('<<< lambda search-notion', searchParams)
  console.log('Fetching data from Notion API via proxy...');
  const response = await fetch('/pages/api/notion-proxy', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      "Notion-Version": '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(searchParams),
  }).catch(error => {
    console.error("Error fetching data from Notion API:", error);
    res.status(500).json({ error: 'Failed to fetch data from Notion API' });
    return;
  });

  if (!response) return;

  const results = await response.json();
  console.log('Received data from Notion API:', results)
  console.log('>>> lambda search-notion', results)

  res.setHeader(
    'Cache-Control',
    'public, s-maxage=60, max-age=60, stale-while-revalidate=60'
  )
  res.status(200).json(results)
}
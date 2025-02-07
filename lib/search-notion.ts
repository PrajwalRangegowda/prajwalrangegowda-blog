// import ky from 'ky'
import ExpiryMap from 'expiry-map'
import pMemoize from 'p-memoize'

import * as types from './types'
// import { api } from './config'

export const searchNotion = pMemoize(searchNotionImpl, {
  cacheKey: (args) => args[0]?.query,
  cache: new ExpiryMap(10_000)
})

async function searchNotionImpl(
  params: types.SearchParams
): Promise<types.SearchResults> {
  const notionApiUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/api/proxy/v1/search'
    : 'https://api.notion.com/v1/search'; // Use direct API in production (if CORS is configured correctly)

  console.log("Environment:", process.env.NODE_ENV);
  console.log("Notion API URL:", notionApiUrl);
  console.log("Params:", JSON.stringify(params, null, 2));

  console.log("Fetching data from Notion API via proxy...");
  return fetch(notionApiUrl, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Content-Type': 'application/json',
    }
  })
    .then((res) => {
      if (res.ok) {
        return res
      }

      console.log("Notion API URL:", notionApiUrl);
      console.log("Params:", JSON.stringify(params, null, 2));
      // convert non-2xx HTTP responses into errors
      const error: any = new Error(res.statusText)
      error.response = res
      return Promise.reject(error)
    })
    .then((res) => res.json())
    .catch(error => {
      console.error("Error fetching data from Notion API:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        error.response.text().then(errorMessage => {
          console.error("Response body:", errorMessage);
        });
      }
      throw error; // Re-throw the error to prevent silent failures
    });
}
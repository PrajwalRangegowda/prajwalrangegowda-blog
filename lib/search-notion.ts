// import ky from 'ky'
import ExpiryMap from 'expiry-map'
import pMemoize from 'p-memoize'

import * as types from './types'
import { api } from './config'

export const searchNotion = pMemoize(searchNotionImpl, {
  cacheKey: (args) => args[0]?.query,
  cache: new ExpiryMap(10_000)
})

async function searchNotionImpl(
  params: types.SearchParams
): Promise<types.SearchResults> {
  const notionApiUrl = process.env.NODE_ENV === 'development'
    ? 'https://api.notion.com/v1/search' // Use proxy in development
    : api.searchNotion; // Use direct API in production (if CORS is configured correctly)

  return fetch(notionApiUrl, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-type': 'application/json'
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
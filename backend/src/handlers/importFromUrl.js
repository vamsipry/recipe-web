import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

function flattenInstructions(instr) {
  if (!instr) return [];
  if (Array.isArray(instr)) {
    // Could be array of strings or objects with text
    return instr.map(x => (typeof x === 'string' ? x : x.text)).filter(Boolean);
  }
  if (typeof instr === 'string') return [instr];
  return [];
}

export const handler = async (event) => {
  const { url } = JSON.parse(event.body || '{}');
  if (!url) return { statusCode: 400, body: 'url required' };
  const res = await fetch(url, { headers: { 'User-Agent': 'RecipeImporter/1.0' }});
  if (!res.ok) return { statusCode: 400, body: 'failed to fetch' };
  const html = await res.text();
  const $ = cheerio.load(html);
  let parsed = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = $(el).contents().text();
      const obj = JSON.parse(json);
      const arr = Array.isArray(obj) ? obj : [obj];
      for (const item of arr) {
        const type = (item['@type'] || '').toString();
        if (type.toLowerCase().includes('recipe') || item.recipeIngredient || item.recipeInstructions) {
          parsed = {
            title: item.name || 'Recipe',
            ingredients: item.recipeIngredient || [],
            steps: flattenInstructions(item.recipeInstructions),
            tags: (item.keywords ? item.keywords.split(',').map(s => s.trim()) : [])
          };
          return false; // break
        }
      }
    } catch {}
  });
  if (!parsed) {
    // fallback to <title>
    parsed = { title: ($('title').text() || new URL(url).hostname), ingredients: [], steps: [], tags: [] };
  }
  return { statusCode: 200, body: JSON.stringify(parsed) };
};

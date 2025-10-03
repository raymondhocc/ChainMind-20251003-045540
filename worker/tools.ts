import type { WeatherResult, ErrorResult } from './types';
import { mcpManager } from './mcp-client';
export type ToolResult = WeatherResult | { content: string } | ErrorResult;
interface SerpApiResponse {
  knowledge_graph?: { title?: string; description?: string; source?: { link?: string } };
  answer_box?: { answer?: string; snippet?: string; title?: string; link?: string };
  organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
  local_results?: Array<{ title?: string; address?: string; phone?: string; rating?: number }>;
  error?: string;
}
const customTools = [
  {
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather information for a location',
      parameters: {
        type: 'object',
        properties: { location: { type: 'string', description: 'The city or location name' } },
        required: ['location']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'web_search',
      description: 'Search the web using Google or fetch content from a specific URL',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query for Google search' },
          url: { type: 'string', description: 'Specific URL to fetch content from (alternative to search)' },
          num_results: { type: 'number', description: 'Number of search results to return (default: 5, max: 10)', default: 5 }
        },
        required: []
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'create_material_master',
      description: 'Creates a new material master record in the supply chain system.',
      parameters: {
        type: 'object',
        properties: {
          description: { type: 'string', description: 'A detailed description of the material.' },
          unit_of_measure: { type: 'string', description: 'The base unit of measure for the material (e.g., EA, KG, M).' },
          material_group: { type: 'string', description: 'The group this material belongs to (e.g., RAW, FERT, HALB).' }
        },
        required: ['description', 'unit_of_measure', 'material_group']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'update_customer_record',
      description: 'Updates an existing customer master data record.',
      parameters: {
        type: 'object',
        properties: {
          customer_id: { type: 'string', description: 'The unique identifier for the customer.' },
          field_to_update: { type: 'string', description: 'The specific field to change (e.g., "address", "contact_person").' },
          new_value: { type: 'string', description: 'The new value for the specified field.' }
        },
        required: ['customer_id', 'field_to_update', 'new_value']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'validate_pricing_data',
      description: 'Validates a proposed price for a product against company rules.',
      parameters: {
        type: 'object',
        properties: {
          product_id: { type: 'string', description: 'The product identifier.' },
          price: { type: 'number', description: 'The proposed price.' },
          currency: { type: 'string', description: 'The currency of the price (e.g., USD, EUR).' }
        },
        required: ['product_id', 'price', 'currency']
      }
    }
  }
];
export async function getToolDefinitions() {
  const mcpTools = await mcpManager.getToolDefinitions();
  return [...customTools, ...mcpTools];
}
const createSearchUrl = (query: string, apiKey: string, numResults: number) => {
  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('num', Math.min(numResults, 10).toString());
  return url.toString();
};
const formatSearchResults = (data: SerpApiResponse, query: string, numResults: number): string => {
  const results: string[] = [];
  if (data.knowledge_graph?.title && data.knowledge_graph.description) {
    results.push(`**${data.knowledge_graph.title}**\n${data.knowledge_graph.description}`);
    if (data.knowledge_graph.source?.link) results.push(`Source: ${data.knowledge_graph.source.link}`);
  }
  if (data.answer_box) {
    const { answer, snippet, title, link } = data.answer_box;
    if (answer) results.push(`**Answer**: ${answer}`);
    else if (snippet) results.push(`**${title || 'Answer'}**: ${snippet}`);
    if (link) results.push(`Source: ${link}`);
  }
  if (data.organic_results?.length) {
    results.push('\n**Search Results:**');
    data.organic_results.slice(0, numResults).forEach((result, index) => {
      if (result.title && result.link) {
        const text = [`${index + 1}. **${result.title}**`];
        if (result.snippet) text.push(`   ${result.snippet}`);
        text.push(`   Link: ${result.link}`);
        results.push(text.join('\n'));
      }
    });
  }
  return results.length ? `🔍 Search results for "${query}":\n\n${results.join('\n\n')}`
    : `No results found for "${query}". Try: https://www.google.com/search?q=${encodeURIComponent(query)}`;
};
async function performWebSearch(query: string, env: { SERPAPI_KEY?: string }, numResults = 5): Promise<string> {
  const apiKey = env.SERPAPI_KEY;
  if (!apiKey) {
    return `🔍 Web search requires the SERPAPI_KEY secret to be configured.\nFallback: https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
  try {
    const response = await fetch(createSearchUrl(query, apiKey, numResults), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`SerpAPI returned ${response.status}`);
    const data: SerpApiResponse = await response.json();
    if (data.error) throw new Error(`SerpAPI error: ${data.error}`);
    return formatSearchResults(data, query, numResults);
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes('timeout');
    const fallback = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    return `Search failed: ${isTimeout ? 'timeout' : 'API error'}. Try: ${fallback}`;
  }
}
const extractTextFromHtml = (html: string): string => html
  .replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
async function fetchWebContent(url: string): Promise<string> {
  try {
    new URL(url);
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WebBot/1.0)' },
      signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/')) throw new Error('Unsupported content type');
    const html = await response.text();
    const text = extractTextFromHtml(html);
    return text.length ? `Content from ${url}:\n\n${text.slice(0, 4000)}${text.length > 4000 ? '...' : ''}`
      : `No readable content found at ${url}`;
  } catch (error) {
    throw new Error(`Failed to fetch: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
export async function executeTool(name: string, args: Record<string, unknown>, env: { SERPAPI_KEY?: string }): Promise<ToolResult> {
  try {
    switch (name) {
      case 'get_weather':
        return {
          location: args.location as string,
          temperature: Math.floor(Math.random() * 40) - 10,
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
          humidity: Math.floor(Math.random() * 100)
        };
      case 'web_search': {
        const { query, url, num_results = 5 } = args;
        if (typeof url === 'string') {
          const content = await fetchWebContent(url);
          return { content };
        }
        if (typeof query === 'string') {
          const content = await performWebSearch(query, env, num_results as number);
          return { content };
        }
        return { error: 'Either query or url parameter is required' };
      }
      case 'create_material_master': {
        // This is a mock implementation. In a real-world scenario, this would
        // make an API call to an ERP or Master Data Management (MDM) system.
        // Example:
        // const response = await fetch('https://api.example.com/materials', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' },
        //   body: JSON.stringify(args)
        // });
        // if (!response.ok) throw new Error('Failed to create material master');
        // const result = await response.json();
        // return { content: `Successfully created material master record ${result.id}.` };

        console.log('Executing mock for create_material_master with args:', args);
        const materialId = `M-${Math.floor(10000 + Math.random() * 90000)}`;
        return { content: `(Mock) Successfully created material master record ${materialId} for "${args.description}".` };
      }
      case 'update_customer_record': {
        // This is a mock implementation. In a real-world scenario, this would
        // make an API call to a CRM or MDM system.
        // Example:
        // const response = await fetch(`https://api.example.com/customers/${args.customer_id}`, {
        //   method: 'PATCH',
        //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' },
        //   body: JSON.stringify({ [args.field_to_update as string]: args.new_value })
        // });
        // if (!response.ok) throw new Error('Failed to update customer record');
        // return { content: `Customer record ${args.customer_id} has been updated.` };

        console.log('Executing mock for update_customer_record with args:', args);
        return { content: `(Mock) Customer record ${args.customer_id} has been updated. Field "${args.field_to_update}" is now set to "${args.new_value}".` };
      }
      case 'validate_pricing_data': {
        // This is a mock implementation. In a real-world scenario, this would
        // make an API call to a pricing engine or rules service.
        // Example:
        // const response = await fetch('https://api.example.com/pricing/validate', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ...' },
        //   body: JSON.stringify(args)
        // });
        // if (!response.ok) throw new Error('Failed to validate pricing data');
        // const result = await response.json();
        // return { content: result.message };

        console.log('Executing mock for validate_pricing_data with args:', args);
        const price = args.price as number;
        if (price <= 0) {
          return { content: `(Mock) Validation failed: Price for product ${args.product_id} must be positive.` };
        }
        if (price > 10000) {
          return { content: `(Mock) Validation passed, but price for ${args.product_id} is high (${price} ${args.currency}) and requires manual approval.` };
        }
        return { content: `(Mock) Pricing data for product ${args.product_id} is valid.` };
      }
      default: {
        const content = await mcpManager.executeTool(name, args);
        return { content };
      }
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
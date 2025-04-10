import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Cache duration - 5 minutes in milliseconds (reduced from 10 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache objects
interface CacheItem {
  data: any;
  timestamp: number;
}

// In-memory cache store (will reset on server restart)
const arenaCache: Map<string, CacheItem> = new Map();

// Clear cache function that can be called periodically
function clearStaleCache() {
  const now = Date.now();
  for (const [key, value] of arenaCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      arenaCache.delete(key);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Clear stale cache entries
    clearStaleCache();
    
    // Extract parameters from request
    const url = new URL(request.url);
    const arenaUrl = url.searchParams.get('url');
    const forceRefresh = url.searchParams.get('force') === 'true';
    
    if (!arenaUrl) {
      return NextResponse.json({
        error: 'Missing url parameter'
      }, { status: 400 });
    }

    // Create a cache key from the Arena URL
    const cacheKey = arenaUrl;

    // Check cache first
    const cachedItem = arenaCache.get(cacheKey);
    const now = Date.now();
    const isCacheValid = cachedItem && (now - cachedItem.timestamp < CACHE_DURATION);

    // Use cache if valid and not forcing refresh
    if (isCacheValid && !forceRefresh) {
      console.log('Serving cached Arena data for:', arenaUrl);
      
      // Set cache control headers for client-side caching
      return NextResponse.json(cachedItem.data, {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes client-side cache
          'X-Cache': 'HIT',
          'X-Cache-Age': `${Math.floor((now - cachedItem.timestamp) / 1000)}s`
        }
      });
    }

    // Otherwise fetch fresh data
    console.log('Fetching fresh Arena data for:', arenaUrl);
    
    try {
      const response = await axios.get(arenaUrl, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Found Fonts Foundry Website/1.0',
          // Add random query parameter to bypass potential CDN caches
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      
      // Validate response
      if (!response.data) {
        throw new Error('Empty response from Arena API');
      }
      
      const data = response.data;

      // Fix the total count if it's missing
      if (data && (arenaUrl.includes('/channels/found-fonts-foundry') && !arenaUrl.includes('/contents'))) {
        // This is a channel info request
        const channelData = data as any;
        if (!channelData.contents_count || channelData.contents_count <= 0) {
          channelData.contents_count = 49; // Set fallback value
          console.log('Using fallback count of 49 items');
        }
      }

      // Update cache
      arenaCache.set(cacheKey, {
        data,
        timestamp: now
      });

      // Return fresh data with cache control headers
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes client-side cache
          'X-Cache': 'MISS',
        }
      });
    } catch (fetchError) {
      console.error('Error fetching from Arena API:', fetchError);
      
      // If we have stale cache, better to return it than nothing
      if (cachedItem) {
        console.log('Returning stale cache as fallback');
        return NextResponse.json(cachedItem.data, {
          headers: {
            'Cache-Control': 'public, max-age=60', // Only cache for 1 minute
            'X-Cache': 'STALE',
            'X-Cache-Age': `${Math.floor((now - cachedItem.timestamp) / 1000)}s`
          }
        });
      }
      
      throw fetchError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error in Arena API route:', error);
    
    // Return error response with fallback data for channel info
    const url = new URL(request.url);
    const arenaUrl = url.searchParams.get('url') || '';
    
    if (arenaUrl.includes('/channels/found-fonts-foundry') && !arenaUrl.includes('/contents')) {
      // This is a channel info request, return fallback data
      console.log('Returning fallback channel data');
      
      try {
        // Try to use a static fallback JSON file
        const response = await fetch(new URL('/fallback-channel.json', request.nextUrl.origin));
        if (response.ok) {
          const fallbackData = await response.json();
          return NextResponse.json(fallbackData, { 
            status: 200,
            headers: {
              'Cache-Control': 'public, max-age=60', // Only cache for 1 minute
              'X-Cache': 'FALLBACK'
            } 
          });
        }
      } catch (fallbackError) {
        console.error('Error loading fallback JSON:', fallbackError);
      }
      
      // If fetch fails, use hardcoded fallback
      return NextResponse.json({
        title: "Found Fonts Foundry",
        contents_count: 49,
        length: 49,
        updated_at: new Date().toISOString()
      }, { status: 200 });
    }
    
    // For other requests, return error
    return NextResponse.json({
      error: 'Failed to fetch data from Arena',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 
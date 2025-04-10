import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Cache duration - 10 minutes in milliseconds
const CACHE_DURATION = 10 * 60 * 1000;

// Cache objects
interface CacheItem {
  data: any;
  timestamp: number;
}

// In-memory cache store (will reset on server restart)
const arenaCache: Map<string, CacheItem> = new Map();

export async function GET(request: NextRequest) {
  try {
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
          'Cache-Control': 'public, max-age=600',
          'X-Cache': 'HIT',
          'X-Cache-Age': `${Math.floor((now - cachedItem.timestamp) / 1000)}s`
        }
      });
    }

    // Otherwise fetch fresh data
    console.log('Fetching fresh Arena data for:', arenaUrl);
    const response = await axios.get(arenaUrl);
    const data = response.data;

    // Update cache
    arenaCache.set(cacheKey, {
      data,
      timestamp: now
    });

    // Return fresh data with cache control headers
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=600',
        'X-Cache': 'MISS',
      }
    });

  } catch (error) {
    console.error('Error in Arena API route:', error);
    
    // Return error response
    return NextResponse.json({
      error: 'Failed to fetch data from Arena'
    }, { status: 500 });
  }
} 
'use client';

import { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import axios from 'axios';
import './fixed-image.css';
import './fonts.css';

// Define interfaces for API responses
interface ArenaResponse {
  contents?: any[];
  total_pages?: number;
  current_page?: number;
  per?: number;
  length?: number;
}

interface ChannelResponse {
  id: number;
  title: string;
  length: number;
  contents_count: number;
  updated_at: string;
  slug: string;
  // Add other properties as needed
}

// Modified to support server-side caching
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Cache duration - 10 minutes in milliseconds
const CACHE_DURATION = 10 * 60 * 1000;

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="text-center">
        <div className="loading-text">searching...</div>
      </div>
    </div>
  );
}

export default function MainContent() {
  // Modify state for infinite scroll
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<{[key: string]: {offset: number}}>({});
  const [hasMore, setHasMore] = useState(true);
  const [perPage] = useState(30); // Updated to show 30 posts per page
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // State for randomly selected font
  const [randomFont, setRandomFont] = useState<string>('Cooper Black');
  
  // Reference for data freshness and observers
  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set([1]));
  
  // Server-side fetch with caching
  const fetchFromServerWithCache = async <T,>(url: string, forceRefresh = false): Promise<T> => {
    let retries = 2;
    let lastError;
    
    while (retries >= 0) {
      try {
        // Use our internal API route that handles server-side caching
        const response = await axios.get<T>('/api/arena', {
          params: {
            url: url,
            force: forceRefresh ? 'true' : 'false'
          },
          timeout: 15000 // 15 second timeout
        });
        
        // Update last fetch timestamp
        lastFetchRef.current = Date.now();
        
        return response.data;
      } catch (error) {
        console.error(`Error fetching data (retries left: ${retries}):`, error);
        lastError = error;
        
        if (retries > 0) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
        }
        
        retries--;
      }
    }
    
    // All retries failed
    throw lastError;
  };

  // Fetch channel info with server-side caching
  const fetchChannelInfo = async (forceRefresh = false) => {
    try {
      isFetchingRef.current = true;
      setError(null); // Clear any previous errors
      
      // Get channel info to determine total count
      const channelData = await fetchFromServerWithCache<ChannelResponse>(
        'https://api.are.na/v2/channels/found-fonts-foundry', 
        forceRefresh
      );
      
      if (channelData) {
        // Make sure we get the correct length - might be in different properties depending on the API
        const totalItems = channelData.contents_count || channelData.length || 49; // Fallback to 49 if API doesn't return correct value
        setTotalCount(totalItems);
        
        console.log(`Total items in channel: ${totalItems}`);
      }
    } catch (error) {
      console.error('Error fetching channel info:', error);
      
      // If we can't fetch channel info, set default values
      setTotalCount(49); // Use the known value of 49 as fallback
      
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Fetch data with server-side caching
  const fetchData = async (forceRefresh = false, isLoadMore = false) => {
    try {
      const page = isLoadMore ? currentPage + 1 : 1;
      console.log(`🔄 Fetching data for page ${page}, loadMore: ${isLoadMore}`);
      
      if (!isLoadMore) {
        setLoading(true);
      }
      
      setError(null); // Clear any previous errors
      isFetchingRef.current = true;
      
      // Use the Arena API with the channel slug and the proper pagination parameters
      // We're explicitly using slug instead of ID to ensure we get the right channel
      const apiUrl = `https://api.are.na/v2/channels/found-fonts-foundry/contents?page=${page}&per=${perPage}`;
      
      console.log(`📡 API request: ${apiUrl}`);
      
      // Make a direct API call without any caching to debug pagination
      try {
        const response = await axios.get<ArenaResponse>(apiUrl, { 
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            // Add a random query parameter to prevent caching
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          // Add a timestamp to URL to bypass browser cache
          params: {
            _t: Date.now()
          }
        });
        
        const responseData: ArenaResponse = response.data;
        
        // Log detailed pagination information
        console.log(`📊 Page info - Current: ${responseData.current_page}, Total pages: ${responseData.total_pages}`);
        console.log(`📦 Received ${responseData.contents?.length || 0} items`);
        
        // Check for pagination issues
        if (!responseData.contents || responseData.contents.length === 0) {
          console.warn(`⚠️ Empty response data for page ${page}`);
          
          if (page > 1) {
            // No more content, we've reached the end
            setHasMore(false);
            setLoadingMore(false);
            return;
          } else {
            throw new Error('No content found in channel');
          }
        }
        
        // Calculate if we have more pages
        const isLastPage = (responseData.current_page || 1) >= (responseData.total_pages || 1);
        
        if (isLastPage) {
          console.log('🏁 Reached last page, no more content available');
          setHasMore(false);
        }
        
        // Update current page tracker
        if (isLoadMore) {
          setCurrentPage(page);
          loadedPagesRef.current.add(page);
        } else {
          setCurrentPage(1);
          loadedPagesRef.current = new Set([1]);
        }
        
        // Process the data
        processArenaData(responseData, isLoadMore);
        
      } catch (apiError) {
        console.error('❌ Direct API call failed:', apiError);
        
        // Try the server-side API route as a fallback
        try {
          console.log('🔁 Falling back to server-side API');
          const response = await axios.get<ArenaResponse>('/api/arena', {
            params: {
              url: apiUrl,
              force: 'true', // Always force refresh for pagination testing
              _t: Date.now() // Add timestamp to prevent caching
            }
          });
          
          const responseData: ArenaResponse = response.data;
          
          if (!responseData.contents || responseData.contents.length === 0) {
            console.warn(`⚠️ Empty server-side response for page ${page}`);
            
            if (page > 1) {
              // No more content, we've reached the end
              setHasMore(false);
              setLoadingMore(false);
              return;
            } else {
              throw new Error('No content found in channel (server-side)');
            }
          }
          
          // Calculate if we have more pages
          const isLastPage = (responseData.current_page || 1) >= (responseData.total_pages || 1);
          
          if (isLastPage) {
            console.log('🏁 Reached last page, no more content available');
            setHasMore(false);
          }
          
          // Update current page tracker
          if (isLoadMore) {
            setCurrentPage(page);
            loadedPagesRef.current.add(page);
          } else {
            setCurrentPage(1);
            loadedPagesRef.current = new Set([1]);
          }
          
          // Process the data
          processArenaData(responseData, isLoadMore);
          
        } catch (fallbackError) {
          console.error('❌ Fallback API call also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
    } catch (err: unknown) {
      console.error(`❌ Error fetching data:`, err);
      
      // Extract a user-friendly message from the error
      let errorMessage = 'Failed to load images. Please try again later.';
      
      if (err instanceof Error) {
        // Check for specific error patterns in the error or message
        const errMsg = err.message || '';
        if (errMsg.includes('timeout') || errMsg.includes('ECONNABORTED')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          // Try to handle axios error properties that might exist
          const axiosError = err as any;
          if (axiosError.response) {
            // Server responded with an error status
            if (axiosError.response.status === 500) {
              errorMessage = 'Internal Server Error. Our team has been notified.';
            } else if (axiosError.response.status === 404) {
              errorMessage = 'Content not found. Please check back later.';
            }
            console.error('API Error Response:', axiosError.response.data);
          } else if (axiosError.request) {
            // Request made but no response received
            errorMessage = 'No response from server. Please check your connection.';
          }
        }
      }
      
      setError(errorMessage);
      
      // Don't clear blocks if this was a loadMore operation
      if (!isLoadMore) {
        setBlocks([]);
      }
      
      // Turn off loading states
      setLoading(false);
      setLoadingMore(false);
      
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Load more items function
  const loadMoreItems = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    
    console.log('Loading more items, next page:', currentPage + 1);
    
    // Skip if we've already loaded this page
    if (loadedPagesRef.current.has(currentPage + 1)) return;
    
    setLoadingMore(true);
    
    try {
      await fetchData(false, true);
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentPage, fetchData]);

  // Update the useCallback hook that creates the observer
  const lastBlockElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore || !node) return;
    
    // Always disconnect the previous observer before creating a new one
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    
    // Create a new intersection observer
    observerRef.current = new IntersectionObserver(entries => {
      // Check if the element is intersecting and we have more content to load
      if (entries[0] && entries[0].isIntersecting && hasMore && !loadingMore) {
        console.log('🔍 Intersection detected, loading more items');
        // Ensure we call loadMoreItems in a way that doesn't get caught in a race condition
        setTimeout(() => loadMoreItems(), 100);
      }
    }, {
      rootMargin: '300px', // Larger margin to trigger earlier before reaching bottom
      threshold: 0.1 // Trigger when at least 10% of the element is visible
    });
    
    // Start observing the sentinel element
    observerRef.current.observe(node);
    console.log('📡 Observer attached to element');
    
    // Return cleanup function
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [loadingMore, hasMore, loadMoreItems]);

  // Add debug logging when hasMore or loadingMore changes
  useEffect(() => {
    console.log(`State update - hasMore: ${hasMore}, loadingMore: ${loadingMore}, current page: ${currentPage}`);
  }, [hasMore, loadingMore, currentPage]);

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchChannelInfo();
      await fetchData();
    };

    fetchInitialData();

    // Setup interval to check data freshness
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastFetchRef.current > CACHE_DURATION && !isFetchingRef.current) {
        console.log('Refreshing data after cache expiration...');
        fetchChannelInfo(true);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(intervalId);
      // Cleanup observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Add effect to handle body overflow during initial loading
  useEffect(() => {
    if (loading) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [loading]);

  // Update document title when count changes
  useEffect(() => {
    // Only update if we have a valid count
    if (totalCount > 0 && typeof document !== 'undefined') {
      document.title = `Found Fonts Foundry (${totalCount})`;
      
      // Also update any elements that might show the count
      const countElements = document.querySelectorAll('.count-display');
      countElements.forEach(el => {
        el.textContent = totalCount.toString();
      });
    }
  }, [totalCount]);

  // Helper function to get a random font
  const getRandomFont = () => {
    // Array of available fonts in the fonts folder (exact font names)
    const fonts = [
      'Cooper Black',
      'Boecklins Universe',
      'Brush Script',
      'Davida Bold',
      'Papyrus',
      'Comic Sans Bold',
      'Choc',
      'Alte Haas Grotesk'
    ];
    
    // Select a random font from the array
    const randomIndex = Math.floor(Math.random() * fonts.length);
    return fonts[randomIndex];
  };

  // Set random font on initial load
  useEffect(() => {
    setRandomFont(getRandomFont());
  }, []);

  // Process Arena data and update state
  const processArenaData = (data: ArenaResponse, isLoadMore = false) => {
    // Extract pagination metadata from response
    let totalItems = data.length || totalCount;
    
    // If the API returns 0 or undefined, use our fallback value
    if (!totalItems || totalItems <= 0) {
      totalItems = 49; // Fallback to 49 as mentioned by the user
    }
    
    setTotalCount(totalItems);
    
    const contents = data.contents || [];
    
    if (contents.length === 0) {
      console.warn('No contents found in response');
      setLoading(false);
      setLoadingMore(false);
      return;
    }
    
    // Base offsets: 0%, 10%, 20%, 30%, 40%, 50%
    let offsetValues = [0, 10, 20, 30, 40, 50];
    
    // Occasionally shuffle or swap some values to create variations
    const shouldShuffle = Math.random() < 0.5;
    
    if (shouldShuffle) {
      // Option 1: Swap some pair of values
      const swap = (i: number, j: number) => {
        const temp = offsetValues[i];
        offsetValues[i] = offsetValues[j];
        offsetValues[j] = temp;
      };
      
      // Random swap patterns
      const pattern = Math.floor(Math.random() * 3);
      if (pattern === 0) {
        // Swap 10% and 20%
        swap(1, 2);
      } else if (pattern === 1) {
        // Swap 40% and 50%
        swap(4, 5);
      } else {
        // Swap 0% and 10%
        swap(0, 1);
      }
    }
    
    const newOffsets: {[key: string]: {offset: number}} = {};
    
    contents.forEach((block, index) => {
      // Get offset from the sequence, cycling through the array
      const offsetIndex = index % offsetValues.length;
      const offset = offsetValues[offsetIndex];
      newOffsets[block.id] = { offset };
    });
    
    // Update offsets, merging with existing ones if loading more
    setOffsets(prev => ({
      ...prev,
      ...newOffsets
    }));
    
    // Then update the blocks data - append if loading more, replace if initial load
    // For now, don't filter duplicates to debug what the API is returning
    setBlocks(prev => {
      if (isLoadMore) {
        console.log(`Adding ${contents.length} new blocks`);
        // Add page number to each block for debugging
        const pageTaggedBlocks = contents.map(block => ({
          ...block,
          _page: currentPage + 1,
          _key: `${block.id}-p${currentPage + 1}`
        }));
        return [...prev, ...pageTaggedBlocks];
      } else {
        // Add page number to each block for debugging
        const pageTaggedBlocks = contents.map(block => ({
          ...block,
          _page: 1,
          _key: `${block.id}-p1`
        }));
        return pageTaggedBlocks;
      }
    });
    
    // Turn off loading states after a short delay
    setTimeout(() => {
      setLoading(false);
      setLoadingMore(false);
    }, 300);
  };

  // Helper function to format date
  const formatDate = (updatedAt: string) => {
    if (!updatedAt) return '';
    const date = new Date(updatedAt);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).toLowerCase();
  };

  return (
    <main className="min-h-screen bg-white text-black px-4 py-6">
      <div 
        className={`fixed inset-0 bg-white z-50 flex items-center justify-center ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ transition: loading ? 'none' : 'opacity 300ms' }}
      >
        <div className="text-center">
          <div className="loading-text text-black">searching...</div>
        </div>
      </div>
      
      <div 
        className={`max-w-5xl mx-auto responsive-container ${loading ? 'opacity-0' : 'opacity-100'}`} 
        style={{ 
          marginLeft: '2em', 
          marginRight: '2em', 
          marginTop: '1.5em',
          transition: loading ? 'none' : 'opacity 500ms'
        }}
      >
        <header className="mb-12">
          <h1 className="title" style={{ 
            fontFamily: `'${randomFont}', sans-serif`
          }}>
            Found Fonts Foundry
          </h1>
          <p className="text-base text-gray-700" style={{ marginBottom: '2em' }}>
            A growing collection (<span className="count-display">{totalCount || 49}</span>) of fonts discovered on the street, in the wild and everywhere in between<br />
            Add your own finds via our <a href="https://www.are.na/benjamin-ikoma/found-fonts-foundry" target="_blank" rel="noopener noreferrer" className="underline">Are.na</a> channel
          </p>
        </header>

        {error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : blocks.length === 0 && !loading ? (
          <div className="text-center py-8">No images found</div>
        ) : (
          <>            
            <div className="relative">
              {blocks.map((block, index) => {
                const offset = offsets[block.id]?.offset || 0;
                const username = block.user?.username || 'anonymous';
                const date = formatDate(block.updated_at);
                
                return (
                  <div 
                    key={block._key || `${block.id}-${index}`}
                    className="image-block"
                    style={{
                      marginLeft: `${offset}%`,
                      width: '50%',
                      marginBottom: '2em'
                    }}
                  >
                    {block.image && (
                      <div className="mb-2 img-container">
                        <img 
                          src={block.image.display?.url || block.image.original?.url} 
                          alt={'Found font'} 
                          className="image-fade"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      submitted by {username} – {date} 
                      {block._page && <span className="text-xs text-gray-400 ml-1">(p{block._page})</span>}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Loading indicator for infinite scroll */}
            {loadingMore && (
              <div className="text-center py-8">
                <div className="loading-more">Loading more fonts...</div>
              </div>
            )}
            
            {/* This div serves as a sentinel for the infinite scroll */}
            <div 
              ref={lastBlockElementRef} 
              className="h-40 mb-10 w-full text-center"
              style={{ opacity: hasMore ? 1 : 0 }}
            >
              {hasMore && !loadingMore && (
                <div className="text-sm text-gray-400 py-4">
                  Scroll for more fonts...
                </div>
              )}
              {!hasMore && (
                <div className="text-sm text-gray-400 py-4">
                  You've reached the end of the collection!
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="mt-12 pt-4 border-t text-center text-sm text-gray-600">
              <p>
                A project by <a href="http://benjaminikoma.be/" target="_blank" rel="noopener noreferrer" className="underline">Benjamin Ikoma</a>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
} 
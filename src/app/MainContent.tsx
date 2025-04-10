'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import axios from 'axios';
import './image-placeholder.css';
import './fonts.css';
import { useRouter } from 'next/navigation';

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
  page?: number; // For paginated content
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

interface MainContentProps {
  initialPage: number;
}

export default function MainContent({ initialPage }: MainContentProps) {
  const router = useRouter();
  
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<{[key: string]: {offset: number}}>({});
  const [imageStates, setImageStates] = useState<{[key: string]: {loaded: boolean, width: number, height: number}}>({});
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(30); // Updated to show 30 posts per page
  const [totalCount, setTotalCount] = useState(0);
  
  // State for randomly selected font
  const [randomFont, setRandomFont] = useState<string>('Cooper Black');
  
  // Use passed in initialPage value, enforcing a valid number
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(initialPage);
    return !isNaN(page) && page > 0 ? page : 1;
  });
  
  // Reference for data freshness
  const lastFetchRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const pageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data on component mount and page changes
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchChannelInfo();
      await fetchData(currentPage);
    };

    fetchInitialData();

    // Setup interval to check data freshness
    const intervalId = setInterval(() => {
      const now = Date.now();
      if (now - lastFetchRef.current > CACHE_DURATION && !isFetchingRef.current) {
        console.log('Refreshing data after cache expiration...');
        fetchChannelInfo(true);
        fetchData(currentPage, true);
      }
    }, 60000); // Check every minute

    return () => {
      clearInterval(intervalId);
      // Clear any pending timeouts
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
      }
    };
  }, []);

  // Fetch data when page changes
  useEffect(() => {
    // Clear any existing timeout to prevent race conditions
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current);
    }
    
    // Reset image states when changing pages
    setImageStates({});
    
    // Set loading first - immediate
    setLoading(true);
    
    // Then fetch data - after a short delay to ensure loading state is applied
    fetchData(currentPage);
  }, [currentPage]);

  // Add effect to scroll to top when page changes - immediate scroll
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [currentPage]);

  // Add effect to handle body overflow during loading
  useEffect(() => {
    if (loading) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
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

  // Set random font on initial load and when page changes
  useEffect(() => {
    setRandomFont(getRandomFont());
  }, [currentPage]);

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
        
        // Calculate total pages based on accurate item count
        const calculatedTotalPages = Math.ceil(totalItems / perPage);
        setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1); // Ensure at least 1 page
        
        console.log(`Total items in channel: ${totalItems}, Total pages: ${calculatedTotalPages}`);
      }
    } catch (error) {
      console.error('Error fetching channel info:', error);
      
      // If we can't fetch channel info, set default values
      setTotalCount(49); // Use the known value of 49 as fallback
      setTotalPages(Math.ceil(49 / perPage));
      
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Fetch page data with server-side caching
  const fetchData = async (page: number, forceRefresh = false) => {
    try {
      console.log(`Fetching data for page ${page}, force refresh: ${forceRefresh}`);
      // setLoading(true) is now set by the page change effect
      setError(null); // Clear any previous errors
      isFetchingRef.current = true;
      
      // Create a unique cache key for each page
      const pageUrl = `https://api.are.na/v2/channels/found-fonts-foundry/contents?page=${page}&per=${perPage}&sort=position&direction=desc`;
      
      // Fetch data with server-side caching
      const responseData = await fetchFromServerWithCache<ArenaResponse>(
        pageUrl,
        forceRefresh
      );
      
      // Verify we have valid data before processing
      if (!responseData || !responseData.contents) {
        throw new Error('Invalid response data received from API');
      }
      
      console.log(`Received data for page ${page} with ${responseData.contents.length} items`);
      
      // Process the data
      processArenaData(responseData);
      
    } catch (err: unknown) {
      console.error(`Error fetching data for page ${page}:`, err);
      
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
          } else if (axiosError.request) {
            // Request made but no response received
            errorMessage = 'No response from server. Please check your connection.';
          }
        }
      }
      
      setError(errorMessage);
      
      // Fall back to empty content but don't crash the app
      setBlocks([]);
      
      // Ensure loading is set to false even on error
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
      }
      setLoading(false);
      
    } finally {
      isFetchingRef.current = false;
    }
  };

  // Process Arena data and update state
  const processArenaData = (data: ArenaResponse) => {
    // Extract pagination metadata from response
    let totalItems = data.length || totalCount;
    
    // If the API returns 0 or undefined, use our fallback value
    if (!totalItems || totalItems <= 0) {
      totalItems = 49; // Fallback to 49 as mentioned by the user
    }
    
    setTotalCount(totalItems);
    
    // Calculate total pages, ensure we have at least 1 page
    const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / perPage));
    setTotalPages(calculatedTotalPages);
    
    console.log(`Processing data: Total items: ${totalItems}, Pages: ${calculatedTotalPages}, Current page: ${currentPage}`);
    
    const contents = data.contents || [];
    
    if (contents.length === 0) {
      console.warn('No contents found for page:', currentPage);
      
      // If we're on a page that doesn't exist, go to page 1
      if (currentPage > 1 && calculatedTotalPages < currentPage) {
        console.warn('Current page exceeds total pages, redirecting to page 1');
        setCurrentPage(1);
        return;
      }
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
    
    const offsetsMap: {[key: string]: {offset: number}} = {};
    const initialImageStates: {[key: string]: {loaded: boolean, width: number, height: number}} = {};
    
    contents.forEach((block, index) => {
      // Get offset from the sequence, cycling through the array
      const offsetIndex = index % offsetValues.length;
      const offset = offsetValues[offsetIndex];
      offsetsMap[block.id] = { offset };
      
      // Initialize image state
      initialImageStates[block.id] = { 
        loaded: false, 
        width: block.image?.display?.width || 800, 
        height: block.image?.display?.height || 600 
      };
    });
    
    setOffsets(offsetsMap);
    setImageStates(initialImageStates);
    
    // Set blocks after all other state is set
    setBlocks(contents);
    
    // Minor delay to ensure smooth transition
    pageChangeTimeoutRef.current = setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  // Helper to navigate to the previous page
  const handlePrevPage = () => {
    if (currentPage > 1 && !loading) {
      // Clear any existing timeout
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
      }
      
      // Update page immediately
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  // Helper to navigate to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages && !loading) {
      // Clear any existing timeout
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
      }
      
      // Update page immediately 
      setCurrentPage(prevPage => prevPage + 1);
    }
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
  
  // Function to handle image load
  const handleImageLoad = (blockId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    
    // Small timeout to ensure the transition is smooth
    setTimeout(() => {
      setImageStates(prev => ({
        ...prev,
        [blockId]: {
          ...prev[blockId],
          loaded: true,
          width: img.naturalWidth,
          height: img.naturalHeight
        }
      }));
    }, 50); // Small delay for smoother transition
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
        ) : blocks.length === 0 ? (
          <div className="text-center py-8">No images found</div>
        ) : (
          <>            
            <div className="relative">
              {blocks.map((block) => {
                const offset = offsets[block.id]?.offset || 0;
                const username = block.user?.username || 'anonymous';
                const date = formatDate(block.updated_at);
                const imageState = imageStates[block.id] || { loaded: false, width: 800, height: 600 };
                
                return (
                  <div 
                    key={block.id} 
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
                          className={`w-full h-auto image-fade ${imageState.loaded ? 'loaded' : ''}`}
                          onLoad={(e) => handleImageLoad(block.id, e)}
                          loading="lazy"
                        />
                        <div 
                          className="placeholder"
                          style={{
                            paddingBottom: `${(imageState.height / imageState.width) * 100}%`,
                            backgroundColor: '#ffffff'
                          }}
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      submitted by {username} – {date}
                    </p>
                  </div>
                );
              })}
            </div>
            
            {/* Pagination controls - always show for testing */}
            <div className="pagination">
              <div className="flex flex-col items-center mt-8">
                <div className="pagination-buttons flex items-center justify-between w-full">
                  <p className="text-sm text-gray-600" style={{ margin: 0 }}>
                    A project by <a href="http://benjaminikoma.be/" target="_blank" rel="noopener noreferrer" className="underline">Benjamin Ikoma</a>
                  </p>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1 || loading}
                      className={`pagination-btn ${(currentPage === 1 || loading) ? 'opacity-50 cursor-not-allowed' : 'underline'}`}
                    >
                      Previous
                    </button>
                    <span className="pagination-info text-gray-600">
                      {currentPage}/{totalPages}
                    </span>
                    <button 
                      onClick={handleNextPage} 
                      disabled={currentPage === totalPages || loading}
                      className={`pagination-btn ${(currentPage === totalPages || loading) ? 'opacity-50 cursor-not-allowed' : 'underline'}`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="w-32"></div> {/* Spacer for balance */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
} 
'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import './image-placeholder.css';
import './fonts.css';
import { useRouter } from 'next/navigation';

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

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
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
  
  // Use passed in initialPage value
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Check for query params and convert to clean URLs for the browser display
  useEffect(() => {
    // Get the current URL and pathname
    const url = new URL(window.location.href);
    const pathname = url.pathname;
    const pageParam = url.searchParams.get('page');
    
    // If we have a page query param, update browser URL to clean format
    // This doesn't cause a navigation, just updates the address bar
    if (pathname === '/' && pageParam) {
      const pageNum = parseInt(pageParam, 10);
      if (!isNaN(pageNum) && pageNum > 1) {
        window.history.replaceState(null, '', `/page/${pageNum}`);
      } else if (!isNaN(pageNum) && pageNum === 1) {
        window.history.replaceState(null, '', '/');
      }
    }
  }, []);

  // Update URL when page changes to use clean URLs
  useEffect(() => {
    if (currentPage === 1) {
      // Update the browser URL to / but keep current internal URL
      window.history.replaceState(null, '', '/');
    } else {
      // Update the browser URL to /page/X but keep current internal URL
      window.history.replaceState(null, '', `/page/${currentPage}`);
    }
  }, [currentPage]);

  useEffect(() => {
    // Get channel info first to get total count
    fetchChannelInfo();
    // Then fetch the actual page contents
    fetchData(currentPage);
  }, [currentPage]);

  // Add effect to scroll to top when page changes - immediate scroll
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
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

  const fetchChannelInfo = async () => {
    try {
      // Get channel info to determine total count
      const channelResponse = await axios.get<ChannelResponse>('https://api.are.na/v2/channels/found-fonts-foundry');
      const channelData = channelResponse.data;
      
      if (channelData && typeof channelData.length === 'number') {
        const totalItems = channelData.length;
        setTotalCount(totalItems);
        
        // Calculate total pages based on accurate item count
        const calculatedTotalPages = Math.ceil(totalItems / perPage);
        setTotalPages(calculatedTotalPages);
      }
    } catch (error) {
      console.error('Error fetching channel info:', error);
    }
  };

  const fetchData = async (page: number) => {
    try {
      setLoading(true);
      // Use pagination parameters as per Arena API docs - page and per
      const response = await axios.get(`https://api.are.na/v2/channels/found-fonts-foundry/contents?page=${page}&per=${perPage}&sort=position&direction=desc`);
      
      // Extract pagination metadata from response
      const data = response.data as ArenaResponse;
      
      // Get correct total pages from API response or calculate it
      const totalItems = data.length || 46; // Fall back to 46 if not provided
      setTotalCount(totalItems);
      
      const calculatedTotalPages = Math.ceil(totalItems / perPage);
      
      setTotalPages(data.total_pages || calculatedTotalPages);
      
      const contents = data.contents || [];
      
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
      setTimeout(() => {
        setLoading(false);
      }, 800);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load images. Please try again later.');
      setLoading(false);
    }
  };

  // Helper to navigate to the previous page
  const handlePrevPage = () => {
    if (currentPage > 1 && !loading) {
      setLoading(true);
      // Use a longer delay to ensure loading screen is visible before navigation
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
      }, 200);
    }
  };

  // Helper to navigate to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages && !loading) {
      setLoading(true);
      // Use a longer delay to ensure loading screen is visible before navigation
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
      }, 200);
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
    setImageStates(prev => ({
      ...prev,
      [blockId]: {
        ...prev[blockId],
        loaded: true,
        width: img.naturalWidth,
        height: img.naturalHeight
      }
    }));
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
            marginBottom: '0.1em', 
            marginTop: 0,
            fontFamily: `'${randomFont}', sans-serif`
          }}>
            Found Fonts Foundry
          </h1>
          <p className="text-base text-gray-700" style={{ marginBottom: '2em' }}>
            A growing collection ({totalCount}) of fonts discovered on the street, in the wild and everywhere in between.<br />
            Add your own finds via our <a href="https://www.are.na/benjamin-ikoma/found-fonts-foundry" target="_blank" rel="noopener noreferrer" className="underline">Are.na</a> channel.
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
                        />
                        <div 
                          className="placeholder"
                          style={{
                            paddingBottom: `${(imageState.height / imageState.width) * 100}%`,
                            backgroundColor: '#f0f0f0'
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
                      className={`pagination-btn ${(currentPage === 1 || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Previous
                    </button>
                    <span className="pagination-info text-gray-600">
                      {currentPage}/{totalPages}
                    </span>
                    <button 
                      onClick={handleNextPage} 
                      disabled={currentPage === totalPages || loading}
                      className={`pagination-btn ${(currentPage === totalPages || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
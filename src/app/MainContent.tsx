'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
}

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
  // State management
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<{[key: string]: {offset: number}}>({});
  const [hasMore, setHasMore] = useState(true);
  const [perPage] = useState(30);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  
  // State for randomly selected font
  const [randomFont, setRandomFont] = useState<string>('Cooper Black');
  
  // References
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set());
  
  // Direct API call without caching
  const fetchData = async (isLoadMore = false) => {
    try {
      const nextPage = isLoadMore ? page + 1 : 1;
      console.log(`🔄 Fetching data for page ${nextPage}`);
      
      if (!isLoadMore) {
        setLoading(true);
      }
      
      setError(null);
      
      // Make a direct API call to Arena
      const apiUrl = `https://api.are.na/v2/channels/found-fonts-foundry/contents`;
      const response = await axios.get<ArenaResponse>(apiUrl, {
        params: {
          page: nextPage,
          per: perPage,
          direction: 'desc', // Load newest items first
          sort: 'position',
          timestamp: Date.now() // Prevent caching
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const responseData = response.data;
      console.log(`📊 Received ${responseData.contents?.length || 0} items`);
      
      if (!responseData.contents || responseData.contents.length === 0) {
        console.warn('No content found');
        setHasMore(false);
        setLoadingMore(false);
        return;
      }
      
      // Process the blocks
      processBlocks(responseData.contents, isLoadMore, nextPage);
      
      // Update total count from the API response
      setTotalCount(responseData.length || 0);
      
      // Update page number
      setPage(nextPage);
      loadedPagesRef.current.add(nextPage);
      
      // Check if we have more pages
      setHasMore(responseData.contents.length >= perPage);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load images. Please try again.');
      if (!isLoadMore) {
        setBlocks([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Process blocks and assign offsets
  const processBlocks = (contents: any[], isLoadMore: boolean, currentPage: number) => {
    // Create offset pattern
    const offsetValues = [0, 10, 20, 30, 40, 50];
    const newOffsets: {[key: string]: {offset: number}} = {};
    
    contents.forEach((block, index) => {
      const offsetIndex = index % offsetValues.length;
      newOffsets[block.id] = { offset: offsetValues[offsetIndex] };
    });
    
    // Update offsets
    setOffsets(prev => ({
      ...prev,
      ...newOffsets
    }));
    
    // Update blocks
    setBlocks(prev => {
      const newBlocks = contents.map((block, index) => ({
        ...block,
        _key: `${block.id}-${currentPage}-${index}-${Date.now()}`,
        _index: isLoadMore ? prev.length + index : index
      }));
      
      return isLoadMore ? [...prev, ...newBlocks] : newBlocks;
    });
  };

  // Load more items
  const loadMoreItems = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    console.log('Loading more items...');
    setLoadingMore(true);
    fetchData(true);
  }, [loadingMore, hasMore]);

  // Intersection observer setup
  const lastBlockElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore) {
        loadMoreItems();
      }
    }, {
      rootMargin: '300px'
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [loadingMore, hasMore, loadMoreItems]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Set random font on mount
  useEffect(() => {
    const fonts = [
      'Cooper Black',
      'Boecklins Universe',
      'Brush Script',
      'Davida Bold',
      'Papyrus',
      'Comic Sans Bold',
      'Choc',
      'Arial Black'
    ];
    setRandomFont(fonts[Math.floor(Math.random() * fonts.length)]);
  }, []);

  // Format date helper
  const formatDate = (updatedAt: string) => {
    if (!updatedAt) return '';
    const date = new Date(updatedAt);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Handle body overflow during loading
  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : '';
  }, [loading]);

  // Update document title
  useEffect(() => {
    if (totalCount > 0) {
      document.title = `Found Fonts Foundry (${totalCount})`;
    }
  }, [totalCount]);

  return (
    <main className="min-h-screen bg-white text-black px-4 py-6" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Loading overlay */}
      <div 
        className={`fixed inset-0 bg-white z-50 flex items-center justify-center transition-opacity duration-300 ${
          loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="text-center">
          <div className="loading-text">searching...</div>
        </div>
      </div>
      
      {/* Main content */}
      <div 
        className={`max-w-5xl mx-auto transition-opacity duration-500 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ 
          marginLeft: '1em', 
          marginRight: '1em', 
          marginTop: '1.25em'
        }}
      >
        {/* Header */}
        <header className="mb-12">
          <h1 className="title" style={{ 
            fontFamily: `'${randomFont}', sans-serif`,
            fontSize: 'clamp(2rem, 5vw, 5rem)'
          }}>
            Found Fonts Foundry
          </h1>
          <p className="text-base text-gray-700" style={{ marginBottom: '2em' }}>
            A growing collection of type found on the street, in the wild and everywhere in between.<br />
            Add your own finds via the <a href="https://www.are.na/benjamin-ikoma/found-fonts-foundry" target='_blank' rel='noopener noreferrer' className='underline'>Are.na channel</a>. 
            <br /><br />A project initiated by <a href="http://benjaminikoma.be/" target="_blank" rel="noopener noreferrer" style={{ color: 'black', textDecoration: 'underline' }}>Benjamin Ikoma</a>
          </p>
        </header>

        {/* Error message */}
        {error && (
          <div className="text-center py-8 text-red-500">{error}</div>
        )}

        {/* No results message */}
        {!loading && blocks.length === 0 && !error && (
          <div className="text-center py-8">No images found</div>
        )}

        {/* Image grid */}
        {blocks.length > 0 && (
          <div className="relative">
            {blocks.map((block, index) => {
              const offset = offsets[block.id]?.offset || 0;
              const username = block.user?.username || 'anonymous';
              const date = formatDate(block.updated_at);
              const isLastBlock = index === blocks.length - 1;
              
              return (
                <div 
                  key={block._key}
                  ref={isLastBlock ? lastBlockElementRef : undefined}
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
                        src={`${block.image.display?.url || block.image.original?.url}?${Date.now()}`}
                        alt="Found font"
                        className="image-fade"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    via <a href={`https://www.are.na/user/${username}`} target='_blank' rel='noopener noreferrer' className='underline'>{username}</a> – {date}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="text-center py-8">
            <div className="loading-more">Loading more fonts...</div>
          </div>
        )}

        {/* Footer */}
      </div>
      
    </main>
  );
} 
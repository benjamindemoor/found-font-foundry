'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './image-placeholder.css';

interface ArenaResponse {
  contents: any[];
  length: number;
  total_pages: number;
  current_page: number;
  per: number;
}

export default function Home() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<{[key: string]: {offset: number}}>({});
  const [imageStates, setImageStates] = useState<{[key: string]: {loaded: boolean, width: number, height: number}}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Function to apply offsets to blocks
  const applyOffsets = (newBlocks: any[]) => {
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
    
    const newOffsetsMap: {[key: string]: {offset: number}} = {};
    const newImageStates: {[key: string]: {loaded: boolean, width: number, height: number}} = {};
    
    newBlocks.forEach((block, index) => {
      // Get offset from the sequence, cycling through the array
      const offsetIndex = index % offsetValues.length;
      const offset = offsetValues[offsetIndex];
      newOffsetsMap[block.id] = { offset };
      
      // Initialize image state
      newImageStates[block.id] = { 
        loaded: false, 
        width: block.image?.display?.width || 800, 
        height: block.image?.display?.height || 600 
      };
    });
    
    setOffsets(prev => ({ ...prev, ...newOffsetsMap }));
    setImageStates(prev => ({ ...prev, ...newImageStates }));
    
    return newBlocks;
  };
  
  const fetchData = async (page = 1, perPage = 20) => {
    try {
      setLoading(page === 1);
      if (page > 1) setLoadingMore(true);
      
      const response = await axios.get(`https://api.are.na/v2/channels/found-font-foundry/contents?page=${page}&per=${perPage}`);
      console.log(`Are.na API response (page ${page}):`, response.data);
      
      const data = response.data as ArenaResponse;
      const newBlocks = data.contents || [];
      
      // Apply offsets to new blocks
      const processedBlocks = applyOffsets(newBlocks);
      
      setBlocks(prev => page === 1 ? processedBlocks : [...prev, ...processedBlocks]);
      setCurrentPage(data.current_page);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load images. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  
  const loadPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loadingMore) {
      window.scrollTo(0, 0);
      fetchData(page);
    }
  };

  // Helper function to render pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers: number[] = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Show current page and pages around it
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(currentPage + 1, totalPages - 1); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    
    // Always show last page if there are more than 1 pages
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    // Sort and add ellipses
    pageNumbers.sort((a, b) => a - b);
    const paginationItems: React.ReactNode[] = [];
    
    for (let i = 0; i < pageNumbers.length; i++) {
      // Add ellipsis if there's a gap
      if (i > 0 && pageNumbers[i] - pageNumbers[i - 1] > 1) {
        paginationItems.push(
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
        );
      }
      
      // Add page number
      paginationItems.push(
        <button
          key={pageNumbers[i]}
          onClick={() => loadPage(pageNumbers[i])}
          className={`pagination-item ${pageNumbers[i] === currentPage ? 'active' : ''}`}
          disabled={pageNumbers[i] === currentPage || loadingMore}
        >
          {pageNumbers[i]}
        </button>
      );
    }
    
    return (
      <div className="pagination">
        <button 
          className="pagination-arrow" 
          onClick={() => loadPage(currentPage - 1)}
          disabled={currentPage === 1 || loadingMore}
        >
          &larr;
        </button>
        {paginationItems}
        <button 
          className="pagination-arrow" 
          onClick={() => loadPage(currentPage + 1)}
          disabled={currentPage === totalPages || loadingMore}
        >
          &rarr;
        </button>
      </div>
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    <main className="min-h-screen bg-black text-white px-0 py-6 pb-16">
      <div 
        className="mx-auto relative" 
        style={{ 
          marginLeft: 'clamp(1em, 5vw, 2em)', 
          marginRight: 'clamp(1em, 5vw, 2em)', 
          marginTop: 'clamp(1em, 3vw, 1.5em)',
          maxWidth: '1200px'
        }}
      >
        <header className="mb-8 md:mb-12">
          <h1 
            className="text-4em md:text-5em font-normal" 
            style={{ 
              marginBottom: '0em', 
              marginTop: 0, 
              lineHeight: 'clamp(0.95, 0.95, 1.1)' 
            }}
          >
            Found Font Foundry
          </h1>
          <p className="text-base" style={{ marginBottom: 'clamp(1em, 5vw, 2em)' }}>
            A growing collection of fonts discovered in the wild and everywhere in between.<br />
            Add your own finds via <a href="https://www.are.na/benjamin-ikoma/found-font-foundry" target="_blank" rel="noopener noreferrer" className="underline">Are.na</a>.
          </p>
        </header>

        {loading && blocks.length === 0 ? (
          <div className="fixed-center">Loading images...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-8">No images found</div>
        ) : (
          <div className="relative">
            {[...blocks].reverse().map((block) => {
              const offset = offsets[block.id]?.offset || 0;
              const username = block.user?.username || 'anonymous';
              const date = formatDate(block.updated_at);
              const imageState = imageStates[block.id] || { loaded: false, width: 800, height: 600 };
              
              // Calculate offset for mobile (smaller or no offset)
              const mobileOffset = Math.min(offset, 25); 
              
              return (
                <div 
                  key={block.id}
                  style={{
                    marginLeft: `clamp(0%, ${mobileOffset}%, ${offset}%)`,
                    width: `clamp(85%, calc(100% - ${mobileOffset}% * 2), 50%)`,
                    marginBottom: 'clamp(1.5em, 4vw, 2em)'
                  }}
                  className="block-container"
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
                          backgroundColor: '#333'
                        }}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-400 mt-1">
                    submitted by {username} – {date}
                  </p>
                </div>
              );
            })}
            
            {!loading && blocks.length > 0 && (
              <div className="pagination-container">
                {renderPagination()}
                
                {loadingMore && (
                  <div className="loading-indicator">
                    <p>Loading page {currentPage}...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div 
          className="fixed-bottom-right" 
          style={{ 
            bottom: 'clamp(0.75em, 3vw, 2em)', 
            right: 'clamp(0.75em, 3vw, 2em)' 
          }}
        >
          <p className="text-sm text-gray-400 mix-blend-difference" style={{ margin: 0 }}>
            A project by <a href="http://benjaminikoma.be/" target="_blank" rel="noopener noreferrer" className="underline">Benjamin Ikoma</a>
          </p>
        </div>
      </div>
    </main>
  );
} 
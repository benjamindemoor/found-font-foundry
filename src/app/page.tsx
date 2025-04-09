'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import './image-placeholder.css';

interface ArenaResponse {
  contents: any[];
}

export default function Home() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offsets, setOffsets] = useState<{[key: string]: {offset: number}}>({});
  const [imageStates, setImageStates] = useState<{[key: string]: {loaded: boolean, width: number, height: number}}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://api.are.na/v2/channels/found-font-foundry/contents');
        console.log('Are.na API response:', response.data);
        const contents = (response.data as ArenaResponse).contents || [];
        setBlocks(contents);
        
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
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load images. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
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
    <main className="min-h-screen bg-black text-white px-4 py-6 pb-16">
      <div className="max-w-5xl mx-auto" style={{ marginLeft: '2em', marginRight: '2em', marginTop: '1.5em' }}>
        <header className="mb-12">
          <h1 className="text-5em font-normal" style={{ marginBottom: '0em', marginTop: 0 }}>
            Found Font Foundry
          </h1>
          <p className="text-base" style={{ marginBottom: '2em' }}>
            A growing collection of fonts discovered in the wild and everywhere in between.<br />
            Add your own finds via <a href="https://www.are.na/benjamin-ikoma/found-font-foundry" target="_blank" rel="noopener noreferrer" className="underline">Are.na</a>.
          </p>
        </header>

        {loading ? (
          <div className="fixed-center">Loading images...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : blocks.length === 0 ? (
          <div className="text-center py-8">No images found</div>
        ) : (
          <div className="relative">
            {blocks.map((block) => {
              const offset = offsets[block.id]?.offset || 0;
              const username = block.user?.username || 'anonymous';
              const date = formatDate(block.updated_at);
              const imageState = imageStates[block.id] || { loaded: false, width: 800, height: 600 };
              
              return (
                <div 
                  key={block.id} 
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
          </div>
        )}
        
        <div className="fixed-bottom-right">
          <p className="text-sm text-gray-400 mix-blend-difference" style={{ margin: 0 }}>
            A project by <a href="http://benjaminikoma.be/" target="_blank" rel="noopener noreferrer" className="underline">Benjamin Ikoma</a>
          </p>
        </div>
      </div>
    </main>
  );
} 
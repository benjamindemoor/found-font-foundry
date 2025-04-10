'use client';

import { useState, useEffect } from 'react';

export default function TimeAgo() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState<string>('just now');
  
  useEffect(() => {
    // Helper function to format the time ago
    const getTimeAgo = (date: Date): string => {
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (seconds < 60) {
        return 'just now';
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(seconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      }
    };
    
    // Update the time ago text initially
    setTimeAgo(getTimeAgo(lastUpdated));
    
    // Update the time ago text every minute
    const intervalId = setInterval(() => {
      setTimeAgo(getTimeAgo(lastUpdated));
    }, 60000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [lastUpdated]);
  
  return (
    <div className="fixed bottom-2 right-2 text-xs text-gray-400">
      Updated: {timeAgo}
    </div>
  );
} 
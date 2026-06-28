/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';

type WatchlistMovie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
};

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cinesense_watchlist');
      if (stored) {
        setWatchlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load watchlist from localStorage:", e);
    }
  }, []);

  // Check if a movie is in the watchlist
  const isInWatchlist = (title: string) => {
    return watchlist.some(movie => movie.title === title);
  };

  // Toggle watchlist status
  const toggleWatchlist = (movie: WatchlistMovie) => {
    setWatchlist(prev => {
      let newWatchlist;
      if (prev.some(m => m.title === movie.title)) {
        // Remove
        newWatchlist = prev.filter(m => m.title !== movie.title);
      } else {
        // Add
        newWatchlist = [...prev, movie];
      }
      
      // Save to localStorage
      try {
        localStorage.setItem('cinesense_watchlist', JSON.stringify(newWatchlist));
      } catch (e) {
        console.error("Failed to save watchlist to localStorage:", e);
      }
      
      return newWatchlist;
    });
  };

  return { watchlist, isInWatchlist, toggleWatchlist };
}

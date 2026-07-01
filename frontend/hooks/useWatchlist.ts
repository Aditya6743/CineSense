import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../utils/supabase';

type WatchlistMovie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  id?: number;
};

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const { user, setAuthModalOpen } = useAuth();
  const [loading, setLoading] = useState(false);

  // Load from Supabase on mount or when user changes
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    const fetchWatchlist = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('watchlists')
          .select('movie_data')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          setWatchlist(data.map((row: any) => row.movie_data as WatchlistMovie));
        }
      } catch (e) {
        console.error("Failed to fetch watchlist from Supabase:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [user]);

  // Check if a movie is in the watchlist
  const isInWatchlist = (title: string) => {
    return watchlist.some(movie => movie.title === title);
  };

  // Toggle watchlist status
  const toggleWatchlist = async (movie: WatchlistMovie) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Determine pseudo movie_id from title hash or use standard if we had TMDB ID.
    // For simplicity, we create a pseudo ID from title since TMDB ID isn't always passed
    const movieId = movie.id || movie.title.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);

    const isCurrentlySaved = isInWatchlist(movie.title);

    // Optimistic UI update
    setWatchlist(prev => {
      if (isCurrentlySaved) {
        return prev.filter(m => m.title !== movie.title);
      } else {
        return [...prev, movie];
      }
    });

    try {
      if (isCurrentlySaved) {
        // Remove from DB
        const { error } = await supabase
          .from('watchlists')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movieId);
        if (error) throw error;
      } else {
        // Add to DB
        const { error } = await supabase
          .from('watchlists')
          .insert({
            user_id: user.id,
            movie_id: movieId,
            movie_data: movie
          });
        if (error) throw error;
      }
    } catch (e) {
      console.error("Failed to update watchlist in Supabase:", e);
      // Revert optimistic update
      setWatchlist(prev => {
        if (isCurrentlySaved) return [...prev, movie];
        return prev.filter(m => m.title !== movie.title);
      });
    }
  };

  return { watchlist, isInWatchlist, toggleWatchlist, loading };
}

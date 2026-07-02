import { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthContext';
import { supabase } from '../utils/supabase';

type WatchedMovie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  id?: number;
};

export function useWatched() {
  const [watchedList, setWatchedList] = useState<WatchedMovie[]>([]);
  const { user, setAuthModalOpen } = useAuth();
  const [loading, setLoading] = useState(false);

  // Load from Supabase on mount or when user changes
  useEffect(() => {
    if (!user) {
      setWatchedList([]);
      return;
    }

    const fetchWatched = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('watched_movies')
          .select('movie_data')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        if (data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setWatchedList(data.map((row: any) => row.movie_data as WatchedMovie));
        }
      } catch (e) {
        console.error("Failed to fetch watched list from Supabase:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchWatched();
  }, [user]);

  // Check if a movie is in the watched list
  const isWatched = (title: string) => {
    return watchedList.some(movie => movie.title === title);
  };

  // Toggle watched status
  const toggleWatched = async (movie: WatchedMovie) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Determine pseudo movie_id from title hash or use standard if we had TMDB ID.
    // For simplicity, we create a pseudo ID from title since TMDB ID isn't always passed
    const movieId = movie.id || movie.title.split("").reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);

    const isCurrentlySaved = isWatched(movie.title);

    // Optimistic UI update
    setWatchedList(prev => {
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
          .from('watched_movies')
          .delete()
          .eq('user_id', user.id)
          .eq('movie_id', movieId);
        if (error) throw error;
      } else {
        // Add to DB
        const { error } = await supabase
          .from('watched_movies')
          .insert({
            user_id: user.id,
            movie_id: movieId,
            movie_data: movie
          });
        if (error) throw error;
      }
    } catch (e) {
      console.error("Failed to update watched list in Supabase:", e);
      // Revert optimistic update
      setWatchedList(prev => {
        if (isCurrentlySaved) return [...prev, movie];
        return prev.filter(m => m.title !== movie.title);
      });
    }
  };

  return { watchedList, isWatched, toggleWatched, loading };
}

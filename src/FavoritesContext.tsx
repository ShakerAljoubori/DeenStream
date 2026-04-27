import React, { createContext, useContext, useState } from "react";

interface FavoritesState {
  seriesIds: string[];
  bookIds: string[];
  videoEpisodes: { seriesId: string; episodeId: number }[];
  audioEpisodes: { bookId: string; episodeId: number }[];
}

interface FavoritesContextType extends FavoritesState {
  fetchFavorites: () => Promise<void>;
  clearFavorites: () => void;
  toggleSeries: (seriesId: string) => Promise<void>;
  toggleBook: (bookId: string) => Promise<void>;
  toggleVideoEpisode: (seriesId: string, episodeId: number) => Promise<void>;
  toggleAudioEpisode: (bookId: string, episodeId: number) => Promise<void>;
  isSeriesFavorite: (id: string) => boolean;
  isBookFavorite: (id: string) => boolean;
  isVideoEpisodeSaved: (seriesId: string, episodeId: number) => boolean;
  isAudioEpisodeSaved: (bookId: string, episodeId: number) => boolean;
}

const empty: FavoritesState = {
  seriesIds: [],
  bookIds: [],
  videoEpisodes: [],
  audioEpisodes: [],
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const API = "http://localhost:5000/api/users/favorites";
const headers = (token: string) => ({
  "Content-Type": "application/json",
  "x-auth-token": token,
});

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [fav, setFav] = useState<FavoritesState>(empty);

  const token = () => localStorage.getItem("token");

  const fetchFavorites = async () => {
    const t = token();
    if (!t) return;
    try {
      const res = await fetch(API, { headers: headers(t) });
      if (res.ok) setFav(await res.json());
    } catch {}
  };

  const clearFavorites = () => setFav(empty);

  // Generic toggle that does an optimistic update, calls the endpoint, then syncs
  const toggle = async (
    optimisticUpdate: (prev: FavoritesState) => FavoritesState,
    endpoint: string,
    body: object
  ) => {
    const t = token();
    if (!t) return;
    setFav(optimisticUpdate); // instant UI feedback
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: headers(t),
        body: JSON.stringify(body),
      });
      if (res.ok) setFav(await res.json()); // sync with server truth
      else setFav(fav); // revert on error
    } catch {
      setFav(fav); // revert on network error
    }
  };

  const toggleSeries = (seriesId: string) =>
    toggle(
      (prev) => ({
        ...prev,
        seriesIds: prev.seriesIds.includes(seriesId)
          ? prev.seriesIds.filter((id) => id !== seriesId)
          : [...prev.seriesIds, seriesId],
      }),
      `${API}/series`,
      { seriesId }
    );

  const toggleBook = (bookId: string) =>
    toggle(
      (prev) => ({
        ...prev,
        bookIds: prev.bookIds.includes(bookId)
          ? prev.bookIds.filter((id) => id !== bookId)
          : [...prev.bookIds, bookId],
      }),
      `${API}/books`,
      { bookId }
    );

  const toggleVideoEpisode = (seriesId: string, episodeId: number) =>
    toggle(
      (prev) => {
        const exists = prev.videoEpisodes.some(
          (e) => e.seriesId === seriesId && e.episodeId === episodeId
        );
        return {
          ...prev,
          videoEpisodes: exists
            ? prev.videoEpisodes.filter(
                (e) => !(e.seriesId === seriesId && e.episodeId === episodeId)
              )
            : [...prev.videoEpisodes, { seriesId, episodeId }],
        };
      },
      `${API}/episodes/video`,
      { seriesId, episodeId }
    );

  const toggleAudioEpisode = (bookId: string, episodeId: number) =>
    toggle(
      (prev) => {
        const exists = prev.audioEpisodes.some(
          (e) => e.bookId === bookId && e.episodeId === episodeId
        );
        return {
          ...prev,
          audioEpisodes: exists
            ? prev.audioEpisodes.filter(
                (e) => !(e.bookId === bookId && e.episodeId === episodeId)
              )
            : [...prev.audioEpisodes, { bookId, episodeId }],
        };
      },
      `${API}/episodes/audio`,
      { bookId, episodeId }
    );

  return (
    <FavoritesContext.Provider
      value={{
        ...fav,
        fetchFavorites,
        clearFavorites,
        toggleSeries,
        toggleBook,
        toggleVideoEpisode,
        toggleAudioEpisode,
        isSeriesFavorite: (id) => fav.seriesIds.includes(id),
        isBookFavorite: (id) => fav.bookIds.includes(id),
        isVideoEpisodeSaved: (seriesId, episodeId) =>
          fav.videoEpisodes.some(
            (e) => e.seriesId === seriesId && e.episodeId === episodeId
          ),
        isAudioEpisodeSaved: (bookId, episodeId) =>
          fav.audioEpisodes.some(
            (e) => e.bookId === bookId && e.episodeId === episodeId
          ),
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
};

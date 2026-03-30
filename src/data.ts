export interface Episode {
  id: number;
  title: string;
  duration: string;
  url: string;
}

export interface Series {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  episodes: Episode[];
}

// NEW: Specifically for Audio Episodes
export interface AudioEpisode {
  id: number;
  title: string;
  duration: string;
  url: string;
}

// UPDATED: AudioBook now supports an array of episodes
export interface AudioBook {
  id: string;
  title: string;
  author: string;
  image: string;
  episodes: AudioEpisode[]; // Added this to support the 21 episodes
}

export const allSeries: Series[] = [
  {
    id: "tawheed-01",
    title: "Tawheed - The Three Fundamental Principles",
    category: "Aqeedah",
    instructor: "Sheikh Ahmad Musa Jibril",
    description: "Based on the classical text Al-Usool Ath-Thalaathah. This lesson covers the three questions of the grave.",
    episodes: [
      { id: 1, title: "Episode 1", duration: "29:47", url: "https://dn710607.ca.archive.org/0/items/tawheed.the.three.fundamental.principles/Tawheed_01.mp4" },
      { id: 2, title: "Episode 2", duration: "41:17", url: "https://dn710607.ca.archive.org/0/items/tawheed.the.three.fundamental.principles/Tawheed_02.mp4" },
      { id: 3, title: "Episode 3", duration: "1:11:00", url: "https://ia801301.us.archive.org/11/items/tawheed.the.three.fundamental.principles/Tawheed_03.mp4" }
    ]
  },
];

export const allAudioBooks: AudioBook[] = [
  { 
    id: "book-1", 
    title: "The Lives of the Prophets", 
    author: "Imaam Anwar Al-Awlaki", 
    image: "https://adviceforparadise.com/media/pic-series/Lives_of_the_Prophets.png",
    episodes: [
      { 
        id: 1, 
        title: "Introduction - Story Of Creation", 
        duration: "01:04:27", 
        url: "https://dn721903.ca.archive.org/0/items/TheLivesOfTheProphetsByAnwarAl-Awlaki/01%20-%20Introduction%20-%20Story%20Of%20Creation.mp3" 
      },
      { 
        id: 2, 
        title: "Adam (Cont.) - Idris - Sheeth - Hud A.S.", 
        duration: "01:07:59", 
        url: "https://dn721903.ca.archive.org/0/items/TheLivesOfTheProphetsByAnwarAl-Awlaki/02%20-%20Adam%20%28Cont.%29%20-%20Idris%20-%20Sheeth%20-%20Hud%20A.S..mp3" 
      },
      // You can add Episodes 2-21 here as you go
    ]
  },
  { 
    id: "book-2", 
    title: "Kitab At-Tawheed", 
    author: "Sheikh Ahmad Musa Jibril", 
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
    episodes: [] 
  },
];
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

export const allSeries: Series[] = [
  {
    id: "tawheed-01",
    title: "Tawheed - The Three Fundamental Principles",
    category: "Aqeedah",
    instructor: "Sheikh Ahmad Musa Jibril",
    description: "Based on the classical text Al-Usool Ath-Thalaathah. This lesson covers the three questions of the grave.",
    episodes: [
      { 
        id: 1, 
        title: "Episode 1", 
        duration: "29:47", 
        url: "https://dn710607.ca.archive.org/0/items/tawheed.the.three.fundamental.principles/Tawheed_01.mp4" 
      },
      { 
        id: 2, 
        title: "Episode 2", 
        duration: "41:17", 
        url: "https://dn710607.ca.archive.org/0/items/tawheed.the.three.fundamental.principles/Tawheed_02.mp4" 
      },
      { 
        id: 3, 
        title: "Episode 3", 
        duration: "1:11:00", 
        url: "https://ia801301.us.archive.org/11/items/tawheed.the.three.fundamental.principles/Tawheed_03.mp4" 
      }
    ]
  },
];
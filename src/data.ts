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
    description:
      "Based on the classical text Al-Usool Ath-Thalaathah. This lesson covers the three questions of the grave.",
    episodes: [
      {
        id: 1,
        title: "Episode 1",
        duration: "29:47",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%201%20%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 2,
        title: "Episode 2",
        duration: "41:17",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%202%20%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 3,
        title: "Episode 3",
        duration: "1:11:00",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%203%20%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 4,
        title: "Episode 4",
        duration: "1:20:14",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%204%20%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 5,
        title: "Episode 5",
        duration: "56:57",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%205%20%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 6,
        title: "Episode 6",
        duration: "47:33",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%206%20%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20%20Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 7,
        title: "Episode 7",
        duration: "30:27",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%207%20%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20%20Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 8,
        title: "Episode 8",
        duration: "1:03:55",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%238%20%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20%20Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 9,
        title: "Episode 9",
        duration: "1:17:43",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%239%20%20DAWAH%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20%20Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 10,
        title: "Episode 10",
        duration: "1:04:38",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2310%20%20PATIENCE%20I%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20%20Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 11,
        title: "Episode 11",
        duration: "1:06:50",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2311%20%20PATIENCE%20II%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20%20Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 12,
        title: "Episode 12",
        duration: "1:16:31",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2313%20%28Suret%20Al-Asr%20II%29%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20-%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 13,
        title: "Episode 13",
        duration: "1:16:31",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2313%20%28Suret%20Al-Asr%20II%29%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20-%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 14,
        title: "Episode 14",
        duration: "1:03:56",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2314%20%28The%20Creator%29%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20-%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 15,
        title: "Episode 15",
        duration: "1:05:35",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2315%20%28All-Provider%29%20Explanation%20of%20The%20Three%20Fundamental%20Principles%20-%20Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 16,
        title: "Episode 16",
        duration: "50:00",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2316%20%28Purpose%20%26%20Submission%29%20Explanation%20Of%20The%20Thee%20Fundamental%20Principles%20-%20Sh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 17,
        title: "Episode 17",
        duration: "1:05:53",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2317%28Obedience%20%26%20Consequence%29%20Explanation%20Of%20The%20Thee%20Fundamental%20Principles%20-Sh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 18,
        title: "Episode 18",
        duration: "56:53",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2318%28Shirk%20al-Uluhiyyah%201%29%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Sh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 19,
        title: "Episode 19",
        duration: "57:37",
        url: "https://ia802807.us.archive.org/10/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2319%28Shirk%20al-Uluhiyyah%20II%29%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Sh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 20,
        title: "Episode 20",
        duration: "59:25",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2320%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 21,
        title: "Episode 21",
        duration: "50:46",
        url: "https://ia802807.us.archive.org/10/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2321%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 22,
        title: "Episode 22",
        duration: "57:04",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2322%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 23,
        title: "Episode 23",
        duration: "37:17",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2323%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 24,
        title: "Episode 24",
        duration: "43:11",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2324%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 25,
        title: "Episode 25",
        duration: "1:02:18",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2325%20-%20Sincerity%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 26,
        title: "Episode 26",
        duration: "44:16",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2326%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 27,
        title: "Episode 27",
        duration: "52:06",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2327%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 28,
        title: "Episode 28",
        duration: "1:04:48",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2328%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 29,
        title: "Episode 29",
        duration: "1:05:38",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2329%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 30,
        title: "Episode 30",
        duration: "49:17",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2330%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 31,
        title: "Episode 31",
        duration: "57:09",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2331%20-%20Duaa%27%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 32,
        title: "Episode 32",
        duration: "57:24",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2332%20-%20Fear%20%28Kawf%29%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Jibril.mp4",
      },
      {
        id: 33,
        title: "Episode 33",
        duration: "1:19:52",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2333%20-%20Hope%20%26%20Reliance%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Sh.%20Ahmad%20Jibril.mp4",
      },
      {
        id: 34,
        title: "Episode 34",
        duration: "59:03",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2334%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 35,
        title: "Episode 35",
        duration: "37:29",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2335%20-%20%27Inabah%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 36,
        title: "Episode 36",
        duration: "56:35",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2336%20-%20Isti%27anah%20-%20Explanation%20Of%20The%20Three%20Fundamental%20Principles%20-Shaykh%20Ahmad%20Musa%20Jibril.mp4",
      },
      {
        id: 37,
        title: "Episode 37",
        duration: "1:06:26",
        url: "https://dn710309.ca.archive.org/0/items/TAWHEEDExplanationOfTheThreeFundamentalPrinciples/TAWHEED%20%2337%20-%20Istighatha-Isti%27adha%20-%20Explanation%20Of%20The%203%20Fundamental%20Principles%20-%20Sh.%20Ahmad%20Jibril.mp4",
      },
    ],
  },
];

export const allAudioBooks: AudioBook[] = [
  {
    id: "book-1",
    title: "The Lives of the Prophets",
    author: "Imaam Anwar Al-Awlaki",
    image:
      "https://adviceforparadise.com/media/pic-series/Lives_of_the_Prophets.png",
    episodes: [
      {
        id: 1,
        title: "Introduction - Story Of Creation",
        duration: "01:04:27",
        url: "https://dn721903.ca.archive.org/0/items/TheLivesOfTheProphetsByAnwarAl-Awlaki/01%20-%20Introduction%20-%20Story%20Of%20Creation.mp3",
      },
      {
        id: 2,
        title: "Adam (Cont.) - Idris - Sheeth - Hud A.S.",
        duration: "01:07:59",
        url: "https://dn721903.ca.archive.org/0/items/TheLivesOfTheProphetsByAnwarAl-Awlaki/02%20-%20Adam%20%28Cont.%29%20-%20Idris%20-%20Sheeth%20-%20Hud%20A.S..mp3",
      },
      // You can add Episodes 2-21 here as you go
    ],
  },
  {
    id: "book-2",
    title: "Kitab At-Tawheed",
    author: "Sheikh Ahmad Musa Jibril",
    image:
      "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400",
    episodes: [],
  },
];

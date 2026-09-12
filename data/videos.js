/**
 * NEXUS — Sample Video Data
 * 
 * Consistent data shape for all video entries.
 * This structure is consumed by:
 *   - Home page (current phase — rendered as static HTML)
 *   - Search/Filter phase (Ananya — will use this shape for DOM filtering)
 *   - React phase (Bhaskar — will map this to React component props)
 * 
 * DO NOT change the property names without coordinating with the team.
 */

const NEXUS_VIDEOS = [
  {
    id: "v001",
    title: "Building a Neural Network from Scratch",
    thumbnail: "assets/thumbnails/thumbnail-01.jpg",
    channel: {
      name: "CodeCraft",
      avatar: null, // placeholder — initials "CC"
      color: "#4A90D9"
    },
    duration: "18:42",
    durationSeconds: 1122,
    views: 245000,
    uploadDate: "2026-08-28",
    category: "Technology"
  },
  {
    id: "v002",
    title: "Ultimate Guide to Street Photography",
    thumbnail: "assets/thumbnails/thumbnail-02.jpg",
    channel: {
      name: "FrameLife",
      avatar: null,
      color: "#E67E22"
    },
    duration: "24:15",
    durationSeconds: 1455,
    views: 182000,
    uploadDate: "2026-09-02",
    category: "Photography"
  },
  {
    id: "v003",
    title: "Making the Perfect Sourdough Bread",
    thumbnail: "assets/thumbnails/thumbnail-03.jpg",
    channel: {
      name: "The Kitchen Lab",
      avatar: null,
      color: "#C0392B"
    },
    duration: "32:08",
    durationSeconds: 1928,
    views: 520000,
    uploadDate: "2026-08-22",
    category: "Food"
  },
  {
    id: "v004",
    title: "Exploring Iceland's Hidden Waterfalls",
    thumbnail: "assets/thumbnails/thumbnail-04.jpg",
    channel: {
      name: "Wanderbound",
      avatar: null,
      color: "#27AE60"
    },
    duration: "15:27",
    durationSeconds: 927,
    views: 98000,
    uploadDate: "2026-08-31",
    category: "Travel"
  },
  {
    id: "v005",
    title: "Beginner's Guide to Digital Illustration",
    thumbnail: "assets/thumbnails/thumbnail-05.jpg",
    channel: {
      name: "PixelArtistry",
      avatar: null,
      color: "#8E44AD"
    },
    duration: "41:03",
    durationSeconds: 2463,
    views: 312000,
    uploadDate: "2026-08-05",
    category: "Art & Design"
  },
  {
    id: "v006",
    title: "The Science of Black Holes Explained",
    thumbnail: "assets/thumbnails/thumbnail-06.jpg",
    channel: {
      name: "CosmicScope",
      avatar: null,
      color: "#2980B9"
    },
    duration: "22:51",
    durationSeconds: 1371,
    views: 1200000,
    uploadDate: "2026-08-15",
    category: "Science"
  },
  {
    id: "v007",
    title: "Lo-Fi Beats to Study To — Live Mix",
    thumbnail: "assets/thumbnails/thumbnail-07.jpg",
    channel: {
      name: "ChillHaven",
      avatar: null,
      color: "#F39C12"
    },
    duration: "3:14:22",
    durationSeconds: 11662,
    views: 4800000,
    uploadDate: "2026-09-05",
    category: "Music"
  },
  {
    id: "v008",
    title: "30-Minute Full Body HIIT Workout",
    thumbnail: "assets/thumbnails/thumbnail-08.jpg",
    channel: {
      name: "IronFlow Fitness",
      avatar: null,
      color: "#E74C3C"
    },
    duration: "31:45",
    durationSeconds: 1905,
    views: 890000,
    uploadDate: "2026-09-01",
    category: "Fitness"
  },
  {
    id: "v009",
    title: "How Electric Cars Actually Work",
    thumbnail: "assets/thumbnails/thumbnail-09.jpg",
    channel: {
      name: "TechExplained",
      avatar: null,
      color: "#1ABC9C"
    },
    duration: "19:33",
    durationSeconds: 1173,
    views: 675000,
    uploadDate: "2026-08-26",
    category: "Technology"
  },
  {
    id: "v010",
    title: "Minimalist Apartment Tour — Tokyo",
    thumbnail: "assets/thumbnails/thumbnail-10.jpg",
    channel: {
      name: "SlowLiving",
      avatar: null,
      color: "#D35400"
    },
    duration: "12:18",
    durationSeconds: 738,
    views: 156000,
    uploadDate: "2026-09-03",
    category: "Lifestyle"
  },
  {
    id: "v011",
    title: "Understanding Quantum Computing",
    thumbnail: "assets/thumbnails/thumbnail-11.jpg",
    channel: {
      name: "QuantumByte",
      avatar: null,
      color: "#6C5CE7"
    },
    duration: "28:09",
    durationSeconds: 1689,
    views: 410000,
    uploadDate: "2026-08-30",
    category: "Science"
  },
  {
    id: "v012",
    title: "Cinematic Drone Footage — Swiss Alps",
    thumbnail: "assets/thumbnails/thumbnail-12.jpg",
    channel: {
      name: "SkyAtlas",
      avatar: null,
      color: "#16A085"
    },
    duration: "8:56",
    durationSeconds: 536,
    views: 2100000,
    uploadDate: "2026-08-08",
    category: "Travel"
  }
];

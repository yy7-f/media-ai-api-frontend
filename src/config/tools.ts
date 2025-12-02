// src/config/tools.ts

export type ToolStatus = "live" | "coming-soon";
export type ToolCategory = "Video" | "Audio" | "Captions" | "System" | "Other";

export type Tool = {
  id: string;
  name: string;
  slug: string;
  category: ToolCategory;
  status: ToolStatus;
  short: string;
  sidebarLabel: string;
  showInSidebar?: boolean;
};

export const TOOLS: Tool[] = [
  // ============================
  // LIVE VIDEO TOOLS
  // ============================
  {
    id: "video-trim",
    name: "Trim Video",
    slug: "/tools/video/trim",
    category: "Video",
    status: "live",
    short: "Cut the start/end and keep only the best part of your clip.",
    sidebarLabel: "✂️ Trim",
  },
  {
    id: "video-crop",
    name: "Crop Video",
    slug: "/tools/video/crop",
    category: "Video",
    status: "live",
    short: "Crop to a region or aspect ratio for TikTok, Reels, YouTube, etc.",
    sidebarLabel: "🖼️ Crop",
  },
  {
    id: "video-resize",
    name: "Resize Video",
    slug: "/tools/video/resize",
    category: "Video",
    status: "live",
    short: "Resize videos to common presets or custom dimensions.",
    sidebarLabel: "📐 Resize",
  },
  {
    id: "video-speed",
    name: "Change Speed",
    slug: "/tools/video/speed",
    category: "Video",
    status: "live",
    short: "Speed up or slow down your video.",
    sidebarLabel: "⏩ Speed",
  },
  {
    id: "video-rotate",
    name: "Rotate Video",
    slug: "/tools/video/rotate",
    category: "Video",
    status: "live",
    short: "Fix sideways or upside-down videos with one click.",
    sidebarLabel: "↩️ Rotate",
  },
  {
    id: "video-shuffle",
    name: "Shuffle Clips",
    slug: "/tools/video/shuffle",
    category: "Video",
    status: "live",
    short: "Randomize or reorder segments for quick shuffle edits.",
    sidebarLabel: "🔀 Shuffle",
  },
  {
    id: "video-concat",
    name: "Concat Videos",
    slug: "/tools/video/concat",
    category: "Video",
    status: "live",
    short: "Merge multiple clips into one seamless video.",
    sidebarLabel: "➕ Concat",
  },
  {
    id: "video-color",
    name: "Video Color",
    slug: "/tools/video/color",
    category: "Video",
    status: "live",
    short: "Apply color filters or LUT-style looks for consistent style.",
    sidebarLabel: "🎨 Color",
  },
  {
    id: "video-watermark",
    name: "Watermark",
    slug: "/tools/video/watermark",
    category: "Video",
    status: "live",
    short: "Overlay a logo/watermark with control over position and opacity.",
    sidebarLabel: "💧 Watermark",
  },

  // ============================
  // AUDIO TOOLS
  // ============================

  // Only normalize is LIVE
  {
    id: "audio-normalize",
    name: "Audio Normalize",
    slug: "/tools/audio-normalize",
    category: "Audio",
    status: "live",
    short: "Normalize loudness for consistent audio levels.",
    sidebarLabel: "🔉 Normalize",
  },

  // Audio Mix → COMING SOON
  {
    id: "audio-mix",
    name: "Audio Mix",
    slug: "/tools/audio-mix",
    category: "Audio",
    status: "coming-soon",
    short: "Combine multiple audio tracks (voice + BGM, etc.).",
    sidebarLabel: "🎚️ Audio Mix",
  },

  // ============================
  // CAPTIONS TOOLS
  // ============================

  // Captions Burn-in → COMING SOON
  {
    id: "captions-burn",
    name: "Captions Burn-in",
    slug: "/tools/captions/burn",
    category: "Captions",
    status: "coming-soon",
    short: "Burn SRT/VTT subtitles directly into your video.",
    sidebarLabel: "💬 Captions Burn-in",
  },

  // ============================
  // COMING SOON FEATURES
  // ============================
  {
    id: "video-overlay-text",
    name: "Text Overlay",
    slug: "/tools/video/overlay-text",
    category: "Video",
    status: "coming-soon",
    short: "Burn arbitrary text onto your video for titles and callouts.",
    sidebarLabel: "📝 Text Overlay",
  },
  {
    id: "video-inpaint",
    name: "Video Inpaint",
    slug: "/tools/video/inpaint",
    category: "Video",
    status: "coming-soon",
    short: "Erase unwanted objects from video frames using AI.",
    sidebarLabel: "🧠 Video Inpaint",
  },
  {
    id: "video-stabilize",
    name: "Video Stabilizer",
    slug: "/tools/video/stabilize",
    category: "Video",
    status: "coming-soon",
    short: "Stabilize shaky footage for smoother viewing.",
    sidebarLabel: "🛠️ Stabilize",
  },
  {
    id: "audio-denoise",
    name: "Audio Denoise",
    slug: "/tools/audio/denoise",
    category: "Audio",
    status: "coming-soon",
    short: "Reduce background noise and hiss from recordings.",
    sidebarLabel: "🔉 Denoise (AI)",
  },
  {
    id: "audio-transcribe",
    name: "Transcribe Audio",
    slug: "/tools/audio/transcribe",
    category: "Audio",
    status: "coming-soon",
    short: "Transcribe speech audio into text.",
    sidebarLabel: "🗣️ Transcribe",
  },
  {
    id: "captions-translate",
    name: "Caption Translate",
    slug: "/tools/captions/translate",
    category: "Captions",
    status: "coming-soon",
    short: "Translate captions into other languages.",
    sidebarLabel: "🌐 Translate Captions",
  },
  {
    id: "jobs-dashboard",
    name: "Jobs Dashboard",
    slug: "/tools/jobs",
    category: "System",
    status: "coming-soon",
    short: "Inspect and manage background jobs and queue state.",
    sidebarLabel: "📊 Jobs Dashboard",
    showInSidebar: false,
  },
];

export const CATEGORY_ORDER: ToolCategory[] = [
  "Video",
  "Audio",
  "Captions",
  "System",
  "Other",
];

// Authentication
export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// Image Generation
export const GENERATION_STYLES = [
  "Editorial",
  "Commercial",
  "Artistic",
  "Casual",
  "Glamour",
  "Vintage",
] as const;

export const CAMERA_ANGLES = [
  "Eye Level",
  "High Angle",
  "Low Angle",
  "Dutch Angle",
  "Over Shoulder",
  "Three Quarter",
  "Profile",
  "Close Up",
] as const;

export const LIGHTING_OPTIONS = [
  "Natural Light",
  "Studio Light",
  "Dramatic Light",
  "Soft Light",
  "Backlight",
  "Golden Hour",
] as const;

export const MAX_IMAGES_PER_GENERATION = 8;
export const MIN_IMAGES_PER_GENERATION = 1;
export const DEFAULT_ASPECT_RATIO = "portrait" as const;
export const VALID_ASPECT_RATIOS = ["portrait", "landscape", "square"] as const;

// Generation History
export const DEFAULT_GENERATION_HISTORY_LIMIT = 50;
export const GENERATION_POLL_INTERVAL_MS = 2000; // 2 seconds

// Constraints
export const MAX_PROMPT_LENGTH = 500;
export const MIN_PROMPT_LENGTH = 1;

// UI Dimensions (in pixels)
export const GENERATION_THUMBNAIL_SIZE = 80;
export const IMAGE_PREVIEW_ASPECT_RATIO = 0.75; // 3:4 portrait

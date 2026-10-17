export type razorboxMediaType = 'image' | 'video' | 'html5' | 'youtube' | 'vimeo' | 'html' | 'iframe' | 'map' | 'pdf';

export interface razorboxItem {
  src?: string;
  /** Trusted markup for a programmatically opened HTML item; or src:'#id' for existing DOM. */
  html?: string;
  type?: razorboxMediaType;
  poster?: string;
  /** Optional Google Maps /maps/embed URL (without requiring mapApiKey). */
  embedSrc?: string;
  thumb?: string;
  caption?: string;
  alt?: string;
}

export interface razorboxEvent {
  instance: razorbox;
  index: number;
  item: razorboxItem & { type: 'image' | 'video' | 'youtube' | 'vimeo' | 'html' | 'iframe' | 'map' | 'pdf'; thumb: string; poster: string; embedSrc: string; caption: string; alt: string; };
  length: number;
}

export interface razorboxOptions {
  selector?: string;
  root?: Document | Element | ShadowRoot;
  loop?: boolean;
  thumbnails?: boolean;
  thumbsOpen?: boolean;
  slideshow?: boolean;
  autoplay?: boolean;
  slideshowInterval?: number;
  zoom?: boolean;
  /** Zoom control magnification, default 2x. Clicking again returns to fit. */
  zoomFactor?: number;
  /** Maximum zoom from wheel, trackpad pinch and touch gestures, default 8x. */
  maxZoom?: number;
  /** Enable mouse wheel and Mac trackpad zoom, default true. */
  wheelZoom?: boolean;
  fullscreen?: boolean;
  keyboard?: boolean;
  closeOnBackdrop?: boolean;
  captionHtml?: boolean;
  preload?: number;
  transition?: 'fade' | 'slide';
  transitionDuration?: number;
  videoAutoplay?: boolean;
  videoMuted?: boolean;
  /** true (default): if the browser refuses audible YouTube autoplay, start the video muted instead of showing the play button. */
  videoMutedFallback?: boolean;
  /** true (default): YouTube privacy-enhanced embed domain and Vimeo dnt=1. */
  videoPrivacy?: boolean;
  /** Google Maps Embed API key (prefer a referrer-restricted key for production). */
  mapApiKey?: string;
  /** 'auto' detects <html lang> first, then browser languages. Supports en, de, fr. */
  locale?: 'auto' | 'en' | 'de' | 'fr' | (string & {});
  /** Overrides individual localized labels, placeholders: {number}, {type}, {total}, {alt}. */
  l10n?: Record<string, string>;
  /** Dark (default), light, or follow prefers-color-scheme. */
  theme?: 'dark' | 'light' | 'auto';
  onOpen?: (event: razorboxEvent) => void;
  onChange?: (event: razorboxEvent) => void;
  onClose?: (event: razorboxEvent) => void;
}

export declare class razorbox {
  static activeInstance: razorbox | null;
  static bind(selector?: string, options?: razorboxOptions): razorbox;
  constructor(selector?: string | razorboxOptions, options?: razorboxOptions);
  readonly selector: string;
  readonly locale: string;
  readonly options: razorboxOptions;
  readonly isOpen: boolean;
  readonly isPlaying: boolean;
  readonly index: number;
  readonly items: razorboxEvent['item'][];
  open(items: Array<razorboxItem | string>, startIndex?: number): boolean;
  close(immediate?: boolean): void;
  next(): void;
  prev(): void;
  goTo(index: number): void;
  play(): void;
  pause(): void;
  togglePlay(): void;
  toggleThumbnails(): void;
  toggleZoom(): void;
  toggleFullscreen(): Promise<void>;
  destroy(): void;
}

export default razorbox;

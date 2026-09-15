export type GalleryState = "loading" | "ready" | "error";

export type MountDisposer = () => void;

export interface GalleryItem {
  src: string;
  title?: string;
}

export interface CommonMountOptions {
  items?: GalleryItem[];
  maxDpr?: number;
}

export interface ArcVariantOptions extends CommonMountOptions {
  variant: "arc";
}

export interface SpiralVariantOptions extends CommonMountOptions {
  variant: "spiral";
}

export type GalleryVariantOptions = ArcVariantOptions | SpiralVariantOptions;

export type ArcMountOptions = CommonMountOptions;
export type SpiralMountOptions = CommonMountOptions;

export interface SourceItem {
  imageUrl: string;
  title: string;
}

export interface LoadedItem extends SourceItem {
  imageElement: HTMLImageElement | null;
  imageLoadError: unknown | null;
}

export interface FrameState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  time: number;
  width: number;
  height: number;
  reducedMotion: boolean;
}

export interface CanvasAnimationOptions {
  key: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  renderFrame: (state: FrameState) => void;
  maxDpr?: number;
}

export interface ArcRendererSettings {
  slots: number;
  speed: number;
  radiusScale: number;
  cardBaseScale: number;
  cardMinScale: number;
  cardMaxBonus: number;
  cardFocusPower: number;
  titleScale: number;
  titleOffsetY: number;
  titleMaxWidth: number;
  edgeFadeStart: number;
  edgeFadePower: number;
}

export interface SpiralRendererSettings {
  speed: number;
  turns: number;
  cardScale: number;
  cardGrowthScale: number;
  radiusScale: number;
  alphaScale: number;
}

export type GalleryVariantConfig =
  | { variant: "arc"; settings: ArcRendererSettings }
  | { variant: "spiral"; settings: SpiralRendererSettings };

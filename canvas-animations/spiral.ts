import type {
  CanvasAnimationOptions,
  GalleryItem,
  LoadedItem,
  MountDisposer,
  SourceItem,
  SpiralMountOptions,
  SpiralRendererSettings,
} from "./core/types.ts";

const SPIRAL_KEY_PREFIX = "spiral:";
const pendingMounts = new Map<string, symbol>();
const activeAnimations = new Map<string, MountDisposer>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();

const spiralCoverUrls = [
  new URL("./assets/spiral/14-fevralya.webp", import.meta.url).href,
  new URL("./assets/spiral/techno.webp", import.meta.url).href,
  new URL("./assets/spiral/unknown-blue-flare.webp", import.meta.url).href,
  new URL("./assets/spiral/hip-hop-classic.webp", import.meta.url).href,
  new URL("./assets/spiral/phonk.webp", import.meta.url).href,
  new URL("./assets/spiral/club-hits.webp", import.meta.url).href,
  new URL("./assets/spiral/remiksy.webp", import.meta.url).href,
  new URL("./assets/spiral/novaya-shkola.webp", import.meta.url).href,
  new URL("./assets/spiral/indie-dance.webp", import.meta.url).href,
  new URL("./assets/spiral/hyper-pop.webp", import.meta.url).href,
  new URL("./assets/spiral/khity-russian.webp", import.meta.url).href,
] as const;

const normalizeItems = (items: readonly GalleryItem[]): SourceItem[] =>
  items
    .filter((item) => Boolean(item?.src))
    .map((item) => ({
      imageUrl: String(item.src),
      title: item.title == null ? "" : String(item.title),
    }));

const config: SpiralRendererSettings = {
  speed: 0.00004,
  turns: 1.5,
  cardScale: 0.25,
  cardGrowthScale: 1.5,
  radiusScale: 0.4,
  alphaScale: 2,
};

const noop: MountDisposer = () => {};

const getAnimationKey = (canvasId: string): string => `${SPIRAL_KEY_PREFIX}${canvasId}`;

const beginMount = (key: string): symbol => {
  const token = Symbol(key);
  pendingMounts.set(key, token);
  disposeCanvasAnimation(key);
  return token;
};

const isCurrentMount = (key: string, token: symbol): boolean => pendingMounts.get(key) === token;

const abortMount = (key: string, token: symbol): MountDisposer => {
  if (isCurrentMount(key, token)) pendingMounts.delete(key);
  return noop;
};

const completeMount = (key: string, token: symbol, dispose: MountDisposer): MountDisposer => () => {
  if (isCurrentMount(key, token)) pendingMounts.delete(key);
  dispose();
};

const getDevicePixelRatio = (maxDpr?: number): number => {
  const deviceDpr = Math.max(1, globalThis.devicePixelRatio || globalThis.window?.devicePixelRatio || 1);
  if (typeof maxDpr !== "number" || !Number.isFinite(maxDpr) || maxDpr <= 0) return deviceDpr;
  return Math.min(deviceDpr, Math.max(1, maxDpr));
};

const resizeCanvasToDisplaySize = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dpr = getDevicePixelRatio(),
): boolean => {
  const width = Math.max(1, Math.round((canvas.clientWidth || 0) * dpr));
  const height = Math.max(1, Math.round((canvas.clientHeight || 0) * dpr));
  const changed = canvas.width !== width || canvas.height !== height;
  if (changed) {
    canvas.width = width;
    canvas.height = height;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return changed;
};

const disposeCanvasAnimation = (key: string): void => {
  const dispose = activeAnimations.get(key);
  if (dispose) dispose();
};

const disposeCanvasAnimationsByPrefix = (prefix: string): void => {
  [...activeAnimations.keys()].forEach((key) => {
    if (key.startsWith(prefix)) disposeCanvasAnimation(key);
  });
};

const createCanvasAnimation = ({ key, canvas, ctx, renderFrame, maxDpr }: CanvasAnimationOptions): MountDisposer => {
  disposeCanvasAnimation(key);

  let disposed = false;
  let frameId: number | undefined;
  let running = false;
  let reducedMotion = false;
  let viewportActive = typeof globalThis.IntersectionObserver !== "function";

  const doc = globalThis.document;
  const win = globalThis.window;
  const motionQuery = win?.matchMedia?.("(prefers-reduced-motion: reduce)");

  const render = (time = 0): void => {
    resizeCanvasToDisplaySize(canvas, ctx, getDevicePixelRatio(maxDpr));
    renderFrame({ canvas, ctx, time, width: canvas.clientWidth || 0, height: canvas.clientHeight || 0, reducedMotion });
  };

  const resize = (): void => {
    const changed = resizeCanvasToDisplaySize(canvas, ctx, getDevicePixelRatio(maxDpr));
    if (changed && reducedMotion && viewportActive && !doc?.hidden && !disposed) {
      renderFrame({ canvas, ctx, time: 0, width: canvas.clientWidth || 0, height: canvas.clientHeight || 0, reducedMotion });
    }
  };

  const frame = (time = 0): void => {
    if (disposed || !running) return;
    render(time);
    frameId = globalThis.requestAnimationFrame(frame);
  };

  const start = (): void => {
    if (disposed || running || typeof globalThis.requestAnimationFrame !== "function") return;
    running = true;
    frameId = globalThis.requestAnimationFrame(frame);
  };

  const stop = (): void => {
    running = false;
    if (frameId !== undefined) {
      globalThis.cancelAnimationFrame?.(frameId);
      frameId = undefined;
    }
  };

  const syncActivity = (): void => {
    if (disposed || doc?.hidden || !viewportActive) {
      stop();
      return;
    }
    if (reducedMotion) {
      stop();
      render(0);
      return;
    }
    start();
  };

  const handleVisibilityChange = (): void => syncActivity();
  const handleMotionChange = (): void => {
    reducedMotion = Boolean(motionQuery?.matches);
    syncActivity();
  };

  const resizeObserver = globalThis.ResizeObserver ? new globalThis.ResizeObserver(resize) : null;
  const viewportObserver = globalThis.IntersectionObserver
    ? new globalThis.IntersectionObserver(
        ([entry]) => {
          viewportActive = Boolean(entry?.isIntersecting);
          syncActivity();
        },
        { rootMargin: "50% 0px", threshold: 0 },
      )
    : null;

  reducedMotion = Boolean(motionQuery?.matches);
  resize();
  resizeObserver?.observe(canvas);
  viewportObserver?.observe(canvas);
  win?.addEventListener?.("resize", resize);
  doc?.addEventListener?.("visibilitychange", handleVisibilityChange);

  if (motionQuery?.addEventListener) motionQuery.addEventListener("change", handleMotionChange);
  else motionQuery?.addListener?.(handleMotionChange);

  const dispose: MountDisposer = () => {
    if (disposed) return;
    disposed = true;
    stop();
    resizeObserver?.disconnect();
    viewportObserver?.disconnect();
    win?.removeEventListener?.("resize", resize);
    doc?.removeEventListener?.("visibilitychange", handleVisibilityChange);
    if (motionQuery?.removeEventListener) motionQuery.removeEventListener("change", handleMotionChange);
    else motionQuery?.removeListener?.(handleMotionChange);
    if (activeAnimations.get(key) === dispose) activeAnimations.delete(key);
  };

  activeAnimations.set(key, dispose);
  syncActivity();
  return dispose;
};

const loadImage = (imageUrl: string): Promise<HTMLImageElement> => {
  if (!imageUrl) return Promise.reject(new Error("Cannot load an empty image URL."));
  const cachedImage = imageCache.get(imageUrl);
  if (cachedImage) return cachedImage;

  const request = new Promise<HTMLImageElement>((resolve, reject) => {
    const ImageConstructor = globalThis.Image;
    if (!ImageConstructor) {
      reject(new Error("Image constructor is not available in this environment."));
      return;
    }
    const image = new ImageConstructor();
    image.decoding = "async";
    image.onload = () => {
      // `load` already means the image is drawable. `decode()` is optional
      // optimization work and must never block gallery readiness.
      resolve(image);
    };
    image.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    image.src = imageUrl;
  }).catch((error: unknown) => {
    imageCache.delete(imageUrl);
    throw error;
  });

  imageCache.set(imageUrl, request);
  return request;
};

const loadCoverImages = async (items: readonly (string | SourceItem)[]): Promise<LoadedItem[]> =>
  Promise.all(
    items.map(async (item) => {
      const imageUrl = typeof item === "string" ? item : item.imageUrl;
      const title = typeof item === "string" ? "" : item.title;
      try {
        return { imageUrl, title, imageElement: await loadImage(imageUrl), imageLoadError: null };
      } catch (error: unknown) {
        return { imageUrl, title, imageElement: null, imageLoadError: error };
      }
    }),
  );

const roundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void => {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
};

const drawCoverPlaceholder = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius = size * 0.1): void => {
  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, x, y, size, size, radius);
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fill();
  ctx.restore();
};

const drawRoundedCover = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
  radius = size * 0.1,
): void => {
  if (!image) {
    drawCoverPlaceholder(ctx, x, y, size, radius);
    return;
  }
  const aspect = image.width / image.height;
  const sourceWidth = aspect > 1 ? image.height : image.width;
  const sourceHeight = sourceWidth;
  const sourceX = (image.width - sourceWidth) * 0.5;
  const sourceY = (image.height - sourceHeight) * 0.5;
  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, x, y, size, size, radius);
  ctx.clip();
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, size, size);
  ctx.restore();
};

interface SpiralRenderOptions {
  ctx: CanvasRenderingContext2D;
  images: LoadedItem[];
  time: number;
  width: number;
  height: number;
  reducedMotion: boolean;
}

const renderSpiral = ({ ctx, images, time, width, height, reducedMotion }: SpiralRenderOptions): void => {
  if (!width || !height || !images.length) return;
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const minSide = Math.min(width, height);
  const maxSide = Math.max(width, height);
  const timeOffset = reducedMotion ? 0 : time * config.speed;

  ctx.clearRect(0, 0, width, height);

  images.forEach((item, index) => {
    const t = (index / images.length + timeOffset) % 1;
    const angle = -t * Math.PI * 2 * config.turns + Math.PI / 2;
    const size = minSide * config.cardScale * (t * config.cardGrowthScale);
    const radius = size + t * maxSide * config.radiusScale;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.globalAlpha = Math.min(1, t * config.alphaScale);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    drawRoundedCover(ctx, item.imageElement, -size * 0.5, -size * 0.5, size);
    ctx.restore();
  });

  ctx.globalAlpha = 1;
};

export const mountSpiral = async (
  canvasId = "spiral-container",
  options: SpiralMountOptions = {},
): Promise<MountDisposer> => {
  const key = getAnimationKey(canvasId);
  const mountToken = beginMount(key);
  const canvas = globalThis.document?.getElementById(canvasId) as HTMLCanvasElement | null | undefined;
  const ctx = canvas?.getContext?.("2d") ?? null;

  if (!canvas) {
    console.error(`Canvas with id "${canvasId}" not found`);
    return abortMount(key, mountToken);
  }

  if (!ctx) {
    console.error(`Failed to get 2d context from canvas "${canvasId}"`);
    return abortMount(key, mountToken);
  }

  canvas.dataset.galleryState = "loading";
  const sourceItems: readonly (string | SourceItem)[] = Array.isArray(options.items)
    ? normalizeItems(options.items)
    : spiralCoverUrls;
  const images = await loadCoverImages(sourceItems);

  if (!isCurrentMount(key, mountToken)) return noop;

  const hasRenderableImages = images.some((item) => Boolean(item.imageElement));
  canvas.dataset.galleryState = hasRenderableImages ? "ready" : "error";
  if (!hasRenderableImages) {
    pendingMounts.delete(key);
    return noop;
  }

  const dispose = createCanvasAnimation({
    key,
    canvas,
    ctx,
    maxDpr: options.maxDpr,
    renderFrame: ({ time, width, height, reducedMotion }) =>
      renderSpiral({ ctx, images, time, width, height, reducedMotion }),
  });

  return completeMount(key, mountToken, dispose);
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    pendingMounts.clear();
    disposeCanvasAnimationsByPrefix(SPIRAL_KEY_PREFIX);
  });
}

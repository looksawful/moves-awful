const SPIRAL_KEY_PREFIX = "spiral:";
const pendingMounts = new Map();
const activeAnimations = new Map();
const imageCache = new Map();

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
];

const normalizeItems = (items) =>
  items
    .filter((item) => item?.src)
    .map((item) => ({
      imageUrl: String(item.src),
      title: item.title == null ? "" : String(item.title),
    }));

const config = {
  speed: 0.00004,
  turns: 1.5,
  cardScale: 0.25,
  cardGrowthScale: 1.5,
  radiusScale: 0.4,
  alphaScale: 2,
};

const noop = () => {};

const getAnimationKey = (canvasId) => `${SPIRAL_KEY_PREFIX}${canvasId}`;

const beginMount = (key) => {
  const token = Symbol(key);

  pendingMounts.set(key, token);
  disposeCanvasAnimation(key);
  return token;
};

const isCurrentMount = (key, token) => pendingMounts.get(key) === token;

const abortMount = (key, token) => {
  if (isCurrentMount(key, token)) {
    pendingMounts.delete(key);
  }

  return noop;
};

const completeMount = (key, token, dispose) => () => {
  if (isCurrentMount(key, token)) {
    pendingMounts.delete(key);
  }

  dispose();
};

const getDevicePixelRatio = () => Math.max(1, globalThis.devicePixelRatio || globalThis.window?.devicePixelRatio || 1);

const resizeCanvasToDisplaySize = (canvas, ctx, dpr = getDevicePixelRatio()) => {
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

const disposeCanvasAnimation = (key) => {
  const dispose = activeAnimations.get(key);

  if (!dispose) {
    return;
  }

  dispose();
};

const disposeCanvasAnimationsByPrefix = (prefix) => {
  [...activeAnimations.keys()].forEach((key) => {
    if (key.startsWith(prefix)) {
      disposeCanvasAnimation(key);
    }
  });
};

const createCanvasAnimation = ({ key, canvas, ctx, renderFrame }) => {
  disposeCanvasAnimation(key);

  let disposed = false;
  let frameId;
  let running = false;
  let reducedMotion = false;
  let viewportActive = typeof globalThis.IntersectionObserver !== "function";

  const doc = globalThis.document;
  const win = globalThis.window;
  const motionQuery = win?.matchMedia?.("(prefers-reduced-motion: reduce)");

  const render = (time = 0) => {
    resizeCanvasToDisplaySize(canvas, ctx);
    renderFrame({
      canvas,
      ctx,
      time,
      width: canvas.clientWidth || 0,
      height: canvas.clientHeight || 0,
      reducedMotion,
    });
  };

  const resize = () => {
    const changed = resizeCanvasToDisplaySize(canvas, ctx);

    if (changed && reducedMotion && viewportActive && !doc?.hidden && !disposed) {
      renderFrame({
        canvas,
        ctx,
        time: 0,
        width: canvas.clientWidth || 0,
        height: canvas.clientHeight || 0,
        reducedMotion,
      });
    }
  };

  const frame = (time = 0) => {
    if (disposed || !running) {
      return;
    }

    render(time);
    frameId = globalThis.requestAnimationFrame(frame);
  };

  const start = () => {
    if (disposed || running || typeof globalThis.requestAnimationFrame !== "function") {
      return;
    }

    running = true;
    frameId = globalThis.requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;

    if (frameId !== undefined) {
      globalThis.cancelAnimationFrame?.(frameId);
      frameId = undefined;
    }
  };

  const syncActivity = () => {
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

  const handleVisibilityChange = () => {
    syncActivity();
  };

  const handleMotionChange = () => {
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

  if (motionQuery?.addEventListener) {
    motionQuery.addEventListener("change", handleMotionChange);
  } else {
    motionQuery?.addListener?.(handleMotionChange);
  }

  const dispose = () => {
    if (disposed) {
      return;
    }

    disposed = true;
    stop();
    resizeObserver?.disconnect();
    viewportObserver?.disconnect();
    win?.removeEventListener?.("resize", resize);
    doc?.removeEventListener?.("visibilitychange", handleVisibilityChange);

    if (motionQuery?.removeEventListener) {
      motionQuery.removeEventListener("change", handleMotionChange);
    } else {
      motionQuery?.removeListener?.(handleMotionChange);
    }

    if (activeAnimations.get(key) === dispose) {
      activeAnimations.delete(key);
    }
  };

  activeAnimations.set(key, dispose);
  syncActivity();

  return dispose;
};

const loadImage = (imageUrl) => {
  if (!imageUrl) {
    return Promise.reject(new Error("Cannot load an empty image URL."));
  }

  const cachedImage = imageCache.get(imageUrl);

  if (cachedImage) {
    return cachedImage;
  }

  const request = new Promise((resolve, reject) => {
    const ImageConstructor = globalThis.Image;

    if (!ImageConstructor) {
      reject(new Error("Image constructor is not available in this environment."));
      return;
    }

    const image = new ImageConstructor();

    image.decoding = "async";
    image.onload = async () => {
      try {
        await image.decode?.();
      } catch {
        // Some browsers reject decode() after onload for animated or cached images.
      }

      resolve(image);
    };
    image.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    image.src = imageUrl;
  }).catch((error) => {
    imageCache.delete(imageUrl);
    throw error;
  });

  imageCache.set(imageUrl, request);
  return request;
};

const loadCoverImages = async (items) =>
  Promise.all(
    items.map(async (item) => {
      const imageUrl = typeof item === "string" ? item : item.imageUrl;
      const metadata = typeof item === "string" ? {} : item;

      try {
        return {
          ...metadata,
          imageUrl,
          imageElement: await loadImage(imageUrl),
          imageLoadError: null,
        };
      } catch (error) {
        return {
          ...metadata,
          imageUrl,
          imageElement: null,
          imageLoadError: error,
        };
      }
    }),
  );

const roundedRect = (ctx, x, y, width, height, radius) => {
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

const drawCoverPlaceholder = (ctx, x, y, size, radius = size * 0.1) => {
  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, x, y, size, size, radius);
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fill();
  ctx.restore();
};

const drawRoundedCover = (ctx, image, x, y, size, radius = size * 0.1) => {
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

const renderSpiral = ({ ctx, images, time, width, height, reducedMotion }) => {
  if (!width || !height || !images.length) {
    return;
  }

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

export const mountSpiral = async (canvasId = "spiral-container", options = {}) => {
  const key = getAnimationKey(canvasId);
  const mountToken = beginMount(key);
  const canvas = document.getElementById(canvasId);
  const ctx = canvas?.getContext?.("2d");

  if (!canvas) {
    console.error(`Canvas with id "${canvasId}" not found`);
    return abortMount(key, mountToken);
  }

  if (!ctx) {
    console.error(`Failed to get 2d context from canvas "${canvasId}"`);
    return abortMount(key, mountToken);
  }

  canvas.dataset.galleryState = "loading";
  const sourceItems = Array.isArray(options.items) ? normalizeItems(options.items) : spiralCoverUrls;
  const images = await loadCoverImages(sourceItems);

  if (!isCurrentMount(key, mountToken)) {
    return noop;
  }

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
    renderFrame: ({ time, width, height, reducedMotion }) =>
      renderSpiral({
        ctx,
        images,
        time,
        width,
        height,
        reducedMotion,
      }),
  });

  return completeMount(key, mountToken, dispose);
};

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    pendingMounts.clear();
    disposeCanvasAnimationsByPrefix(SPIRAL_KEY_PREFIX);
  });
}

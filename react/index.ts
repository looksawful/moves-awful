import {
  createElement,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type CanvasHTMLAttributes,
  type ForwardedRef,
  type MutableRefObject,
} from "react";

import { mountArcCanvas } from "../canvas-animations/arc.ts";
import { mountSpiralCanvas } from "../canvas-animations/spiral.ts";
import type { GalleryItem, GalleryVariantOptions, MountDisposer } from "../canvas-animations/core/types.ts";

export type MovesCanvasVariant = GalleryVariantOptions["variant"];

export interface MovesCanvasProps
  extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, "children"> {
  variant: MovesCanvasVariant;
  items?: GalleryItem[];
  maxDpr?: number;
}

const noop: MountDisposer = () => {};

const assignRef = (
  ref: ForwardedRef<HTMLCanvasElement>,
  value: HTMLCanvasElement | null,
): void => {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) (ref as MutableRefObject<HTMLCanvasElement | null>).current = value;
};

export const MovesCanvas = forwardRef<HTMLCanvasElement, MovesCanvasProps>(
  function MovesCanvas({ variant, items, maxDpr, ...canvasProps }, forwardedRef) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const setCanvasRef = useCallback(
      (canvas: HTMLCanvasElement | null) => {
        canvasRef.current = canvas;
        assignRef(forwardedRef, canvas);
      },
      [forwardedRef],
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return undefined;

      let cleaned = false;
      let dispose: MountDisposer = noop;
      const mount = variant === "arc" ? mountArcCanvas : mountSpiralCanvas;

      void mount(canvas, { items, maxDpr }).then((nextDispose) => {
        if (cleaned) {
          nextDispose();
          return;
        }
        dispose = nextDispose;
      });


      return () => {
        cleaned = true;
        dispose();
      };
    }, [variant, items, maxDpr]);

    return createElement("canvas", { ...canvasProps, ref: setCanvasRef });
  },
);

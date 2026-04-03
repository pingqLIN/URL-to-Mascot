import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { STANDARD_EASE } from '../constants';

type AppBackdropProps = {
  bgDepthMap: string;
  bgOverride: string | null;
  bgSequence: string[];
};

type CoverMetrics = {
  offsetX: number;
  offsetY: number;
  renderedWidth: number;
  renderedHeight: number;
};

type SliceBlend = {
  lowerIndex: number;
  upperIndex: number;
  mix: number;
};

const baseImageClass = 'absolute inset-0 h-full w-full object-cover object-[center_39%]';
const OBJECT_POSITION_X = 0.5;
const OBJECT_POSITION_Y = 0.39;
const DEPTH_RANGE_MIN = 0.08;
const DEPTH_RANGE_MAX = 0.82;
const DEPTH_DEADBAND = 0.01;
const NEAR_DEPTH_BIAS = 0.72;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${src}`));
    image.src = src;
  });
}

function computeCoverMetrics(
  viewportWidth: number,
  viewportHeight: number,
  imageWidth: number,
  imageHeight: number,
): CoverMetrics {
  const scale = Math.max(viewportWidth / imageWidth, viewportHeight / imageHeight);
  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;

  return {
    offsetX: (viewportWidth - renderedWidth) * OBJECT_POSITION_X,
    offsetY: (viewportHeight - renderedHeight) * OBJECT_POSITION_Y,
    renderedWidth,
    renderedHeight,
  };
}

function readDepthValue(data: Uint8ClampedArray, index: number) {
  return (data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114) / 255;
}

function sampleFocusDepth(
  pointerX: number,
  pointerY: number,
  viewportWidth: number,
  viewportHeight: number,
  depthWidth: number,
  depthHeight: number,
  depthPixels: Uint8ClampedArray,
) {
  const metrics = computeCoverMetrics(viewportWidth, viewportHeight, depthWidth, depthHeight);
  const imageX = ((pointerX - metrics.offsetX) / metrics.renderedWidth) * depthWidth;
  const imageY = ((pointerY - metrics.offsetY) / metrics.renderedHeight) * depthHeight;
  const centerX = Math.min(depthWidth - 1, Math.max(0, Math.round(imageX)));
  const centerY = Math.min(depthHeight - 1, Math.max(0, Math.round(imageY)));
  let totalDepth = 0;
  let totalWeight = 0;

  for (let offsetY = -2; offsetY <= 2; offsetY += 1) {
    for (let offsetX = -2; offsetX <= 2; offsetX += 1) {
      const sampleX = Math.min(depthWidth - 1, Math.max(0, centerX + offsetX));
      const sampleY = Math.min(depthHeight - 1, Math.max(0, centerY + offsetY));
      const pixelIndex = (sampleY * depthWidth + sampleX) * 4;
      const distance = Math.abs(offsetX) + Math.abs(offsetY);
      const weight = distance === 0 ? 0.34 : distance === 1 ? 0.14 : distance === 2 ? 0.07 : 0.03;

      totalDepth += readDepthValue(depthPixels, pixelIndex) * weight;
      totalWeight += weight;
    }
  }

  return totalDepth / Math.max(totalWeight, 0.0001);
}

function createSliceBlend(depth: number, count: number): SliceBlend {
  const normalizedDepth = (depth - DEPTH_RANGE_MIN) / (DEPTH_RANGE_MAX - DEPTH_RANGE_MIN);
  const clampedDepth = Math.min(1, Math.max(0, normalizedDepth));
  const biasedDepth = Math.pow(clampedDepth, NEAR_DEPTH_BIAS);
  const position = biasedDepth * (count - 1);
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.min(count - 1, lowerIndex + 1);
  const mix = position - lowerIndex;

  if (lowerIndex === upperIndex) {
    return { lowerIndex, upperIndex, mix: 0 };
  }

  return { lowerIndex, upperIndex, mix };
}

function AppBackdrop({ bgDepthMap, bgOverride, bgSequence }: AppBackdropProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [sliceBlend, setSliceBlend] = useState(() => createSliceBlend(0.5, bgSequence.length));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === 'undefined' || bgSequence.length === 0) {
      return undefined;
    }

    let disposed = false;
    let frame = 0;
    let depthPixels: Uint8ClampedArray | null = null;
    let depthWidth = 0;
    let depthHeight = 0;

    const state = {
      currentDepth: 0.5,
      targetDepth: 0.5,
      pointerX: 0,
      pointerY: 0,
      overlayX: 0,
      overlayY: 0,
      viewportWidth: 0,
      viewportHeight: 0,
    };

    const stopLoop = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const syncPointerOverlay = () => {
      root.style.setProperty('--pointer-x', `${state.overlayX}px`);
      root.style.setProperty('--pointer-y', `${state.overlayY}px`);
    };

    const draw = () => {
      state.currentDepth += (state.targetDepth - state.currentDepth) * 0.16;
      state.overlayX += (state.pointerX - state.overlayX) * 0.1;
      state.overlayY += (state.pointerY - state.overlayY) * 0.1;
      syncPointerOverlay();
      setSliceBlend(createSliceBlend(state.currentDepth, bgSequence.length));

      if (
        Math.abs(state.targetDepth - state.currentDepth) > 0.0015 ||
        Math.abs(state.pointerX - state.overlayX) > 0.5 ||
        Math.abs(state.pointerY - state.overlayY) > 0.5
      ) {
        frame = window.requestAnimationFrame(draw);
      } else {
        frame = 0;
      }
    };

    const startLoop = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(draw);
      }
    };

    const updateTargetDepth = () => {
      if (!depthPixels || !state.viewportWidth || !state.viewportHeight) {
        return;
      }

      const sampledDepth = sampleFocusDepth(
        state.pointerX,
        state.pointerY,
        state.viewportWidth,
        state.viewportHeight,
        depthWidth,
        depthHeight,
        depthPixels,
      );

      if (Math.abs(sampledDepth - state.targetDepth) < DEPTH_DEADBAND) {
        return;
      }

      state.targetDepth = sampledDepth;
      startLoop();
    };

    const syncViewport = () => {
      const rect = root.getBoundingClientRect();
      state.viewportWidth = Math.max(1, rect.width);
      state.viewportHeight = Math.max(1, rect.height);

      if (!state.pointerX && !state.pointerY) {
        state.pointerX = state.viewportWidth * 0.5;
        state.pointerY = state.viewportHeight * 0.5;
        state.overlayX = state.pointerX;
        state.overlayY = state.pointerY;
      } else {
        state.pointerX = Math.min(state.viewportWidth, Math.max(0, state.pointerX));
        state.pointerY = Math.min(state.viewportHeight, Math.max(0, state.pointerY));
      }

      syncPointerOverlay();
      updateTargetDepth();
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      state.pointerX = event.clientX - rect.left;
      state.pointerY = event.clientY - rect.top;
      startLoop();
      updateTargetDepth();
    };

    const handlePointerLeave = () => {
      state.pointerX = state.viewportWidth * 0.5;
      state.pointerY = state.viewportHeight * 0.5;
      startLoop();
      updateTargetDepth();
    };

    const initialize = async () => {
      setReady(false);

      try {
        const [depthImage] = await Promise.all([
          loadImage(bgDepthMap),
          ...bgSequence.map((src) => loadImage(src)),
        ]);

        if (disposed) {
          return;
        }

        const depthCanvas = document.createElement('canvas');
        depthCanvas.width = depthImage.width;
        depthCanvas.height = depthImage.height;
        const depthContext = depthCanvas.getContext('2d', { willReadFrequently: true });
        if (!depthContext) {
          throw new Error('Unable to create depth canvas.');
        }

        depthContext.drawImage(depthImage, 0, 0);
        const depthImageData = depthContext.getImageData(0, 0, depthImage.width, depthImage.height);
        depthPixels = depthImageData.data;
        depthWidth = depthImage.width;
        depthHeight = depthImage.height;

        syncViewport();
        state.currentDepth = state.targetDepth;
        setSliceBlend(createSliceBlend(state.currentDepth, bgSequence.length));
        setReady(true);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('blur', handlePointerLeave);
        window.addEventListener('resize', syncViewport);
        document.documentElement.addEventListener('mouseleave', handlePointerLeave);
      } catch (error) {
        console.error(error);
      }
    };

    void initialize();

    return () => {
      disposed = true;
      stopLoop();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
      window.removeEventListener('resize', syncViewport);
      document.documentElement.removeEventListener('mouseleave', handlePointerLeave);
    };
  }, [bgDepthMap, bgSequence]);

  const fallbackIndex = Math.min(bgSequence.length - 1, Math.floor((bgSequence.length - 1) * 0.5));

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed inset-0 overflow-hidden [--pointer-x:50vw] [--pointer-y:50vh]"
    >
      {bgSequence.map((src, index) => {
        const isLower = ready && index === sliceBlend.lowerIndex;
        const isUpper = ready && index === sliceBlend.upperIndex && sliceBlend.upperIndex !== sliceBlend.lowerIndex;
        const opacity = ready
          ? isLower
            ? 1
            : isUpper
              ? sliceBlend.mix
              : 0
          : index === fallbackIndex
            ? 1
            : 0;

        return (
        <img
          key={src}
          src={src}
          alt=""
          className={baseImageClass}
          style={{
            opacity,
          }}
        />
        );
      })}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle 1180px at var(--pointer-x) var(--pointer-y), rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.015) 28%, rgba(0, 0, 0, 0.06) 50%, rgba(0, 0, 0, 0.14) 70%, rgba(0, 0, 0, 0.3) 88%, rgba(0, 0, 0, 0.54) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      <AnimatePresence>
        {bgOverride && (
          <motion.img
            key="bg-override"
            src={bgOverride}
            alt=""
            className={baseImageClass}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, exit: { duration: 0.45 }, ease: STANDARD_EASE }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AppBackdrop;

import {
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
  useRef,
} from 'react';

type LiquidGlassVariant = 'panel' | 'compact' | 'hero' | 'pill';
type LiquidGlassTag = 'div' | 'section' | 'article' | 'header' | 'aside';

type LiquidGlassProps = HTMLAttributes<HTMLElement> & {
  as?: LiquidGlassTag;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  style?: CSSProperties;
  variant?: LiquidGlassVariant;
};

const variantClassNames: Record<LiquidGlassVariant, string> = {
  panel: 'liquid-glass--panel',
  compact: 'liquid-glass--compact',
  hero: 'liquid-glass--hero',
  pill: 'liquid-glass--pill',
};

function updateLiquidPointer(target: HTMLElement, clientX: number, clientY: number) {
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) {
    return;
  }

  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;

  target.style.setProperty('--liquid-x', `${Math.min(100, Math.max(0, x))}%`);
  target.style.setProperty('--liquid-y', `${Math.min(100, Math.max(0, y))}%`);
}

function resetLiquidPointer(target: HTMLElement) {
  target.style.setProperty('--liquid-x', '50%');
  target.style.setProperty('--liquid-y', '24%');
}

function mergeClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ');
}

function LiquidGlass({
  as = 'div',
  children,
  className,
  interactive = true,
  onPointerMove,
  onPointerLeave,
  style,
  variant = 'panel',
  ...rest
}: LiquidGlassProps) {
  const Component = as;
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<{ clientX: number; clientY: number } | null>(null);

  const flushPointer = (target: HTMLElement) => {
    if (!pointerRef.current) {
      return;
    }

    const { clientX, clientY } = pointerRef.current;
    updateLiquidPointer(target, clientX, clientY);
    frameRef.current = null;
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (interactive) {
      pointerRef.current = {
        clientX: event.clientX,
        clientY: event.clientY,
      };

      if (frameRef.current === null) {
        const target = event.currentTarget;
        frameRef.current = window.requestAnimationFrame(() => flushPointer(target));
      }
    }

    onPointerMove?.(event);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLElement>) => {
    if (interactive) {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      pointerRef.current = null;
      resetLiquidPointer(event.currentTarget);
    }

    onPointerLeave?.(event);
  };

  return (
    <Component
      className={mergeClassNames('liquid-glass', variantClassNames[variant], className)}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      style={style}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default LiquidGlass;

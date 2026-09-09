import Image, { type ImageProps } from 'next/image';
import { type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Ornament = 'none' | 'corners' | 'inset';

type Props = {
  /** Aspect ratio expressed as CSS aspect-ratio value, e.g. "4/5" */
  ratio?: string;
  ornament?: Ornament;
  /** When provided, renders a next/image. Omit to show only the placeholder. */
  src?: ImageProps['src'];
  alt?: string;
  /** Tells next/image which size slot to download. Defaults to common pattern. */
  sizes?: string;
  /** Prioritize loading (for above-the-fold images) */
  priority?: boolean;
  /** Placeholder JSX shown while no src is provided (or as background art) */
  placeholder?: ReactNode;
  /** Zoom the photo slightly when a parent `.group` is hovered (cards) */
  hoverZoom?: boolean;
  /** Square corners — for frames that sit flush inside a card */
  flush?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Universal photo / video container.
 *
 * All photography goes through one consistent frame: aspect ratio preserved
 * via the `--ratio` custom property, soft rounded corners, optional inset
 * hairline ornament, and a stylized placeholder while a photo is missing.
 * When a photo exists the placeholder fades out (data-state="loaded").
 */
export default function MediaFrame({
  ratio = '4/5',
  ornament = 'none',
  src,
  alt = '',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  placeholder,
  hoverZoom = false,
  flush = false,
  className,
  style,
}: Props) {
  const loaded = Boolean(src);
  return (
    <figure
      className={cn(
        'relative isolate m-0 w-full overflow-hidden bg-navy aspect-[var(--ratio,4/5)]',
        flush ? 'rounded-none' : 'rounded-[var(--radius-frame)]',
        ornament === 'inset' &&
          "after:pointer-events-none after:absolute after:inset-[14px] after:z-[3] after:rounded-[10px] after:border after:border-brass/35 after:content-['']",
        className,
      )}
      data-state={loaded ? 'loaded' : 'placeholder'}
      data-ornament={ornament === 'none' ? undefined : ornament}
      style={{ ['--ratio' as string]: ratio, ...style }}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            'object-cover',
            hoverZoom && 'transition-transform duration-700 ease-out-soft group-hover:scale-[1.04]',
          )}
        />
      )}
      {placeholder && (
        <div
          className={cn(
            'absolute inset-0 z-[2] flex flex-col items-center justify-center gap-3 p-6 text-center',
            'bg-[radial-gradient(80%_80%_at_50%_30%,#152F4A_0%,#0B1F33_70%)]',
            'transition-opacity duration-500',
            loaded && 'pointer-events-none opacity-0',
          )}
        >
          {placeholder}
        </div>
      )}
    </figure>
  );
}

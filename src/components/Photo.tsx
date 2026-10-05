import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";

type PhotoProps = {
  /** Public image URL. When missing, the Figma placeholder is shown instead. */
  src?: string | null;
  alt: string;
  /** Placeholder caption, e.g. "White tee flat-lay, soft daylight. 416 x 500" */
  caption?: string;
  photoLabel?: string;
  className?: string;
  style?: CSSProperties;
  sizes?: string;
  priority?: boolean;
  compact?: boolean;
  children?: ReactNode;
};

export function Photo({ src, alt, caption, photoLabel = "PHOTO", className, style, sizes, priority, compact, children }: PhotoProps) {
  return (
    <div className={`photo${compact ? " photo--compact" : ""}${className ? ` ${className}` : ""}`} style={style}>
      {src ? (
        <Image className="photo__img" src={src} alt={alt} fill sizes={sizes ?? "(max-width: 900px) 100vw, 50vw"} priority={priority} />
      ) : (
        <>
          <span className="photo__icon" aria-hidden="true" />
          {!compact && (
            <>
              <span className="photo__label">{photoLabel}</span>
              {caption && <span className="photo__caption">{caption}</span>}
            </>
          )}
          {(compact || !caption) && <span className="sr-only">{alt}</span>}
        </>
      )}
      {children}
    </div>
  );
}

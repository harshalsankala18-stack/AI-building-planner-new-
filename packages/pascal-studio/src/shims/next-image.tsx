import React, { createContext } from 'react';

export type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string | { src: string };
  alt?: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
};

export const ImageConfigContext = createContext<any>(null);

export const imageConfigDefault = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  path: '/_next/image',
  loader: 'default',
  loaderFile: '',
  domains: [],
  disableStaticImages: false,
  minimumCacheTTL: 60,
  formats: ['image/webp'],
  dangerouslyAllowSVG: false,
  contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
  contentDispositionType: 'inline',
  remotePatterns: [],
  unoptimized: false,
};

export function hasRemoteMatch() {
  return true;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = '',
  width,
  height,
  fill,
  className,
  style,
  priority,
  unoptimized,
  ...rest
}) => {
  const resolvedSrc = typeof src === 'object' && src !== null ? (src as any).src || '' : src;
  const resolvedStyle: React.CSSProperties = {
    ...style,
    ...(fill
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }
      : {}),
  };

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={resolvedStyle}
      {...rest}
    />
  );
};

export default Image;

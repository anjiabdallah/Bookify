type CoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

function CoverImage({ src, alt, className = '', imgClassName = '' }: CoverImageProps) {
  return (
    <div className={`overflow-hidden ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${imgClassName}`.trim()}
      />
    </div>
  );
}

export default CoverImage;

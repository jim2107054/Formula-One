import Image from "next/image";

interface IconProps {
  name: string;
  className?: string;
  width?: number;
  height?: number;
}

export function Icon({
  name,
  className = "w-5 h-5",
  width = 20,
  height = 20,
}: IconProps) {
  const src = `/images/icons/${name}.svg`;
  if (!src) return null;

  return (
    <Image
      src={src}
      width={width}
      height={height}
      alt={`${name} icon`}
      className={className}
    />
  );
}

import Link from "next/link";

interface InteractiveLinkProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const InteractiveLink = ({
  href,
  children,
  className = "",
  onClick,
}: InteractiveLinkProps) => {
  const commonClass = `hover:!bg-accent hover:!text-white !cursor-pointer ${className}`;

  if (!href) {
    return (
      <button type="button" onClick={onClick} className={commonClass}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={commonClass}>
      {children}
    </Link>
  );
};

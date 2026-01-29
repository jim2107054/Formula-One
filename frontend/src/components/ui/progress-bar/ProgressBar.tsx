"use client";

interface ProgressBarProps {
  completed: number;
  total: number;
  label: string;
  color?: string;
  variant?: string;
}

export default function ProgressBar({
  completed,
  total,
  label,
  color = "Accent-default",
  // variant = "default",
}: ProgressBarProps) {
  const percentage = (completed / total) * 100;

  return (
    <div className="w-[213px] py-[9px] px-3 bg-white rounded-lg ">
      <p>
        <span className="font-semibold" style={{ color: `var(--${color})` }}>
          {completed}/{total}
        </span>{" "}
        {label}
      </p>
      <div className="mt-3 w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-3 rounded-full bg-[var(--${color})]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

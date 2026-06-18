import type { InputHTMLAttributes } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FloatingInput({ label, id, ...props }: FloatingInputProps) {
  const inputId = id ?? props.name ?? label;
  return (
    <div className="floating-label">
      <input id={inputId} placeholder=" " className="floating-input" {...props} />
      <label htmlFor={inputId} className="floating-text-label text-sm">
        {label}
      </label>
    </div>
  );
}

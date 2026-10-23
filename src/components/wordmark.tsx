export function Wordmark({ className = "text-2xl" }: { className?: string }) {
  return (
    <span className={`font-extrabold leading-none tracking-[-0.045em] text-ink ${className}`}>
      Otagh<span className="text-accent">DB</span>
    </span>
  );
}

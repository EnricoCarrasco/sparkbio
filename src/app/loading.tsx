export default function GlobalLoading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]"
      aria-label="Loading"
      role="status"
    >
      {/* Animated ring spinner using only opacity + transform */}
      <div className="relative size-10">
        <span
          className="absolute inset-0 rounded-full border-2 border-[#FF6B35]/20"
          aria-hidden="true"
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF6B35] animate-spin"
          aria-hidden="true"
        />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

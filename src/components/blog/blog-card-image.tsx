/**
 * Branded gradient image for blog cards and post hero.
 * Generates a consistent, on-brand visual for each post
 * without needing actual photos.
 */

const GRADIENTS = [
  "from-[#1E1E2E] via-[#2D1B14] to-[#3D1F0F]",
  "from-[#1a1a2e] via-[#16213e] to-[#0f3460]",
  "from-[#2D1B14] via-[#4a1e0a] to-[#1E1E2E]",
  "from-[#0f3460] via-[#1a1a2e] to-[#2D1B14]",
  "from-[#1E1E2E] via-[#3D1F0F] to-[#0f3460]",
];

interface BlogCardImageProps {
  title: string;
  category: string;
  variant?: "card" | "hero";
}

export function BlogCardImage({ title, category, variant = "card" }: BlogCardImageProps) {
  // Deterministic gradient based on title
  const gradientIndex = title.length % GRADIENTS.length;
  const gradient = GRADIENTS[gradientIndex];

  const isHero = variant === "hero";

  return (
    <div
      className={`bg-gradient-to-br ${gradient} flex flex-col justify-between ${
        isHero ? "aspect-[21/9] rounded-2xl p-10" : "aspect-[16/9] p-5"
      }`}
    >
      {/* Top: category pill */}
      <div className="flex justify-between items-start">
        <span className="bg-[#FF6B35] text-white text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1 rounded-full">
          {category}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 bg-[#FF6B35] rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-extrabold">V</span>
          </div>
          <span className="text-white/60 text-[11px] font-medium">viopage</span>
        </div>
      </div>

      {/* Bottom: title */}
      <h3
        className={`text-white font-bold leading-tight ${
          isHero ? "text-2xl sm:text-3xl max-w-2xl" : "text-sm sm:text-base max-w-[90%] line-clamp-2"
        }`}
      >
        {title}
      </h3>
    </div>
  );
}

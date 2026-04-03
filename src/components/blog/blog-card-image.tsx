import Image from "next/image";

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
  image?: string;
  variant?: "card" | "hero" | "featured";
}

export function BlogCardImage({ title, category, image, variant = "card" }: BlogCardImageProps) {
  const isFeatured = variant === "featured";
  const isHero = variant === "hero";

  if (image) {
    if (isFeatured) {
      // Fill the parent container completely (parent must be relative + have height)
      return (
        <Image
          src={image}
          alt={`${title} — Viopage blog`}
          fill
          className="object-cover"
          sizes="50vw"
        />
      );
    }
    return (
      <div className={`relative ${isHero ? "aspect-[21/9]" : "aspect-[16/9]"}`}>
        <Image
          src={image}
          alt={`${title} — Viopage blog`}
          fill
          className="object-cover"
          sizes={isHero ? "100vw" : "(max-width: 768px) 100vw, 33vw"}
        />
      </div>
    );
  }

  const gradientIndex = title.length % GRADIENTS.length;
  const gradient = GRADIENTS[gradientIndex];

  return (
    <div
      className={`bg-gradient-to-br ${gradient} flex flex-col justify-between ${
        isFeatured ? "absolute inset-0 p-8" :
        isHero ? "aspect-[21/9] rounded-2xl p-10" : "aspect-[16/9] p-5"
      }`}
    >
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
      <h3
        className={`text-white font-bold leading-tight ${
          isFeatured ? "text-xl sm:text-2xl max-w-sm" :
          isHero ? "text-2xl sm:text-3xl max-w-2xl" : "text-sm sm:text-base max-w-[90%] line-clamp-2"
        }`}
      >
        {title}
      </h3>
    </div>
  );
}

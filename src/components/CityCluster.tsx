import { motion } from "framer-motion";

export default function CityCluster({
  city,
  selected,
  onClick,
}: any) {
  const friendCount = city.friends.length;

  const size = 90 + friendCount * 18;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        scale: 1.08,
      }}
      className="absolute flex items-center justify-center cursor-pointer"
      style={{
        left: `${city.x}%`,
        top: `${city.y}%`,
        width: size,
        height: size,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* OUTER GLOW */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`
          absolute inset-0 rounded-full blur-3xl
          ${
            selected
              ? "bg-blue-400/40"
              : "bg-blue-400/20"
          }
        `}
      />

      {/* INNER ORB */}
      <div
        className={`
          relative w-full h-full rounded-full
          border transition-all duration-300
          flex flex-col items-center justify-center
          backdrop-blur-xl
          ${
            selected
              ? "border-blue-300/60 bg-blue-400/10"
              : "border-white/10 bg-white/[0.03]"
          }
        `}
      >
        {/* CITY NAME */}
        <div className="text-white text-lg font-medium">
          {city.name}
        </div>

        {/* FRIEND COUNT */}
        <div className="text-white/40 text-sm mt-1">
          {friendCount} friends
        </div>
      </div>
    </motion.button>
  );
}
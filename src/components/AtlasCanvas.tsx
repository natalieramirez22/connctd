import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cities } from "../data/cities";

export default function AtlasCanvas() {
  const [selectedCity, setSelectedCity] = useState<any>(null);

  const bounds = useMemo(() => {
    const xs = cities.map((c) => c.mapX ?? c.x);
    const ys = cities.map((c) => c.mapY ?? c.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const paddingX = 10;
    const paddingY = 12;

    return {
      left: minX - paddingX,
      right: maxX + paddingX,
      top: minY - paddingY,
      bottom: maxY + paddingY,
    };
  }, []);

  const projectX = (x: number) => {
    return ((x - bounds.left) / (bounds.right - bounds.left)) * 100;
  };

  const projectY = (y: number) => {
    return ((y - bounds.top) / (bounds.bottom - bounds.top)) * 100;
  };

  const mapCenterX = (bounds.left + bounds.right) / 2;
  const mapCenterY = (bounds.top + bounds.bottom) / 2;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020617]">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[#020617]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#11306f_0%,#020617_65%)]" />

      {/* DYNAMIC MAP */}
      <motion.div
        className="absolute inset-0 opacity-[0.60]"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "2600px",
          backgroundPosition: `
            ${50 - mapCenterX}%
            ${60 - mapCenterY}%
          `,
          filter: "brightness(2.2) contrast(1.35) saturate(0)",
        }}
      />

      {/* MAP GLOW */}
      <motion.div
        className="absolute inset-0 opacity-[0.30]"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "2600px",
          backgroundPosition: `
            ${50 - mapCenterX}%
            ${60 - mapCenterY}%
          `,
          filter: "brightness(3) contrast(1.6) blur(3px)",
        }}
      />

      <div className="absolute inset-0 bg-blue-500/[0.10]" />

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "160px 160px",
        }}
      />

      <motion.div
        animate={{ opacity: [0.14, 0.22, 0.14] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[-8%] top-[-10%] w-[900px] h-[900px] bg-blue-500/14 blur-3xl rounded-full"
      />

      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute right-[-15%] bottom-[-20%] w-[850px] h-[850px] bg-purple-500/10 blur-3xl rounded-full"
      />

      <div className="absolute inset-0 bg-black/10" />

      {/* TITLE */}
      <div className="absolute top-7 left-7 z-40">
        <h1 className="text-5xl font-semibold tracking-tight text-white leading-none">
          connctd
        </h1>

        <p className="text-white/38 mt-2 text-base">
          post-grad social atlas
        </p>
      </div>

      {/* CITY NODES */}
      {cities.map((city) => {
        const friendCount = city.friends.length;
        const active = friendCount > 0;

        const coreSize = active ? 15 + Math.min(friendCount * 2, 10) : 10;
        const glowSize = active ? 60 + friendCount * 10 : 28;
        const ringSize = coreSize + 14;

        const isSelected = selectedCity?.id === city.id;

        return (
          <motion.button
            key={city.id}
            onClick={() => (active ? setSelectedCity(city) : null)}
            whileHover={{ scale: 1.05 }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 18,
            }}
            className="absolute z-30"
            style={{
              left: `${projectX(city.x)}%`,
              top: `${projectY(city.y)}%`,
              x: "-50%",
              y: "-50%",
            }}
          >
            {/* NODE GLOW */}
            <motion.div
              animate={{
                opacity: active ? [0.12, 0.3, 0.12] : [0.03, 0.08, 0.03],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`absolute rounded-full blur-2xl ${
                active ? "bg-blue-500/50" : "bg-white/10"
              }`}
              style={{
                width: glowSize,
                height: glowSize,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* OUTER RING */}
            <div
              className={`absolute rounded-full border ${
                isSelected ? "border-blue-200" : "border-white/65"
              }`}
              style={{
                width: ringSize,
                height: ringSize,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            {/* CORE */}
            <div
              className={`relative rounded-full ${
                active ? "bg-[#ffb8f0]" : "bg-white/20"
              }`}
              style={{
                width: coreSize,
                height: coreSize,
              }}
            />

            {/* LABEL */}
            <div
              className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-left"
              style={{
                left: ringSize / 2 + 22,
              }}
            >
              <div
                className={`font-medium tracking-tight leading-none ${
                  active ? "text-white text-[16px]" : "text-white/50 text-[15px]"
                }`}
              >
                {city.name}
              </div>

              <div
                className={`mt-1 ${
                  active ? "text-white/38 text-[13px]" : "text-white/20 text-[13px]"
                }`}
              >
                {friendCount} friend{friendCount !== 1 ? "s" : ""}
              </div>
            </div>
          </motion.button>
        );
      })}

      {/* SIDE PANEL */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute top-0 right-0 h-full w-[410px] border-l border-white/10 bg-[#07101d]/92 backdrop-blur-3xl z-50"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.10),transparent_45%)]" />

            <div className="relative p-9">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[40px] font-semibold text-white leading-none">
                    {selectedCity.name}
                  </h2>

                  <p className="text-white/35 mt-3 text-base">
                    {selectedCity.friends.length} friends
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCity(null)}
                  className="text-white/30 hover:text-white transition text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mt-10 flex flex-col gap-4">
                {selectedCity.friends.map((friend: any, index: number) => (
                  <motion.div
                    key={friend.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:bg-white/[0.05] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-[22px] leading-none text-white font-medium">
                          {friend.name}
                        </h3>

                        {friend.note && (
                          <p className="text-white/30 mt-2 text-[13px]">
                            {friend.note}
                          </p>
                        )}
                      </div>

                      <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.95)]" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
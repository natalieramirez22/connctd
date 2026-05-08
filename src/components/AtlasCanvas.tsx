import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cities } from "../data/cities";

export default function AtlasCanvas() {
  const [selectedCity, setSelectedCity] = useState<any>(null);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020617]">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0f245d_0%,#020617_58%)]" />

      {/* MAP */}
      <div
        className="absolute inset-0 opacity-[0.38]"
        style={{
          backgroundImage:
            "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "1650px",
          filter:
            "brightness(0.95) contrast(1.45) saturate(0) blur(0px)",
        }}
      />

      {/* MAP GLOW */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_75%_55%,rgba(168,85,247,0.12),transparent_40%)]" />

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "160px 160px",
        }}
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/28" />

      {/* TITLE */}
      <div className="absolute top-8 left-8 z-40">
        <h1 className="text-7xl font-semibold tracking-tight text-white leading-none">
          connctd
        </h1>

        <p className="text-white/40 mt-3 text-xl">
          post-grad social atlas
        </p>
      </div>

      {/* CITY NODES */}
      {cities.map((city) => {
        const friendCount = city.friends.length;

        const active = friendCount > 0;

        const coreSize = active
          ? 16 + Math.min(friendCount * 2, 10)
          : 10;

        const glowSize = active
          ? 52 + friendCount * 10
          : 28;

        const ringSize = coreSize + 14;

        const isSelected =
          selectedCity?.id === city.id;

        return (
          <motion.button
            key={city.id}
            onClick={() =>
              active
                ? setSelectedCity(city)
                : null
            }
            whileHover={{
              scale: 1.08,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 18,
            }}
            className="absolute z-30"
            style={{
              left: `${city.x}%`,
              top: `${city.y}%`,
              x: "-50%",
              y: "-50%",
            }}
          >
            {/* GLOW */}
            <motion.div
              animate={{
                opacity: active
                  ? [0.18, 0.42, 0.18]
                  : [0.05, 0.12, 0.05],

                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`
                absolute rounded-full blur-2xl
                ${
                  active
                    ? "bg-blue-500/55"
                    : "bg-white/10"
                }
              `}
              style={{
                width: glowSize,
                height: glowSize,
                left: "50%",
                top: "50%",
                transform:
                  "translate(-50%, -50%)",
              }}
            />

            {/* OUTER RING */}
            <div
              className={`
                absolute rounded-full border
                ${
                  isSelected
                    ? "border-blue-200"
                    : "border-white/70"
                }
              `}
              style={{
                width: ringSize,
                height: ringSize,
                left: "50%",
                top: "50%",
                transform:
                  "translate(-50%, -50%)",
              }}
            />

            {/* INNER DOT */}
            <div
              className={`
                relative rounded-full
                ${
                  active
                    ? "bg-blue-400"
                    : "bg-white/20"
                }
              `}
              style={{
                width: coreSize,
                height: coreSize,
              }}
            />

            {/* LABEL */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 whitespace-nowrap text-left">
              <div
                className={`
                  font-medium tracking-tight leading-none
                  ${
                    active
                      ? "text-white text-[16px]"
                      : "text-white/55 text-[15px]"
                  }
                `}
              >
                {city.name}
              </div>

              <div
                className={`
                  mt-1
                  ${
                    active
                      ? "text-white/40 text-[13px]"
                      : "text-white/20 text-[13px]"
                  }
                `}
              >
                {friendCount} friend
                {friendCount !== 1 ? "s" : ""}
              </div>
            </div>
          </motion.button>
        );
      })}

      {/* SIDE PANEL */}
      <AnimatePresence>
        {selectedCity && (
          <motion.div
            initial={{
              x: 420,
              opacity: 0,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            exit={{
              x: 420,
              opacity: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            className="absolute top-0 right-0 h-full w-[420px] border-l border-white/10 bg-[#07101d]/92 backdrop-blur-3xl z-50"
          >
            {/* PURPLE SIDE GLOW */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_45%)]" />

            <div className="relative p-10">
              {/* HEADER */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-5xl font-semibold text-white leading-none">
                    {selectedCity.name}
                  </h2>

                  <p className="text-white/35 mt-4 text-lg">
                    {selectedCity.friends.length} friends
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedCity(null)
                  }
                  className="text-white/30 hover:text-white transition text-3xl"
                >
                  ×
                </button>
              </div>

              {/* FRIEND LIST */}
              <div className="mt-10 flex flex-col gap-4">
                {selectedCity.friends.map(
                  (friend: any, index: number) => (
                    <motion.div
                      key={friend.name}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.04,
                      }}
                      className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-5 hover:bg-white/[0.05] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[28px] leading-none text-white font-medium">
                            {friend.name}
                          </h3>

                          {friend.note && (
                            <p className="text-white/30 mt-2 text-sm">
                              {friend.note}
                            </p>
                          )}
                        </div>

                        <div className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-[0_0_18px_rgba(74,222,128,0.95)]" />
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
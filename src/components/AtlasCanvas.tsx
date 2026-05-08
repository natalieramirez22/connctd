import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cities } from "../data/cities";

const MAP_IMAGE =
  "url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')";

const WORLD_BOUNDS = {
  left: 0,
  right: 100,
  top: 0,
  bottom: 100,
};

const FOCUS_PADDING_X = 4;
const FOCUS_PADDING_Y = 5;

export default function AtlasCanvas() {
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [zoomOut, setZoomOut] = useState(0);
  const [panWorld, setPanWorld] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  const focusedBounds = useMemo(() => {
    const xs = cities.map((c) => c.mapX ?? c.x);
    const ys = cities.map((c) => c.mapY ?? c.y);

    return {
      left: Math.min(...xs) - FOCUS_PADDING_X,
      right: Math.max(...xs) + FOCUS_PADDING_X,
      top: Math.min(...ys) - FOCUS_PADDING_Y,
      bottom: Math.max(...ys) + FOCUS_PADDING_Y,
    };
  }, []);

  const baseBounds = useMemo(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    return {
      left: lerp(focusedBounds.left, WORLD_BOUNDS.left, zoomOut),
      right: lerp(focusedBounds.right, WORLD_BOUNDS.right, zoomOut),
      top: lerp(focusedBounds.top, WORLD_BOUNDS.top, zoomOut),
      bottom: lerp(focusedBounds.bottom, WORLD_BOUNDS.bottom, zoomOut),
    };
  }, [focusedBounds, zoomOut]);

  const viewBounds = useMemo(() => {
    const width = baseBounds.right - baseBounds.left;
    const height = baseBounds.bottom - baseBounds.top;

    let left = baseBounds.left + panWorld.x;
    let top = baseBounds.top + panWorld.y;

    if (width >= 100) {
      left = 0;
    } else {
      left = Math.max(0, Math.min(100 - width, left));
    }

    if (height >= 100) {
      top = 0;
    } else {
      top = Math.max(0, Math.min(100 - height, top));
    }

    return {
      left,
      right: left + width,
      top,
      bottom: top + height,
    };
  }, [baseBounds, panWorld]);

  const viewWidth = viewBounds.right - viewBounds.left;
  const viewHeight = viewBounds.bottom - viewBounds.top;

  const projectX = (x: number) => ((x - viewBounds.left) / viewWidth) * 100;
  const projectY = (y: number) => ((y - viewBounds.top) / viewHeight) * 100;

  const zoomIn = () => {
    setZoomOut((z) => Math.max(0, z - 0.14));
  };

  const zoomOutMap = () => {
    setZoomOut((z) => Math.min(1, z + 0.14));
  };

  const resetView = () => {
    setZoomOut(0);
    setPanWorld({ x: 0, y: 0 });
  };

  const worldLayerStyle = {
    width: `${(100 / viewWidth) * 100}%`,
    height: `${(100 / viewHeight) * 100}%`,
    left: `${-(viewBounds.left / viewWidth) * 100}%`,
    top: `${-(viewBounds.top / viewHeight) * 100}%`,
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    movedRef.current = false;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = e.clientX - lastPointerRef.current.x;
    const dy = e.clientY - lastPointerRef.current.y;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      movedRef.current = true;
    }

    lastPointerRef.current = { x: e.clientX, y: e.clientY };

    const worldDx = -(dx / rect.width) * viewWidth;
    const worldDy = -(dy / rect.height) * viewHeight;

    setPanWorld((prev) => ({
      x: prev.x + worldDx,
      y: prev.y + worldDy,
    }));
  };

  const handlePointerUp = () => {
    draggingRef.current = false;

    if (!movedRef.current) {
      setSelectedCity(null);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#01040d]">
      <div className="absolute inset-0 bg-[#01040d]" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0d2a66_0%,#01040d_68%)]" />

      {/* MAP VIEWPORT */}
      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* CONTINENT GLOW UNDERLAY */}
        <motion.div
          className="absolute opacity-[0.42] pointer-events-none"
          animate={worldLayerStyle}
          transition={{ type: "spring", stiffness: 90, damping: 24 }}
          style={{
            backgroundImage: MAP_IMAGE,
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            filter: "brightness(3.2) contrast(1.8) saturate(0) blur(4px)",
          }}
        />

        {/* MAIN MAP, LIGHTER LAND */}
        <motion.div
          className="absolute opacity-[0.76] pointer-events-none"
          animate={worldLayerStyle}
          transition={{ type: "spring", stiffness: 90, damping: 24 }}
          style={{
            backgroundImage: MAP_IMAGE,
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            filter: "brightness(2.75) contrast(1.55) saturate(0)",
          }}
        />

        {/* SUBTLE MAP SHARPNESS LAYER */}
        <motion.div
          className="absolute opacity-[0.16] pointer-events-none mix-blend-screen"
          animate={worldLayerStyle}
          transition={{ type: "spring", stiffness: 90, damping: 24 }}
          style={{
            backgroundImage: MAP_IMAGE,
            backgroundRepeat: "no-repeat",
            backgroundSize: "100% 100%",
            filter: "brightness(4) contrast(2.2) saturate(0)",
          }}
        />

        {/* CITY NODES */}
        {cities.map((city) => {
          const friendCount = city.friends.length;
          const active = friendCount > 0;

          const coreSize = active ? 15 + Math.min(friendCount * 2, 10) : 10;
          const glowSize = active ? 60 + friendCount * 10 : 28;
          const ringSize = coreSize + 14;
          const labelGap = ringSize / 2 + 22;
          const isSelected = selectedCity?.id === city.id;

          return (
            <motion.button
              key={city.id}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (active) setSelectedCity(city);
              }}
              animate={{
                left: `${projectX(city.x)}%`,
                top: `${projectY(city.y)}%`,
              }}
              whileHover={{ scale: active ? 1.05 : 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 22 }}
              className={`absolute z-30 flex items-center ${
                active ? "cursor-pointer" : "cursor-default"
              }`}
              style={{
                x: "-50%",
                y: "-50%",
                padding: 18,
              }}
            >
              <div className="relative flex items-center">
                <div
                  className="relative flex items-center justify-center"
                  style={{ width: ringSize, height: ringSize }}
                >
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
                      active ? "bg-pink-400/45" : "bg-white/10"
                    }`}
                    style={{
                      width: glowSize,
                      height: glowSize,
                    }}
                  />

                  <div
                    className={`absolute rounded-full border ${
                      isSelected ? "border-pink-100" : "border-white/65"
                    }`}
                    style={{
                      width: ringSize,
                      height: ringSize,
                    }}
                  />

                  <div
                    className={`relative rounded-full ${
                      active ? "bg-[#ffb8f0]" : "bg-white/20"
                    }`}
                    style={{
                      width: coreSize,
                      height: coreSize,
                    }}
                  />
                </div>

                <div
                  className="whitespace-nowrap text-left"
                  style={{ marginLeft: labelGap - ringSize / 2 }}
                >
                  <div
                    className={`font-medium tracking-tight leading-none ${
                      active
                        ? "text-white text-[16px]"
                        : "text-white/50 text-[15px]"
                    }`}
                  >
                    {city.name}
                  </div>

                  <div
                    className={`mt-1 ${
                      active
                        ? "text-white/42 text-[13px]"
                        : "text-white/22 text-[13px]"
                    }`}
                  >
                    {friendCount} friend{friendCount !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="absolute inset-0 bg-blue-500/[0.07] pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.055] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: "160px 160px",
        }}
      />

      <motion.div
        animate={{ opacity: [0.14, 0.22, 0.14] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[-8%] top-[-10%] w-[900px] h-[900px] bg-blue-500/14 blur-3xl rounded-full pointer-events-none"
      />

      <motion.div
        animate={{ opacity: [0.08, 0.16, 0.08] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-15%] bottom-[-20%] w-[850px] h-[850px] bg-purple-500/10 blur-3xl rounded-full pointer-events-none"
      />

      <div className="absolute inset-0 bg-black/06 pointer-events-none" />

      {/* TITLE */}
      <div className="absolute top-7 left-7 z-40 pointer-events-none">
        <h1 className="text-5xl font-semibold tracking-tight text-white leading-none">
          connctd
        </h1>
        <p className="text-white/42 mt-2 text-base">post-grad social atlas</p>
      </div>

      {/* ZOOM CONTROLS */}
      <div className="absolute bottom-7 left-7 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={zoomOutMap}
          className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.05] text-white/80 backdrop-blur-xl hover:bg-white/[0.1] transition"
        >
          −
        </button>

        <button
          type="button"
          onClick={zoomIn}
          className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.05] text-white/80 backdrop-blur-xl hover:bg-white/[0.1] transition"
        >
          +
        </button>

        <button
          type="button"
          onClick={resetView}
          className="h-10 px-4 rounded-full border border-white/15 bg-white/[0.05] text-white/70 text-sm backdrop-blur-xl hover:bg-white/[0.1] transition"
        >
          reset
        </button>
      </div>

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

            <div className="relative h-full flex flex-col p-9">
              <div className="flex items-start justify-between shrink-0">
                <div>
                  <h2 className="text-[34px] font-semibold text-white leading-none">
                    {selectedCity.name}
                  </h2>

                  <p className="text-white/35 mt-3 text-base">
                    {selectedCity.friends.length} friends
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCity(null)}
                  className="text-white/30 hover:text-white transition text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mt-10 flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-4">
                {selectedCity.friends.map((friend: any, index: number) => (
                  <motion.div
                    key={`${friend.name}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:bg-white/[0.05] transition shrink-0"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-[20px] leading-none text-white font-medium">
                          {friend.name}
                        </h3>

                        {friend.note && (
                          <p className="text-white/30 mt-2 text-[13px] leading-snug">
                            {friend.note}
                          </p>
                        )}
                      </div>

                      <div className="w-3 h-3 rounded-full bg-green-400 shadow-[0_0_14px_rgba(74,222,128,0.95)] shrink-0" />
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
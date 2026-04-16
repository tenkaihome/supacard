// "use client";

// import { useEffect, useState, useRef } from "react";

// const FLY_COUNT = 3;
// const RESPAWN_DELAY = 3000; // 3 seconds after death to spawn new one

// interface FlyState {
//   id: string; // Use string IDs for better management
//   x: number;
//   y: number;
//   rotation: number;
//   targetX: number;
//   targetY: number;
//   speed: number;
//   isCrawling: boolean;
//   isDead: boolean;
//   deathTime?: number;
// }

// const createFly = (id: string): FlyState => ({
//   id,
//   x: Math.random() * window.innerWidth,
//   y: Math.random() * window.innerHeight,
//   rotation: Math.random() * 360,
//   targetX: Math.random() * window.innerWidth,
//   targetY: Math.random() * window.innerHeight,
//   speed: 2 + Math.random() * 5,
//   isCrawling: false,
//   isDead: false,
// });

// export default function Flies() {
//   const [flies, setFlies] = useState<FlyState[]>([]);
//   const requestRef = useRef<number>(null);

//   useEffect(() => {
//     // Initial spawn
//     setFlies(Array.from({ length: FLY_COUNT }).map((_, i) => createFly(`initial-${i}`)));

//     const animate = () => {
//       setFlies((prevFlies) => {
//         const now = Date.now();
        
//         // Filter out flies that have been dead for a while and replace them
//         const activeFlies = prevFlies.filter(fly => !fly.isDead || (fly.deathTime && now - fly.deathTime < 8000));
        
//         // If count is low, we'll wait for the next frame to maybe spawn or just handle it here
//         // Actually, let's keep the dead ones for a bit but also spawn new ones if needed
//         const livingCount = activeFlies.filter(f => !f.isDead).length;
//         if (livingCount < FLY_COUNT && Math.random() > 0.98) {
//            activeFlies.push(createFly(`spawn-${now}-${Math.random()}`));
//         }

//         return activeFlies.map((fly) => {
//           if (fly.isDead) return fly;

//           let { x, y, targetX, targetY, rotation, speed, isCrawling } = fly;

//           const dx = targetX - x;
//           const dy = targetY - y;
//           const dist = Math.sqrt(dx * dx + dy * dy);

//           if (dist < 20) {
//             targetX = Math.random() * window.innerWidth;
//             targetY = Math.random() * window.innerHeight;
//             isCrawling = Math.random() > 0.6;
//             speed = isCrawling ? 0.3 + Math.random() * 0.7 : 4 + Math.random() * 6;
//           }

//           const angle = Math.atan2(dy, dx);
//           const targetRotation = (angle * 180) / Math.PI + 90;

//           let diff = targetRotation - rotation;
//           while (diff < -180) diff += 360;
//           while (diff > 180) diff -= 360;
//           rotation += diff * (isCrawling ? 0.05 : 0.2);

//           x += Math.cos(angle) * speed;
//           y += Math.sin(angle) * speed;

//           if (!isCrawling) {
//             x += (Math.random() - 0.5) * 6; // More erratic movement
//             y += (Math.random() - 0.5) * 6;
//           }

//           if (x < -100) x = window.innerWidth + 100;
//           if (x > window.innerWidth + 100) x = -100;
//           if (y < -100) y = window.innerHeight + 100;
//           if (y > window.innerHeight + 100) y = -100;

//           return { ...fly, x, y, targetX, targetY, rotation, speed, isCrawling };
//         });
//       });
//       requestRef.current = requestAnimationFrame(animate);
//     };

//     requestRef.current = requestAnimationFrame(animate);
//     return () => {
//       if (requestRef.current) cancelAnimationFrame(requestRef.current);
//     };
//   }, []);

//   const handleFlyClick = (id: string) => {
//     setFlies((prev) =>
//       prev.map((f) =>
//         f.id === id ? { ...f, isDead: true, deathTime: Date.now() } : f
//       )
//     );
//   };

//   return (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         width: "100vw",
//         height: "100vh",
//         pointerEvents: "none",
//         zIndex: 999999,
//         overflow: "hidden",
//       }}
//     >
//       {flies.map((fly) => (
//         <div
//           key={fly.id}
//           onClick={() => handleFlyClick(fly.id)}
//           style={{
//             position: "absolute",
//             left: fly.x,
//             top: fly.y,
//             width: "24px",
//             height: "24px",
//             pointerEvents: fly.isDead ? "none" : "auto",
//             cursor: "url('/swatter.svg') 16 8, crosshair",
//             transform: `rotate(${fly.rotation}deg) ${
//               fly.isDead ? "scaleY(-1) translateY(-5px)" : "scale(1)"
//             }`,
//             opacity: fly.isDead ? 0.3 : 1,
//             transition: fly.isDead ? "transform 0.4s ease-out, opacity 2s" : "none",
//             filter: fly.isDead ? "grayscale(100%) blur(1px)" : "none",
//           }}
//         >
//           <img
//             src="/fly.svg"
//             alt="fly"
//             style={{
//               width: "100%",
//               height: "100%",
//               objectFit: "contain",
//               filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.3))",
//             }}
//           />
//         </div>
//       ))}
//     </div>
//   );
// }

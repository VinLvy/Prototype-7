
import { motion } from 'framer-motion';

export default function AuroraBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950">
            {/* Ambient Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 opacity-80" />

            {/* Aurora Blobs */}
            <motion.div
                animate={{
                    x: ["-10%", "10%", "-10%"],
                    y: ["-10%", "10%", "-10%"],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/30 rounded-full blur-[120px] mix-blend-screen"
            />
            <motion.div
                animate={{
                    x: ["10%", "-10%", "10%"],
                    y: ["10%", "-10%", "10%"],
                    scale: [1.2, 1, 1.2],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-blue-500/20 rounded-full blur-[100px] mix-blend-screen"
            />
            <motion.div
                animate={{
                    x: ["-5%", "5%", "-5%"],
                    y: ["5%", "-5%", "5%"],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-teal-500/20 rounded-full blur-[130px] mix-blend-screen"
            />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-pink-500/20 rounded-full blur-[100px] mix-blend-screen"
            />

            {/* Grid Pattern Overlay for Texture */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none"></div>
        </div>
    );
}

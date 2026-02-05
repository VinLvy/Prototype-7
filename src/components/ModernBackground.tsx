export default function ModernBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950">
            {/* Base Gradient - Subtle deep blue/purple tint at the bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-[#0f172a]" />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Radial Vignette - Focuses attention to the center */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />

            {/* Top Light Glow - Very subtle ambient light source */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            {/* Bottom Accent Glow */}
            <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[300px] bg-purple-500/5 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
        </div>
    );
}

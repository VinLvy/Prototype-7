
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

export default function LevelUpCelebration({ show, onClose }: { show: boolean; onClose: () => void }) {
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Stop after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
            <Confetti
                width={dimensions.width}
                height={dimensions.height}
                recycle={false}
                numberOfPieces={500}
                gravity={0.15}
            />
            <div className="absolute animate-bounce text-6xl font-bold text-yellow-400 drop-shadow-lg"
                style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.8)' }}>
                LEVEL UP!
            </div>
        </div>
    );
}

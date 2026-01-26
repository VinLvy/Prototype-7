import { X, Lock, Unlock } from 'lucide-react';
import { TITLES, type TitleTier } from '../lib/titles';

interface TitlesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTitle: string | undefined;
    highestStat: number; // To show progress or what is unlocked
}

export default function TitlesModal({ isOpen, onClose, currentTitle, highestStat }: TitlesModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 overflow-hidden relative animate-scaleIn">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white">Title Progression</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {TITLES.map((tier: TitleTier) => {
                            const isUnlocked = highestStat >= tier.minStat;
                            const isCurrent = currentTitle === tier.name;

                            return (
                                <div
                                    key={tier.name}
                                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isCurrent
                                        ? `${tier.borderColor} bg-gray-800 shadow-lg shadow-${tier.color}/20 scale-[1.02]`
                                        : isUnlocked
                                            ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                                            : 'border-gray-800 bg-gray-900/50 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {isUnlocked ? (
                                                <div className={`p-1.5 rounded-full ${tier.bgGradient} border ${tier.borderColor}`}>
                                                    <Unlock size={14} className={tier.textColor} />
                                                </div>
                                            ) : (
                                                <div className="p-1.5 rounded-full bg-gray-800 border border-gray-700">
                                                    <Lock size={14} className="text-gray-500" />
                                                </div>
                                            )}

                                            <span className={`font-bold text-lg ${isUnlocked ? tier.textColor : 'text-gray-500'}`}>
                                                {tier.name}
                                            </span>
                                        </div>

                                        {isCurrent && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.borderColor} ${tier.textColor} bg-gray-900`}>
                                                EQUIPPED
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400">Requirement:</span>
                                        <span className={isUnlocked ? 'text-white font-medium' : 'text-gray-500'}>
                                            {tier.minStat === 0 ? 'None' : `Highest Stat ${tier.minStat}+`}
                                        </span>
                                    </div>

                                    {/* Progress Bar (Visual only) */}
                                    <div className="mt-3 h-1.5 w-full bg-red-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${isUnlocked ? tier.bgGradient : 'bg-blue-500'}`}
                                            style={{
                                                width: Math.min(100, Math.max(0, (highestStat / (tier.minStat || 1)) * 100)) + '%'
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

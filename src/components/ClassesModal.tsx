import { X, Lock, Unlock, Check } from 'lucide-react';
import { CLASSES, type CharacterClass } from '../lib/classes';
import { type UserStats } from '../lib/db';

interface ClassesModalProps {
    isOpen: boolean;
    onClose: () => void;
    userStats: UserStats | null;
    currentClassId: string | undefined;
    onSelectClass: (classId: string) => Promise<void>;
}

export default function ClassesModal({ isOpen, onClose, userStats, currentClassId, onSelectClass }: ClassesModalProps) {
    if (!isOpen) return null;

    // Default to 'novice' if no class is set
    const activeClassId = currentClassId || 'novice';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-700 overflow-hidden relative animate-scaleIn flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900/50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Character Classes</h2>
                        <p className="text-sm text-gray-400">Unlock new classes by honing your stats.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CLASSES.map((charClass: CharacterClass) => {
                            // Check specific requirement
                            const isUnlocked = userStats ? charClass.requirement(userStats) : false;
                            const isCurrent = activeClassId === charClass.id;
                            const Icon = charClass.icon;

                            return (
                                <div
                                    key={charClass.id}
                                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 group ${isCurrent
                                        ? `${charClass.borderColor} bg-gray-800 shadow-lg shadow-${charClass.color}/10 scale-[1.01]`
                                        : isUnlocked
                                            ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800'
                                            : 'border-gray-800 bg-gray-900/50 opacity-60 grayscale-[0.5]'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${isUnlocked ? charClass.bgGradient : 'bg-gray-800'} border ${isUnlocked ? charClass.borderColor : 'border-gray-700'} shadow-lg`}>
                                                <Icon size={24} className={isUnlocked ? charClass.color : 'text-gray-500'} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                                    {charClass.name}
                                                </h3>
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {charClass.uiRequirement}
                                                </p>
                                            </div>
                                        </div>

                                        {isCurrent ? (
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${charClass.borderColor} ${charClass.bgGradient} ${charClass.color}`}>
                                                <Check size={14} className="stroke-[3]" />
                                                <span className="text-xs font-bold tracking-wide">ACTIVE</span>
                                            </div>
                                        ) : isUnlocked ? (
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Unlock size={18} className="text-gray-400" />
                                            </div>
                                        ) : (
                                            <Lock size={18} className="text-gray-600" />
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">
                                        {charClass.description}
                                    </p>

                                    {/* Action Button */}
                                    <div className="mt-2">
                                        {isCurrent ? (
                                            <button disabled className="w-full py-2 rounded-lg bg-gray-700/50 text-gray-400 text-sm font-medium cursor-default">
                                                Current Class
                                            </button>
                                        ) : isUnlocked ? (
                                            <button // Functionality to select class
                                                onClick={() => onSelectClass(charClass.id)}
                                                className={`w-full py-2 rounded-lg border ${charClass.borderColor} text-white font-medium text-sm hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                                            >
                                                Select Class
                                            </button>
                                        ) : (
                                            <button disabled className="w-full py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-600 text-sm font-medium cursor-not-allowed">
                                                Locked
                                            </button>
                                        )}
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

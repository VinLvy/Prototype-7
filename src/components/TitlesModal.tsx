import { X, Lock, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import { TITLES, type Title } from '../lib/titles';
import { type UserStats } from '../lib/db';

interface TitlesModalProps {
    isOpen: boolean;
    onClose: () => void;
    userStats: UserStats | null;
    currentTitleId: string | undefined;
    onSelectTitle: (titleId: string) => Promise<void>;
}

export default function TitlesModal({ isOpen, onClose, userStats, currentTitleId, onSelectTitle }: TitlesModalProps) {
    if (!isOpen) return null;

    // Use name or id for matching, trying to match current ID logic
    // But since currentTitleId might be a name (legacy), we need to be careful.
    // The parent likely passes the ID now, or we'll handle it.
    // Ideally we should match by ID. If currentTitleId is 'Novice' (name), it won't match 'novice' (id).
    // Let's rely on the parent or normalize here.
    // For now, assume strict ID matching, but maybe match name if ID not found?

    // Actually, let's just stick to ID. The DB migration/compat is handled elsewhere hopefully.
    // If the user has "Novice" in DB, and we pass that as currentTitleId, 
    // we might want to normalize it to lowercase for comparison if no direct match?
    // Let's do a loose check.

    const normalize = (s: string | undefined) => s?.toLowerCase();
    const activeTitleId = normalize(currentTitleId) || 'novice';

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-4xl border border-white/10 overflow-hidden relative animate-scaleIn flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-slate-900/50 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Titles</h2>
                        <p className="text-sm text-gray-400">Unlock prestige titles by increasing your stats.</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {TITLES.map((title: Title) => {
                            // Check requirement
                            const isUnlocked = userStats ? title.requirement(userStats) : false;

                            // Check if active (handle potential case sensitivity or legacy names)
                            // We compare normalized IDs/names
                            const isCurrent = activeTitleId === title.id || activeTitleId === title.name;

                            const Icon = title.icon;

                            return (
                                <div
                                    key={title.id}
                                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 group flex flex-col ${isCurrent
                                        ? `${title.borderColor} bg-gray-800 shadow-lg shadow-${title.color.replace('#', '').substring(0, 2)}-500/10 scale-[1.02] z-10`
                                        : isUnlocked
                                            ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800 hover:scale-[1.01]'
                                            : 'border-gray-800 bg-gray-900/50 opacity-60 grayscale-[0.8]'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-lg ${isUnlocked ? title.bgGradient : 'bg-gray-800'} border ${isUnlocked ? title.borderColor : 'border-gray-700'} shadow-lg`}>
                                                <Icon size={20} className={isUnlocked ? title.textColor : 'text-gray-500'} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-base ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                                                    {title.name}
                                                </h3>
                                                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wide">
                                                    {title.uiRequirement}
                                                </p>
                                            </div>
                                        </div>

                                        {isCurrent ? (
                                            <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${title.borderColor} ${title.bgGradient} ${title.textColor}`}>
                                                <Check size={12} className="stroke-[4]" />
                                            </div>
                                        ) : !isUnlocked && (
                                            <Lock size={16} className="text-gray-600 mt-1" />
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-400 mb-4 flex-1">
                                        {title.description}
                                    </p>

                                    {/* Action Button */}
                                    <div className="mt-auto">
                                        {isCurrent ? (
                                            <button disabled className="w-full py-1.5 rounded-lg bg-gray-700/50 text-gray-400 text-xs font-bold uppercase tracking-wide cursor-default">
                                                Active
                                            </button>
                                        ) : isUnlocked ? (
                                            <button
                                                onClick={() => onSelectTitle(title.id)}
                                                className={`w-full py-1.5 rounded-lg border ${title.borderColor} text-white font-medium text-xs hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
                                            >
                                                Select
                                            </button>
                                        ) : (
                                            <button disabled className="w-full py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-600 text-xs font-medium cursor-not-allowed">
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
        </div>,
        document.body
    );
}

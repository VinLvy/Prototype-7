import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const getColors = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/50',
                    button: 'bg-red-600 hover:bg-red-500 shadow-red-900/20'
                };
            case 'warning':
                return {
                    icon: 'text-amber-400',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/50',
                    button: 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/20'
                };
            default:
                return {
                    icon: 'text-purple-400',
                    bg: 'bg-purple-500/10',
                    border: 'border-purple-500/50',
                    button: 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
                };
        }
    };

    const colors = getColors();

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className={`absolute top-0 right-0 p-4 opacity-20 -mr-10 -mt-10`}>
                            <div className={`w-32 h-32 ${colors.bg} rounded-full blur-3xl`} />
                        </div>

                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className={`p-4 rounded-full ${colors.bg} ${colors.border} border mb-4`}>
                                <AlertTriangle className={`w-8 h-8 ${colors.icon}`} />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                            <p className="text-slate-400 text-sm mb-8 px-4">
                                {message}
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={onCancel}
                                    disabled={isLoading}
                                    className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 px-4 py-3 rounded-xl ${colors.button} text-white font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2`}
                                >
                                    {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmationModal;

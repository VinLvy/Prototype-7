import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export type NotificationType = 'error' | 'success' | 'info';

interface NotificationProps {
    message: string;
    type: NotificationType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
    message,
    type,
    isVisible,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const getColors = () => {
        switch (type) {
            case 'error':
                return 'bg-red-500/10 border-red-500/50 text-red-400';
            case 'success':
                return 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400';
            case 'info':
                return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
            default:
                return 'bg-slate-800/50 border-white/10 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'info':
                return <Info className="w-5 h-5" />;
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl min-w-[300px] max-w-md ${getColors()}`}
                >
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="flex-grow text-sm font-medium">
                        {message}
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Progress bar */}
                    {duration > 0 && (
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: duration / 1000, ease: "linear" }}
                            className={`absolute bottom-0 left-0 h-0.5 rounded-full ${type === 'error' ? 'bg-red-500' :
                                    type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                                }`}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Notification;

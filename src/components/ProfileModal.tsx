import React, { useState, useEffect } from 'react';
import { X, Save, User as UserIcon, Camera } from 'lucide-react';
import type { UserProfile } from '../lib/db';
import { uploadAvatar } from '../lib/storage';
import ImageCropper from './ImageCropper';
// import { getTitleConfig } from '../lib/titles';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile | null;
    onUpdate: (updates: Partial<UserProfile>) => Promise<void>;
}

export default function ProfileModal({ isOpen, onClose, userProfile, onUpdate }: ProfileModalProps) {
    const [username, setUsername] = useState('');
    // Title is now derived, not editable state
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // New state for cropping
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (userProfile) {
            setUsername(userProfile.username || '');
            setAvatarUrl(userProfile.avatar_url || '');
        }
    }, [userProfile]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedImage(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setSelectedImage(reader.result?.toString() || null);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsUploading(true);
        try {
            // Create a File object from the Blob
            const file = new File([croppedBlob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' });

            const uploadedUrl = await uploadAvatar(file);
            if (uploadedUrl) {
                setAvatarUrl(uploadedUrl);
                setSelectedImage(null); // Return to form
            } else {
                alert('Failed to upload image. Please try again.');
            }
        } catch (error) {
            console.error('File upload error:', error);
            alert('Error during upload.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancelCrop = () => {
        setSelectedImage(null);
        // Reset file input if needed, but not strictly necessary as we are controlled
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await onUpdate({ username, avatar_url: avatarUrl });
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <UserIcon className="text-purple-400" />
                    Edit Profile
                </h2>

                {selectedImage ? (
                    <div className="h-[400px]">
                        <ImageCropper
                            imageSrc={selectedImage}
                            onCropComplete={handleCropComplete}
                            onCancel={handleCancelCrop}
                        />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="relative group cursor-pointer">
                                <label htmlFor="avatar-upload" className="cursor-pointer block">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-500/30 bg-gray-700 relative">
                                        {isUploading ? (
                                            <div className="w-full h-full flex items-center justify-center bg-black/50">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                            </div>
                                        ) : avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <UserIcon size={40} />
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    </div>
                                </label>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Enter your username"
                            />
                        </div>

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Title / Class</label>
                            {(() => {
                                const titleConfig = getTitleConfig(userProfile?.title);
                                return (
                                    <div className={`w-full border rounded-lg px-4 py-2 bg-gradient-to-r flex items-center justify-between ${titleConfig.textColor} ${titleConfig.borderColor} ${titleConfig.bgGradient}`}>
                                        <span className="font-bold">{userProfile?.title || titleConfig.name}</span>
                                        <span className="text-xs opacity-75 border border-current px-2 py-0.5 rounded">Auto-Assigned</span>
                                    </div>
                                );
                            })()}
                        </div> */}

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { SlidersHorizontal } from 'lucide-react'; // Using Lucide icon as a visual cue, but regular input range for slider
import getCroppedImg from '../lib/cropImage';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => void;
    onCancel: () => void;
}

const ImageCropper = ({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels, onCropComplete]);

    return (
        <div className="flex flex-col h-full w-full">
            <div className="relative flex-1 w-full bg-black rounded-lg overflow-hidden min-h-[300px]">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={onZoomChange}
                    showGrid={false}
                    cropShape="round"
                />
            </div>

            <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={20} className="text-gray-400" />
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-purple-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={showCroppedImage}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-lg hover:shadow-purple-900/30 transition-all"
                    >
                        Crop & Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropper;

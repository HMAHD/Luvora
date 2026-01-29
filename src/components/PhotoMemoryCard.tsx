'use client';

import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Image as ImageIcon,
    Upload,
    X,
    Download,
    Share2,
    Trash2,
    RotateCw,
    Heart,
    Sparkles,
    Camera
} from 'lucide-react';

interface PhotoMemoryCardProps {
    isOpen: boolean;
    onClose: () => void;
    sparkContent: string;
    partnerName?: string;
}

const CARD_STYLES = [
    {
        id: 'romantic',
        name: 'Romantic',
        overlay: 'from-rose-500/40 via-pink-500/30 to-transparent',
        textBg: 'bg-rose-950/80',
        accent: 'text-rose-200'
    },
    {
        id: 'golden',
        name: 'Golden Hour',
        overlay: 'from-amber-500/40 via-orange-500/30 to-transparent',
        textBg: 'bg-amber-950/80',
        accent: 'text-amber-200'
    },
    {
        id: 'dreamy',
        name: 'Dreamy',
        overlay: 'from-purple-500/40 via-indigo-500/30 to-transparent',
        textBg: 'bg-purple-950/80',
        accent: 'text-purple-200'
    },
    {
        id: 'ocean',
        name: 'Ocean',
        overlay: 'from-cyan-500/40 via-blue-500/30 to-transparent',
        textBg: 'bg-cyan-950/80',
        accent: 'text-cyan-200'
    },
    {
        id: 'forest',
        name: 'Forest',
        overlay: 'from-emerald-500/40 via-green-500/30 to-transparent',
        textBg: 'bg-emerald-950/80',
        accent: 'text-emerald-200'
    },
    {
        id: 'noir',
        name: 'Noir',
        overlay: 'from-gray-900/60 via-gray-800/40 to-transparent',
        textBg: 'bg-gray-950/90',
        accent: 'text-gray-200'
    }
];

export function PhotoMemoryCard({ isOpen, onClose, sparkContent, partnerName }: PhotoMemoryCardProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState(CARD_STYLES[0]);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const downloadCard = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            // Use html2canvas or similar library in production
            // For now, we'll create a simple canvas-based export
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            canvas.width = 1080;
            canvas.height = 1920;

            // Draw background
            if (selectedImage) {
                const img = new window.Image();
                img.crossOrigin = 'anonymous';
                await new Promise((resolve) => {
                    img.onload = resolve;
                    img.src = selectedImage;
                });

                // Cover fill
                const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            } else {
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            // Add gradient overlay
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height * 0.4);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'italic 48px Georgia';
            ctx.textAlign = 'center';

            // Word wrap the spark content
            const maxWidth = canvas.width - 120;
            const words = sparkContent.split(' ');
            const lines: string[] = [];
            let currentLine = '';

            words.forEach(word => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            });
            lines.push(currentLine);

            // Draw lines
            const lineHeight = 60;
            const startY = canvas.height - 200 - (lines.length * lineHeight);
            lines.forEach((line, i) => {
                ctx.fillText(`"${line}"`, canvas.width / 2, startY + (i * lineHeight));
            });

            // Add Luvora branding
            ctx.font = '24px sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillText('luvora.love', canvas.width / 2, canvas.height - 60);

            // Download
            const link = document.createElement('a');
            link.download = `luvora-memory-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to generate image:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    const shareCard = async () => {
        if (!navigator.share) {
            alert('Sharing is not supported on this device');
            return;
        }

        try {
            await navigator.share({
                title: 'A Spark from Luvora',
                text: sparkContent,
                url: 'https://luvora.love'
            });
        } catch (err) {
            // AbortError is expected when user cancels the share dialog
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            console.error('Failed to share:', err);
        }
    };

    const handleClose = () => {
        setSelectedImage(null);
        setSelectedStyle(CARD_STYLES[0]);
        onClose();
    };

    if (!isOpen) return null;
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-base-100 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-base-content/10 max-h-[90vh] overflow-y-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-content/10">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" />
                        Photo Memory Card
                    </h2>
                    <button onClick={handleClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Card Preview */}
                    <div
                        ref={cardRef}
                        className="relative aspect-[9/16] max-h-[400px] mx-auto rounded-2xl overflow-hidden shadow-xl"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        {selectedImage ? (
                            <>
                                <img
                                    src={selectedImage}
                                    alt="Memory"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${selectedStyle.overlay}`} />
                            </>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-base-300 to-base-200 flex flex-col items-center justify-center">
                                <ImageIcon className="w-16 h-16 text-base-content/20 mb-4" />
                                <p className="text-base-content/40 text-sm">Drop an image or click to upload</p>
                            </div>
                        )}

                        {/* Text Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className={`${selectedStyle.textBg} rounded-xl p-4 backdrop-blur-sm`}>
                                <p className="text-white text-center italic text-sm sm:text-base leading-relaxed">
                                    &ldquo;{sparkContent}&rdquo;
                                </p>
                                {partnerName && (
                                    <p className={`text-center text-xs mt-2 ${selectedStyle.accent}`}>
                                        For {partnerName}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-3">
                                <Heart className="w-3 h-3 text-white/50" />
                                <span className="text-white/50 text-xs">luvora.love</span>
                            </div>
                        </div>

                        {/* Remove Image Button */}
                        {selectedImage && (
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-3 right-3 btn btn-circle btn-sm bg-black/50 hover:bg-black/70 border-none text-white"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Upload Button */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline w-full gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        {selectedImage ? 'Change Photo' : 'Upload Photo'}
                    </button>

                    {/* Style Selector */}
                    <div>
                        <p className="text-sm font-medium mb-2">Card Style</p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {CARD_STYLES.map(style => (
                                <button
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all ${
                                        selectedStyle.id === style.id
                                            ? 'bg-primary text-primary-content'
                                            : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                                    }`}
                                >
                                    {style.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={downloadCard}
                            disabled={isGenerating}
                            className="btn btn-primary flex-1 gap-2"
                        >
                            {isGenerating ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Download
                                </>
                            )}
                        </button>
                        <button
                            onClick={shareCard}
                            className="btn btn-outline flex-1 gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}

// Button to trigger the modal
export function PhotoMemoryButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="btn btn-outline btn-sm gap-2"
        >
            <Camera className="w-4 h-4" />
            Create Memory Card
        </button>
    );
}

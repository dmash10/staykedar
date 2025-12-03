import { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, ImageIcon, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BannerImageUploadProps {
    /**
     * Current image URL (if editing existing banner)
     */
    value?: string;

    /**
     * Callback when upload completes successfully
     */
    onChange: (imageUrl: string) => void;

    /**
     * Optional className for styling
     */
    className?: string;

    /**
     * Aspect ratio hint for optimal sizing
     */
    aspectRatio?: 'wide' | 'square' | 'portrait';
}

export default function BannerImageUpload({
    value,
    onChange,
    className,
    aspectRatio = 'wide'
}: BannerImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    // Aspect ratio recommendations
    const aspectRatioInfo = {
        wide: { ratio: '16:9', recommended: '1200x675px', description: 'Best for hero and homepage banners' },
        square: { ratio: '1:1', recommended: '800x800px', description: 'Best for sidebar and popup banners' },
        portrait: { ratio: '4:5', recommended: '800x1000px', description: 'Best for mobile banners' },
    };

    const info = aspectRatioInfo[aspectRatio];

    /**
     * Upload image to Supabase Storage
     */
    const uploadImage = useCallback(async (file: File) => {
        try {
            setUploading(true);
            setUploadProgress(0);

            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please upload a JPG, PNG, WebP, or GIF image.',
                    variant: 'destructive',
                });
                return;
            }

            // Validate file size (5MB max)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                toast({
                    title: 'File too large',
                    description: 'Please upload an image smaller than 5MB.',
                    variant: 'destructive',
                });
                return;
            }

            // Generate unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `banners/${fileName}`;

            // Simulate upload progress (Supabase doesn't provide real progress)
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('banner-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (error) {
                throw error;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('banner-images')
                .getPublicUrl(filePath);

            // Call onChange with the new URL
            onChange(publicUrl);

            toast({
                title: 'Upload successful!',
                description: 'Your banner image has been uploaded.',
            });

        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload failed',
                description: error.message || 'Failed to upload image. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [onChange, toast]);

    /**
     * Handle file selection via input
     */
    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadImage(file);
        }
    }, [uploadImage]);

    /**
     * Handle drag and drop
     */
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            uploadImage(file);
        }
    }, [uploadImage]);

    /**
     * Delete current image
     */
    const handleDelete = useCallback(async () => {
        if (!value) return;

        try {
            // Extract file path from URL
            const urlParts = value.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const filePath = `banners/${fileName}`;

            // Delete from storage (optional - you might want to keep old images)
            const { error } = await supabase.storage
                .from('banner-images')
                .remove([filePath]);

            if (error) {
                console.warn('Could not delete old image:', error);
            }

            // Clear the value
            onChange('');

            toast({
                title: 'Image removed',
                description: 'The banner image has been removed.',
            });
        } catch (error) {
            console.error('Delete error:', error);
        }
    }, [value, onChange, toast]);

    return (
        <div className={cn('space-y-3', className)}>
            {/* Info box */}
            <div className="text-xs text-gray-400 bg-[#1A1A1A] p-3 rounded-lg border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-1">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-medium text-gray-300">Recommended: {info.recommended}</span>
                </div>
                <p>{info.description} (Ratio: {info.ratio})</p>
            </div>

            {/* Current image preview or upload area */}
            {value && !uploading ? (
                <div className="relative group rounded-lg overflow-hidden border-2 border-[#2A2A2A]">
                    <img
                        src={value}
                        alt="Banner preview"
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                            Replace
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                        </Button>
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Uploaded
                    </div>
                </div>
            ) : (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
                        dragActive
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-[#2A2A2A] hover:border-[#3A3A3A] bg-[#0A0A0A]',
                        uploading && 'cursor-not-allowed opacity-60'
                    )}
                >
                    {uploading ? (
                        <div className="space-y-3">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-400 mx-auto" />
                            <p className="text-sm text-gray-300">Uploading image...</p>
                            <div className="w-full bg-[#2A2A2A] rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-blue-500 h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500">{uploadProgress}%</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Upload className="w-10 h-10 text-gray-500 mx-auto" />
                            <div>
                                <p className="text-sm text-gray-300 font-medium mb-1">
                                    {dragActive ? 'Drop image here' : 'Click to upload or drag and drop'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    JPG, PNG, WebP, or GIF (max 5MB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleFileInput}
                className="hidden"
            />
        </div>
    );
}

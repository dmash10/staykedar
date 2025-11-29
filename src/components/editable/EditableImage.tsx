import { useState, useCallback, useEffect } from 'react';
import { useEdit } from '@/contexts/EditContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X, AlertTriangle, Upload, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableImageProps {
  section: string;
  contentKey: string;
  defaultValue: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}

export const EditableImage = ({
  section,
  contentKey,
  defaultValue,
  alt,
  className,
  imgClassName
}: EditableImageProps) => {
  const { isEditMode, saveContent, getContent } = useEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImageError, setIsImageError] = useState(false);

  // Load content on mount
  useEffect(() => {
    const savedContent = getContent(section, contentKey, defaultValue);
    setValue(savedContent);
    setInputValue(savedContent);
  }, [section, contentKey, defaultValue, getContent]);

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // Don't save if content hasn't changed
      if (inputValue === value) {
        setIsEditing(false);
        return;
      }
      
      const success = await saveContent(section, contentKey, inputValue);
      
      if (success) {
        setValue(inputValue);
        setIsEditing(false);
      } else {
        throw new Error("Failed to save image URL");
      }
    } catch (err) {
      console.error(`Error saving image for ${section}.${contentKey}:`, err);
      setError("Failed to save image URL");
    } finally {
      setIsSaving(false);
    }
  }, [inputValue, value, section, contentKey, saveContent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
    setInputValue(value);
  }, [value]);

  const handleUpload = useCallback(() => {
    // In a real implementation, this would open a file picker and upload the file
    // For now, we'll just simulate it with a placeholder URL
    const placeholderUrl = 'https://source.unsplash.com/random/1200x800';
    setInputValue(placeholderUrl);
  }, []);

  // Reset image error state when value changes
  useEffect(() => {
    setIsImageError(false);
  }, [value]);

  // If not in edit mode, just display the image
  if (!isEditMode) {
    return (
      <div className={cn("relative", className)}>
        <img
          src={value}
          alt={alt}
          className={cn("object-cover w-full h-full", imgClassName)}
          onError={() => setIsImageError(true)}
        />
        {isImageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <p className="text-sm text-muted-foreground">Image failed to load</p>
          </div>
        )}
      </div>
    );
  }

  // In edit mode but not currently editing this specific element
  if (!isEditing) {
    return (
      <div className={cn("relative group", className)}>
        <img
          src={value}
          alt={alt}
          className={cn("object-cover w-full h-full cursor-pointer hover:opacity-80", imgClassName)}
          onClick={() => setIsEditing(true)}
          onError={() => setIsImageError(true)}
        />
        {isImageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <p className="text-sm text-muted-foreground">Image failed to load</p>
          </div>
        )}
        <Button
          size="sm"
          variant="outline"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4 mr-1" /> Edit Image
        </Button>
      </div>
    );
  }

  // Currently editing this element
  return (
    <div className={cn("relative", className)}>
      {error && (
        <div className="mb-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm flex items-start">
          <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="border rounded-md p-4 bg-white">
        <div className="mb-4 aspect-video relative">
          <img
            src={inputValue}
            alt={alt}
            className="object-cover rounded w-full h-full"
            onError={() => setIsImageError(true)}
          />
          {isImageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
              <p className="text-sm text-muted-foreground">Image failed to load</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter image URL"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleUpload}
              type="button"
            >
              <Upload className="h-4 w-4 mr-1" /> Upload
            </Button>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 
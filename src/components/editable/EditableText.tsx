import { useState, useCallback, useEffect } from 'react';
import { useEdit } from '@/contexts/EditContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X, AlertTriangle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTextProps {
  section: string;
  contentKey: string;
  defaultValue: string;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

export const EditableText = ({
  section,
  contentKey,
  defaultValue,
  className,
  placeholder = 'Type something...',
  multiline = false,
  rows = 3
}: EditableTextProps) => {
  const { isEditMode, saveContent, getContent } = useEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error("Failed to save content");
      }
    } catch (err) {
      console.error(`Error saving content for ${section}.${contentKey}:`, err);
      setError("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  }, [inputValue, value, section, contentKey, saveContent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
    setInputValue(value);
  }, [value]);

  // If not in edit mode, just display the content
  if (!isEditMode) {
    return (
      <div className={className}>
        {multiline ? (
          <div className="whitespace-pre-wrap">{value}</div>
        ) : (
          <span>{value}</span>
        )}
      </div>
    );
  }

  // In edit mode but not currently editing this specific element
  if (!isEditing) {
    return (
      <div className={cn("relative group", className)}>
        <div 
          className="cursor-pointer hover:ring-2 hover:ring-primary/50 rounded p-1"
          onClick={() => setIsEditing(true)}
        >
          {multiline ? (
            <div className="whitespace-pre-wrap">{value}</div>
          ) : (
            <span>{value}</span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4 mr-1" /> Edit
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
      
      <div className="border rounded-md p-2 bg-white">
        {multiline ? (
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="resize-y"
          />
        ) : (
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
          />
        )}
        
        <div className="flex justify-end gap-2 mt-4">
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
  );
}; 
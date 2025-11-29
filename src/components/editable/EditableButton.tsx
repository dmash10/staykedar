import { useState, useCallback, useEffect, ReactNode } from 'react';
import { useEdit } from '@/contexts/EditContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, X, AlertTriangle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableButtonProps {
  section: string;
  contentKey: string;
  defaultValue: string;
  className?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  href?: string;
  asChild?: boolean;
}

export const EditableButton = ({
  section,
  contentKey,
  defaultValue,
  className,
  onClick,
  icon,
  variant = 'default',
  size = 'default',
  href,
  asChild
}: EditableButtonProps) => {
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
      setError("Failed to save button text");
    } finally {
      setIsSaving(false);
    }
  }, [inputValue, value, section, contentKey, saveContent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
    setInputValue(value);
  }, [value]);

  const handleButtonClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditing(true);
    } else if (onClick) {
      onClick();
    }
  };

  // If not in edit mode, just display the button
  if (!isEditMode) {
    return (
      <Button
        className={className}
        variant={variant}
        size={size}
        onClick={onClick}
        asChild={asChild}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {value || defaultValue}
      </Button>
    );
  }

  // In edit mode but not currently editing this specific element
  if (!isEditing) {
    return (
      <div className="relative group inline-block">
        <Button
          className={cn(className, "cursor-pointer hover:ring-2 hover:ring-primary/50")}
          variant={variant}
          size={size}
          onClick={handleButtonClick}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {value || defaultValue}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1 h-auto z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Currently editing this element
  return (
    <div className="relative z-50">
      {error && (
        <div className="mb-2 p-2 bg-destructive/10 text-destructive rounded-md text-sm flex items-start">
          <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="border rounded-md p-2 bg-white shadow-lg">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Button text"
          className="mb-2"
          autoFocus
        />
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Preview: 
            <Button
              variant={variant}
              size="sm"
              className="ml-2"
              disabled
            >
              {icon && <span className="mr-2">{icon}</span>}
              {inputValue || defaultValue}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCancel();
              }}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSave();
              }}
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
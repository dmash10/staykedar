import { useState, useCallback, useRef, useEffect } from 'react';
import { useEdit } from '@/contexts/EditContext';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, AlertTriangle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Editor } from '@tinymce/tinymce-react';

interface EditableRichTextProps {
  section: string;
  contentKey: string;
  defaultValue: string;
  className?: string;
  placeholder?: string;
  height?: number;
}

export const EditableRichText = ({
  section,
  contentKey,
  defaultValue,
  className,
  placeholder = 'Type something...',
  height = 400
}: EditableRichTextProps) => {
  const { isEditMode, saveContent, getContent } = useEdit();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<any>(null);

  // Load content on mount
  useEffect(() => {
    const savedContent = getContent(section, contentKey, defaultValue);
    setValue(savedContent);
  }, [section, contentKey, defaultValue, getContent]);

  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const newContent = editorRef.current.getContent();
      
      // Don't save if content hasn't changed
      if (newContent === value) {
        setIsEditing(false);
        return;
      }
      
      const success = await saveContent(section, contentKey, newContent);
      
      if (success) {
        setValue(newContent);
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
  }, [section, contentKey, value, saveContent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
  }, []);

  // If not in edit mode, just display the content
  if (!isEditMode) {
    return (
      <div 
        className={cn("prose max-w-none", className)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }

  // In edit mode but not currently editing this specific element
  if (!isEditing) {
    return (
      <div className={cn("relative group", className)}>
        <div 
          className="prose max-w-none cursor-pointer hover:ring-2 hover:ring-primary/50 rounded p-1"
          onClick={() => setIsEditing(true)}
          dangerouslySetInnerHTML={{ __html: value }}
        />
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
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        <div className={isLoading ? 'hidden' : ''}>
          <Editor
            apiKey="v3rqwaqvrtnmq8onoubsbafegnqulxyk438rogskgv7zo05w"
            onInit={(evt, editor) => {
              editorRef.current = editor;
              setIsLoading(false);
            }}
            initialValue={value}
            init={{
              height,
              menubar: true,
              plugins: [
                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 
                'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'checklist', 'mediaembed'
              ],
              toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
                'link image media table | align lineheight | ' +
                'checklist numlist bullist indent outdent | emoticons charmap | removeformat',
              content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }',
              placeholder,
              promotion: false,
              branding: false,
              images_upload_handler: (blobInfo, progress) => {
                return new Promise((resolve, reject) => {
                  // In a real implementation, you would upload to your server or a storage service
                  // For now, we'll just convert to base64
                  const reader = new FileReader();
                  reader.onload = () => {
                    resolve(reader.result as string);
                  };
                  reader.onerror = () => {
                    reject('Image upload failed');
                  };
                  reader.readAsDataURL(blobInfo.blob());
                });
              }
            }}
          />
        </div>
        
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
            disabled={isSaving || isLoading}
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
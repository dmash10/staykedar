import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Trash2, Image as ImageIcon, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
  url?: string;
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      // List all files in the 'blog-images' bucket (or a general 'media' bucket if preferred)
      // For now we'll assume a 'media' bucket or use 'blog-images' as a default
      const { data, error } = await supabase
        .storage
        .from('blog-images')
        .list();

      if (error) throw error;

      // Generate public URLs for each file
      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('blog-images')
            .getPublicUrl(file.name);

          return {
            ...file,
            url: publicUrl
          };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading media:', error);
      toast({
        title: 'Error',
        description: 'Failed to load media library',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

      loadFiles(); // Reload list
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    try {
      const { error } = await supabase
        .storage
        .from('blog-images')
        .remove([fileName]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Image deleted successfully',
      });

      setFiles(files.filter(f => f.name !== fileName));
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied',
      description: 'Image URL copied to clipboard',
    });
  };

  return (
    <AdminLayout title="Media Library">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-800">
          <CardTitle className="text-slate-200 text-lg font-medium">Media Files</CardTitle>
          <div>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="file-upload"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer"
                asChild
              >
                <span>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Image
                </span>
              </Button>
            </label>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-800 rounded-lg">
              <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
              <p>No images found</p>
              <p className="text-sm text-slate-500">Upload images to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => (
                <div key={file.id} className="group relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 aspect-square">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(file.url || '')}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(file.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-xs text-white truncate">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
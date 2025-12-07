import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, Trash2, Image as ImageIcon, Copy, ImagePlus, Link as LinkIcon, Mountain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [isSavingBg, setIsSavingBg] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [bgInputMode, setBgInputMode] = useState<'upload' | 'url'>('upload');

  // Background states
  const [attractionsBg, setAttractionsBg] = useState("");
  const [attractionsBgStyle, setAttractionsBgStyle] = useState<'image' | 'white'>('image');
  const [attractionsHeroImage, setAttractionsHeroImage] = useState("");

  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
    loadBackgrounds();
  }, []);

  const loadBackgrounds = async () => {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('value, key')
        .in('key', ['attractions_background', 'attractions_bg_style', 'attractions_hero_image']);

      if (data) {
        // @ts-ignore
        const attractions = data.find(d => d.key === 'attractions_background');
        if (attractions) setAttractionsBg(attractions.value);

        // @ts-ignore
        const bgStyle = data.find(d => d.key === 'attractions_bg_style');
        if (bgStyle) setAttractionsBgStyle(bgStyle.value as 'image' | 'white');

        // @ts-ignore
        const heroImage = data.find(d => d.key === 'attractions_hero_image');
        if (heroImage) setAttractionsHeroImage(heroImage.value);
      }
    } catch (error) {
      console.error('Error loading backgrounds', error);
    }
  };

  const handleBgFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBg(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `backgrounds/${key}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

      await saveBackground(key, publicUrl);

      if (key === 'attractions_background') setAttractionsBg(publicUrl);
      if (key === 'attractions_hero_image') setAttractionsHeroImage(publicUrl);

      toast({
        title: 'Success!',
        description: 'Background image uploaded and saved',
      });
    } catch (error) {
      console.error('Error uploading background:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload background. Make sure the "blog-images" bucket exists.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingBg(false);
    }
  };

  const saveBackground = async (key: string, url: string) => {
    try {
      setIsSavingBg(true);
      const { error } = await supabase
        .from('site_content')
        .upsert({
          key,
          value: url,
          section: 'media',
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: 'Saved!',
        description: 'Background updated successfully',
      });
    } catch (error) {
      console.error('Error saving background:', error);
      toast({
        title: 'Error',
        description: 'Failed to save background',
        variant: 'destructive',
      });
    } finally {
      setIsSavingBg(false);
    }
  };

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .storage
        .from('blog-images')
        .list();

      if (error) throw error;

      const filesWithUrls = await Promise.all(
        (data || []).map(async (file) => {
          const { data: { publicUrl } } = supabase
            .storage
            .from('blog-images')
            .getPublicUrl(file.name);
          return { ...file, url: publicUrl };
        })
      );

      setFiles(filesWithUrls);
    } catch (error) {
      console.error('Error loading media:', error);
      // Don't show toast on load error to avoid spamming if bucket is missing
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

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

      loadFiles();
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

  const BackgroundControl = ({ title, value, setValue, dbKey }: { title: string, value: string, setValue: (v: string) => void, dbKey: string }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-white text-sm font-medium">{title}</label>
        <div className="flex bg-[#1A1A1A] rounded-lg p-1">
          <button
            onClick={() => setBgInputMode('upload')}
            className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${bgInputMode === 'upload' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Upload className="w-3 h-3" /> Upload
          </button>
          <button
            onClick={() => setBgInputMode('url')}
            className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${bgInputMode === 'url' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <LinkIcon className="w-3 h-3" /> URL
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1">
          {bgInputMode === 'upload' ? (
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id={`bg-upload-${dbKey}`}
                onChange={(e) => handleBgFileUpload(e, dbKey)}
              />
              <Button
                onClick={() => document.getElementById(`bg-upload-${dbKey}`)?.click()}
                disabled={isUploadingBg}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
              >
                {isUploadingBg ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                ) : (
                  <><ImagePlus className="h-4 w-4 mr-2" /> Choose Image</>
                )}
              </Button>
              <p className="text-slate-500 text-xs">Upload directly to Supabase storage</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter image URL..."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-slate-500"
                />
                <Button
                  onClick={() => saveBackground(dbKey, value)}
                  disabled={isSavingBg}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSavingBg ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
              <p className="text-slate-500 text-xs">Use an existing image URL</p>
            </div>
          )}
        </div>

        {value && (
          <div className="w-64 aspect-[21/9] bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#2A2A2A] relative group">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs">Current Background</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout title="Media Library">
      <Tabs defaultValue="attractions" className="w-full mb-6">
        <TabsList className="bg-[#111111] border border-[#2A2A2A] text-slate-400">
          <TabsTrigger value="attractions" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
            <Mountain className="w-4 h-4 mr-2" />
            Attractions
          </TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-[#1A1A1A] data-[state=active]:text-white">
            <ImageIcon className="w-4 h-4 mr-2" />
            General Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attractions" className="mt-6">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardHeader className="pb-4 border-b border-[#2A2A2A]">
              <CardTitle className="text-white text-lg font-medium flex items-center gap-2">
                <Mountain className="w-5 h-5 text-blue-400" />
                Attractions Page Settings
              </CardTitle>
              <p className="text-slate-400 text-sm mt-1">Manage background images and media for the Attractions page</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Background Style Toggle */}
              <div className="space-y-3">
                <label className="text-white text-sm font-medium">Background Style</label>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      setAttractionsBgStyle('image');
                      await saveBackground('attractions_bg_style', 'image');
                    }}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${attractionsBgStyle === 'image'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-10 rounded bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Mountain className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${attractionsBgStyle === 'image' ? 'text-blue-400' : 'text-slate-400'}`}>
                        Image Background
                      </span>
                      <span className="text-xs text-slate-500">Shows background image with dark overlay</span>
                    </div>
                  </button>
                  <button
                    onClick={async () => {
                      setAttractionsBgStyle('white');
                      await saveBackground('attractions_bg_style', 'white');
                    }}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${attractionsBgStyle === 'white'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-[#2A2A2A] bg-[#1A1A1A] hover:border-[#3A3A3A]'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-16 h-10 rounded bg-white border border-slate-200 flex items-center justify-center">
                        <Mountain className="w-5 h-5 text-slate-400" />
                      </div>
                      <span className={`text-sm font-medium ${attractionsBgStyle === 'white' ? 'text-blue-400' : 'text-slate-400'}`}>
                        White Background
                      </span>
                      <span className="text-xs text-slate-500">Clean white background</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Only show image upload if image background is selected */}
              {attractionsBgStyle === 'image' && (
                <BackgroundControl
                  title="Page Background Image"
                  value={attractionsBg}
                  setValue={setAttractionsBg}
                  dbKey="attractions_background"
                />
              )}

              {/* Hero Banner Image - Always visible */}
              <div className="pt-4 border-t border-[#2A2A2A]">
                <BackgroundControl
                  title="Hero Banner Image"
                  value={attractionsHeroImage}
                  setValue={setAttractionsHeroImage}
                  dbKey="attractions_hero_image"
                />
                <p className="text-slate-500 text-xs mt-2">
                  This image appears behind the hero section title. Works with both image and white backgrounds.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[#2A2A2A]">
              <CardTitle className="text-white text-lg font-medium">All Media Files</CardTitle>
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
                    <div key={file.id} className="group relative bg-[#1A1A1A] rounded-lg overflow-hidden border border-[#2A2A2A] aspect-square">
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
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
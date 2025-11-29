import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SiteContent {
  id: string;
  section: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

const SiteContentManager = () => {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentContent, setCurrentContent] = useState<SiteContent | null>(null);
  const [section, setSection] = useState("");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_content')
        .select('*')
        .order('section', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching site content:', error);
      toast({
        title: "Error",
        description: "Failed to load site content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentContent(null);
    setSection("");
    setKey("");
    setValue("");
  };

  const handleEdit = (content: SiteContent) => {
    setCurrentContent(content);
    setSection(content.section);
    setKey(content.key);
    setValue(content.value);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('site_content')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      setContents(contents.filter(content => content.id !== id));
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      
      if (currentContent?.id === id) {
        handleCreateNew();
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!section || !key || !value) {
      toast({
        title: "Error",
        description: "Section, key, and value are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSaving(true);
      const now = new Date().toISOString();
      
      if (currentContent) {
        // Update existing content
        const { error } = await supabase
          .from('site_content')
          .update({
            section,
            key,
            value,
            updated_at: now,
          })
          .eq('id', currentContent.id);
        
        if (error) {
          throw error;
        }
        
        setCurrentContent({
          ...currentContent,
          section,
          key,
          value,
          updated_at: now,
        });
        
        // Update contents list
        setContents(contents.map(content => 
          content.id === currentContent.id 
            ? { ...content, section, key, value, updated_at: now }
            : content
        ));
        
        toast({
          title: "Success",
          description: "Content updated successfully",
        });
      } else {
        // Create new content
        const { data, error } = await supabase
          .from('site_content')
          .insert({
            section,
            key,
            value,
            created_at: now,
            updated_at: now,
          })
          .select();
        
        if (error) {
          throw error;
        }
        
        const newContent = data[0];
        setCurrentContent(newContent);
        setContents([...contents, newContent]);
        
        toast({
          title: "Success",
          description: "Content created successfully",
        });
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Group contents by section
  const contentsBySection = contents.reduce((acc, content) => {
    if (!acc[content.section]) {
      acc[content.section] = [];
    }
    acc[content.section].push(content);
    return acc;
  }, {} as Record<string, SiteContent[]>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Site Content Manager</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </Button>
      </div>

      <Tabs defaultValue="editor">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="content">All Content</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <div className="space-y-4">
            <div>
              <Label htmlFor="section">Section</Label>
              <Input 
                id="section" 
                value={section} 
                onChange={(e) => setSection(e.target.value)} 
                placeholder="e.g. home, about, footer" 
              />
            </div>

            <div>
              <Label htmlFor="key">Key</Label>
              <Input 
                id="key" 
                value={key} 
                onChange={(e) => setKey(e.target.value)} 
                placeholder="e.g. title, description, button_text" 
              />
            </div>

            <div>
              <Label htmlFor="value">Value</Label>
              <Textarea 
                id="value" 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                placeholder="Content value" 
                rows={6}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-8 text-mist">
              <p>No content yet. Create your first content item!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(contentsBySection).map(([sectionName, sectionContents]) => (
                <div key={sectionName}>
                  <h3 className="text-lg font-medium mb-4 border-b pb-2">{sectionName}</h3>
                  <div className="space-y-4">
                    {sectionContents.map((content) => (
                      <Card key={content.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{content.key}</h4>
                              <p className="text-sm text-mist">
                                Last updated: {new Date(content.updated_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm mt-1 line-clamp-2">{content.value}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(content)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(content.id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteContentManager; 
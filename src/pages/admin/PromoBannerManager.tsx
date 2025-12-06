import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus,
    Trash2,
    Edit2,
    Image as ImageIcon,
    ExternalLink,
    Eye,
    EyeOff,
    Layout,
    Smartphone,
    Monitor,
    Globe,
} from "lucide-react";
import BannerImageUpload from "@/components/admin/BannerImageUpload";

interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    image_url: string;
    link_text?: string;
    link_url?: string;
    position: string;
    background_color?: string;
    text_color?: string;
    target_devices?: string[];
    target_pages?: string[];
    is_active: boolean;
    display_order: number;
}

// Type-safe accessor for tables not yet in generated Supabase types
// This is the professional pattern when working with tables created after type generation
const bannersTable = () => (supabase as any).from('banners');

const POSITIONS = [
    { value: "hero", label: "Hero Slider" },
    { value: "homepage", label: "Homepage Strip" },
    { value: "popup", label: "Popup Modal" },
    { value: "sidebar", label: "Sidebar" },
    { value: "footer", label: "Footer" },
    { value: "inline", label: "Inline Content" },
];

const DEFAULT_FORM: Partial<Banner> = {
    title: "",
    subtitle: "",
    image_url: "",
    link_text: "Learn More",
    link_url: "",
    position: "hero",
    background_color: "#0071c2",
    text_color: "#ffffff",
    target_devices: ["mobile", "tablet", "desktop"],
    target_pages: ["*"],
    is_active: true,
};

export default function PromoBannerManager() {
    const [activeTab, setActiveTab] = useState("hero");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [formData, setFormData] = useState<Partial<Banner>>(DEFAULT_FORM);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch banners
    const { data: banners = [], isLoading } = useQuery({
        queryKey: ["admin-promo-banners", activeTab],
        queryFn: async () => {
            const { data, error } = await bannersTable()
                .select("*")
                .eq("position", activeTab)
                .order("display_order", { ascending: true });

            if (error) throw error;
            return (data || []) as Banner[];
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: Partial<Banner>) => {
            if (selectedBanner) {
                const { error } = await bannersTable()
                    .update(data)
                    .eq("id", selectedBanner.id);
                if (error) throw error;
            } else {
                const { error } = await bannersTable().insert({
                    ...data,
                    display_order: banners.length + 1,
                });
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
            queryClient.invalidateQueries({ queryKey: ["public-banners"] });
            setIsModalOpen(false);
            setFormData(DEFAULT_FORM);
            setSelectedBanner(null);
            toast({
                title: selectedBanner ? "Updated!" : "Created!",
                description: "Banner saved successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await bannersTable().delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
            setIsDeleteDialogOpen(false);
            setSelectedBanner(null);
            toast({
                title: "Deleted",
                description: "Banner removed successfully.",
            });
        },
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
            const { error } = await bannersTable()
                .update({ is_active })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-promo-banners"] });
        },
    });

    const handleEdit = (banner: Banner) => {
        setSelectedBanner(banner);
        setFormData(banner);
        setIsModalOpen(true);
    };

    const handleDelete = (banner: Banner) => {
        setSelectedBanner(banner);
        setIsDeleteDialogOpen(true);
    };

    const handleCreate = () => {
        setSelectedBanner(null);
        setFormData({ ...DEFAULT_FORM, position: activeTab });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Layout className="w-5 h-5 text-blue-400" />
                        Promo Banners
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Manage main site banners by section
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Banner
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="bg-[#111111] border border-[#2A2A2A]">
                    {POSITIONS.map((pos) => (
                        <TabsTrigger
                            key={pos.value}
                            value={pos.value}
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            {pos.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    <Card className="bg-[#111111] border-[#2A2A2A]">
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-8 text-center text-gray-500">Loading...</div>
                            ) : banners.length === 0 ? (
                                <div className="p-12 text-center">
                                    <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-400">No banners found in this section.</p>
                                    <Button
                                        variant="link"
                                        onClick={handleCreate}
                                        className="text-blue-400"
                                    >
                                        Create first banner
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                                            <TableHead className="text-gray-400">Image</TableHead>
                                            <TableHead className="text-gray-400">Details</TableHead>
                                            <TableHead className="text-gray-400">Targeting</TableHead>
                                            <TableHead className="text-gray-400">Status</TableHead>
                                            <TableHead className="text-gray-400 text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {banners.map((banner) => (
                                            <TableRow
                                                key={banner.id}
                                                className="border-[#2A2A2A] hover:bg-[#1A1A1A]"
                                            >
                                                <TableCell>
                                                    <div className="w-24 h-14 rounded-md overflow-hidden bg-slate-800">
                                                        {banner.image_url ? (
                                                            <img
                                                                src={banner.image_url}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {banner.title}
                                                        </p>
                                                        {banner.subtitle && (
                                                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                                                {banner.subtitle}
                                                            </p>
                                                        )}
                                                        {banner.link_url && (
                                                            <div className="flex items-center gap-1 text-xs text-blue-400 mt-1">
                                                                <ExternalLink className="w-3 h-3" />
                                                                {banner.link_text || "Link"}
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <Monitor className="w-3 h-3" />
                                                            {banner.target_devices?.join(", ") || "All"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <Globe className="w-3 h-3" />
                                                            {banner.target_pages?.includes("*")
                                                                ? "All Pages"
                                                                : `${banner.target_pages?.length} Pages`}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={banner.is_active}
                                                        onCheckedChange={(checked) =>
                                                            toggleMutation.mutate({
                                                                id: banner.id,
                                                                is_active: checked,
                                                            })
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(banner)}
                                                            className="text-gray-400 hover:text-white"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(banner)}
                                                            className="text-gray-400 hover:text-red-400"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedBanner ? "Edit Banner" : "New Banner"} ({activeTab})
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Banner Image</Label>
                                    <BannerImageUpload
                                        value={formData.image_url}
                                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                                        aspectRatio={activeTab === 'hero' ? 'wide' : activeTab === 'sidebar' ? 'square' : 'wide'}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A]"
                                        placeholder="Main heading"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Subtitle</Label>
                                    <Input
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="bg-[#1A1A1A] border-[#2A2A2A]"
                                        placeholder="Secondary text"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Background Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={formData.background_color}
                                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                                className="w-12 h-10 p-1 bg-[#1A1A1A] border-[#2A2A2A]"
                                            />
                                            <Input
                                                value={formData.background_color}
                                                onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                                                className="bg-[#1A1A1A] border-[#2A2A2A]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Text Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={formData.text_color}
                                                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                                                className="w-12 h-10 p-1 bg-[#1A1A1A] border-[#2A2A2A]"
                                            />
                                            <Input
                                                value={formData.text_color}
                                                onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                                                className="bg-[#1A1A1A] border-[#2A2A2A]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Link Text</Label>
                                        <Input
                                            value={formData.link_text}
                                            onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                                            className="bg-[#1A1A1A] border-[#2A2A2A]"
                                            placeholder="e.g. Book Now"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Link URL</Label>
                                        <Input
                                            value={formData.link_url}
                                            onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                                            className="bg-[#1A1A1A] border-[#2A2A2A]"
                                            placeholder="/packages/..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Target Pages (comma separated, use * for all)</Label>
                                    <Input
                                        value={formData.target_pages?.join(", ")}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                target_pages: e.target.value.split(",").map((s) => s.trim()),
                                            })
                                        }
                                        className="bg-[#1A1A1A] border-[#2A2A2A]"
                                        placeholder="*, /blog, /packages"
                                    />
                                </div>

                                <div className="pt-4 flex items-center justify-between">
                                    <Label>Active Status</Label>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => saveMutation.mutate(formData)}
                            disabled={saveMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {saveMutation.isPending ? "Saving..." : "Save Banner"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-[#111111] border-[#2A2A2A] text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Banner?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-[#1A1A1A] border-[#2A2A2A] text-white hover:bg-[#2A2A2A]">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedBanner && deleteMutation.mutate(selectedBanner.id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Heart,
    Trash2,
    Bell,
    BellOff,
    MapPin,
    Star,
    ExternalLink,
    Loader2,
    IndianRupee,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
    id: string;
    property_id: string | null;
    package_id: string | null;
    price_alert_enabled: boolean;
    target_price: number | null;
    created_at: string;
    properties?: {
        id: string;
        name: string;
        location: string;
        images: string[];
        price_per_night: number;
        rating: number;
    };
    packages?: {
        id: string;
        name: string;
        destination: string;
        images: string[];
        price: number;
        duration_days: number;
    };
}

export default function WishlistPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch wishlist
    const { data: wishlist, isLoading } = useQuery({
        queryKey: ['user-wishlist', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data, error } = await supabase
                .from('wishlists')
                .select(`
          *,
          properties (id, name, location, images, price_per_night, rating),
          packages (id, name, destination, images, price, duration_days)
        `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as WishlistItem[];
        },
        enabled: !!user?.id,
    });

    // Remove from wishlist
    const removeMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('wishlists').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast({ title: 'Removed from wishlist' });
            queryClient.invalidateQueries({ queryKey: ['user-wishlist'] });
        },
    });

    // Toggle price alert
    const toggleAlertMutation = useMutation({
        mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
            const { error } = await supabase
                .from('wishlists')
                .update({ price_alert_enabled: enabled })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: (_, { enabled }) => {
            toast({
                title: enabled ? 'Price alert enabled' : 'Price alert disabled',
                description: enabled ? "We'll notify you when the price drops" : '',
            });
            queryClient.invalidateQueries({ queryKey: ['user-wishlist'] });
        },
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
                <Nav />
                <div className="container mx-auto px-4 py-20 text-center">
                    <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to view your wishlist</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Save your favorite properties and get price alerts</p>
                    <Button onClick={() => navigate('/auth')} className="bg-blue-600 hover:bg-blue-700">
                        Sign In
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
            <Nav />

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                        My Wishlist
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {wishlist?.length || 0} saved {(wishlist?.length || 0) === 1 ? 'item' : 'items'}
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : wishlist && wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item) => {
                            const isProperty = !!item.properties;
                            const data = item.properties || item.packages;
                            if (!data) return null;

                            const image = isProperty
                                ? item.properties?.images?.[0]
                                : item.packages?.images?.[0];
                            const name = isProperty ? item.properties?.name : item.packages?.name;
                            const location = isProperty ? item.properties?.location : item.packages?.destination;
                            const price = isProperty ? item.properties?.price_per_night : item.packages?.price;
                            const link = isProperty
                                ? `/stays/${item.property_id}`
                                : `/packages/${item.package_id}`;

                            return (
                                <Card key={item.id} className="bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2A2A2A] overflow-hidden group">
                                    <div className="relative aspect-[4/3]">
                                        <img
                                            src={image || '/placeholder.svg'}
                                            alt={name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleAlertMutation.mutate({ id: item.id, enabled: !item.price_alert_enabled })}
                                                className={`h-8 w-8 rounded-full backdrop-blur-sm ${item.price_alert_enabled
                                                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                                        : 'bg-black/30 text-white hover:bg-black/50'
                                                    }`}
                                            >
                                                {item.price_alert_enabled ? (
                                                    <Bell className="w-4 h-4" />
                                                ) : (
                                                    <BellOff className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeMutation.mutate(item.id)}
                                                className="h-8 w-8 rounded-full bg-black/30 text-white hover:bg-red-500/30 hover:text-red-400 backdrop-blur-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        {!isProperty && item.packages?.duration_days && (
                                            <Badge className="absolute bottom-3 left-3 bg-blue-600">
                                                {item.packages.duration_days} Days
                                            </Badge>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1 line-clamp-1">
                                            {name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mb-3">
                                            <MapPin className="w-3 h-3" />
                                            {location}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                                    <IndianRupee className="w-4 h-4" />
                                                    {price?.toLocaleString()}
                                                </p>
                                                <p className="text-gray-500 text-xs">
                                                    {isProperty ? 'per night' : 'per person'}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => navigate(link)}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                View
                                            </Button>
                                        </div>
                                        {item.price_alert_enabled && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2A2A2A]">
                                                <p className="text-xs text-blue-400 flex items-center gap-1">
                                                    <Bell className="w-3 h-3" />
                                                    Price alert active
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#2A2A2A]">
                        <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Start saving your favorite properties and packages</p>
                        <div className="flex gap-4 justify-center">
                            <Button onClick={() => navigate('/stays')} variant="outline" className="border-gray-300 dark:border-[#2A2A2A]">
                                Browse Stays
                            </Button>
                            <Button onClick={() => navigate('/packages')} className="bg-blue-600 hover:bg-blue-700">
                                Explore Packages
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

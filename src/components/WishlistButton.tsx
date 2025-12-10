import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
    propertyId?: string;
    packageId?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export default function WishlistButton({
    propertyId,
    packageId,
    className,
    size = 'md',
    showLabel = false,
}: WishlistButtonProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if item is in wishlist
    useEffect(() => {
        if (!user?.id) return;

        const checkWishlist = async () => {
            let query = supabase
                .from('wishlists')
                .select('id')
                .eq('user_id', user.id);

            if (propertyId) {
                query = query.eq('property_id', propertyId);
            } else if (packageId) {
                query = query.eq('package_id', packageId);
            }

            const { data } = await query.single();
            setIsWishlisted(!!data);
        };

        checkWishlist();
    }, [user?.id, propertyId, packageId]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast({
                title: 'Sign in required',
                description: 'Please sign in to save to your wishlist',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        try {
            if (isWishlisted) {
                // Remove from wishlist
                let query = supabase
                    .from('wishlists')
                    .delete()
                    .eq('user_id', user.id);

                if (propertyId) {
                    query = query.eq('property_id', propertyId);
                } else if (packageId) {
                    query = query.eq('package_id', packageId);
                }

                await query;
                setIsWishlisted(false);
                toast({ title: 'Removed from wishlist' });
            } else {
                // Add to wishlist
                const insertData: any = { user_id: user.id };
                if (propertyId) insertData.property_id = propertyId;
                if (packageId) insertData.package_id = packageId;

                await supabase.from('wishlists').insert(insertData);
                setIsWishlisted(true);
                toast({ title: 'Added to wishlist', description: 'You can view saved items in your dashboard' });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update wishlist',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    if (showLabel) {
        return (
            <Button
                variant="outline"
                onClick={toggleWishlist}
                disabled={isLoading}
                className={cn(
                    'gap-2 transition-all duration-200',
                    isWishlisted
                        ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'border-gray-600 text-gray-400 hover:text-red-400 hover:border-red-500/50',
                    className
                )}
            >
                <Heart
                    className={cn(
                        iconSizes[size],
                        'transition-all duration-200',
                        isWishlisted ? 'fill-red-500 text-red-500' : ''
                    )}
                />
                {isWishlisted ? 'Saved' : 'Save'}
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleWishlist}
            disabled={isLoading}
            className={cn(
                sizeClasses[size],
                'rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200',
                isWishlisted && 'bg-red-500/20 hover:bg-red-500/30',
                className
            )}
        >
            <Heart
                className={cn(
                    iconSizes[size],
                    'transition-all duration-200',
                    isWishlisted
                        ? 'fill-red-500 text-red-500 scale-110'
                        : 'text-white hover:text-red-400'
                )}
            />
        </Button>
    );
}

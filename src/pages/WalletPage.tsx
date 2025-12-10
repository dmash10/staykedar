import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Gift,
    RefreshCw,
    Clock,
    CheckCircle2,
    IndianRupee,
    Share2,
    Copy,
    Send,
    Loader2,
    Plus,
    History,
    TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

// Transaction type configuration
const TRANSACTION_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    refund: { icon: RefreshCw, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Refund' },
    referral_bonus: { icon: Gift, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Referral Bonus' },
    promo_credit: { icon: Gift, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Promo Credit' },
    first_booking: { icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Welcome Bonus' },
    booking_payment: { icon: ArrowDownRight, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Booking Payment' },
    admin_credit: { icon: Plus, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Admin Credit' },
    admin_debit: { icon: ArrowDownRight, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Admin Debit' },
    expired: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Expired' },
};

export default function WalletPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch wallet data
    const { data: wallet, isLoading: walletLoading } = useQuery({
        queryKey: ['user-wallet', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;

            const { data, error } = await supabase
                .from('user_wallets')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        },
        enabled: !!user?.id,
    });

    // Fetch transactions
    const { data: transactions, isLoading: transactionsLoading } = useQuery({
        queryKey: ['wallet-transactions', wallet?.id],
        queryFn: async () => {
            if (!wallet?.id) return [];

            const { data, error } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('wallet_id', wallet.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            return data || [];
        },
        enabled: !!wallet?.id,
    });

    // Fetch referral code
    const { data: referral } = useQuery({
        queryKey: ['user-referral', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;

            const { data, error } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') {
                // No referral found, create one
                const code = `KEDAR-${user.id.slice(0, 6).toUpperCase()}`;
                const { data: newReferral } = await supabase
                    .from('referrals')
                    .insert({
                        referrer_id: user.id,
                        referral_code: code,
                        referrer_reward: 500,
                        referred_reward: 500,
                    })
                    .select()
                    .single();
                return newReferral;
            }
            return data;
        },
        enabled: !!user?.id,
    });

    // Copy referral code
    const copyReferralCode = () => {
        if (referral?.referral_code) {
            navigator.clipboard.writeText(referral.referral_code);
            toast({ title: 'Copied!', description: 'Referral code copied to clipboard' });
        }
    };

    // Share referral
    const shareReferral = () => {
        if (referral?.referral_code && navigator.share) {
            navigator.share({
                title: 'Get ₹500 off on StayKedar!',
                text: `Use my referral code ${referral.referral_code} and get ₹500 off your first Kedarnath booking!`,
                url: `https://staykedarnath.in?ref=${referral.referral_code}`,
            });
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0A0A0A]">
                <Nav />
                <div className="container mx-auto px-4 py-20 text-center">
                    <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in to view your wallet</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Access your trip credits and referral rewards</p>
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

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Wallet className="w-8 h-8 text-blue-500" />
                        My Wallet
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your trip credits and referral rewards</p>
                </div>

                {/* Balance Card */}
                <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 border-0 mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-200 text-sm font-medium">Available Balance</p>
                                <p className="text-5xl font-bold text-white mt-2">
                                    ₹{(wallet?.balance || 0).toLocaleString()}
                                </p>
                                {wallet?.pending_balance > 0 && (
                                    <p className="text-blue-200 text-sm mt-2 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        ₹{wallet.pending_balance.toLocaleString()} pending
                                    </p>
                                )}
                            </div>
                            <div className="text-right">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <IndianRupee className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
                            <div>
                                <p className="text-blue-200 text-xs">Total Earned</p>
                                <p className="text-white font-semibold text-lg">₹{(wallet?.total_credited || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-blue-200 text-xs">Total Spent</p>
                                <p className="text-white font-semibold text-lg">₹{(wallet?.total_spent || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-100 dark:bg-[#111111] w-full mb-6">
                        <TabsTrigger value="overview" className="flex-1">
                            <History className="w-4 h-4 mr-2" />
                            Transactions
                        </TabsTrigger>
                        <TabsTrigger value="referral" className="flex-1">
                            <Share2 className="w-4 h-4 mr-2" />
                            Refer & Earn
                        </TabsTrigger>
                    </TabsList>

                    {/* Transactions Tab */}
                    <TabsContent value="overview">
                        <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2A2A2A]">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white text-lg">Transaction History</CardTitle>
                                <CardDescription className="dark:text-gray-400">Your wallet activity</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {transactionsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                    </div>
                                ) : transactions && transactions.length > 0 ? (
                                    <div className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                                        {transactions.map((tx) => {
                                            const config = TRANSACTION_CONFIG[tx.source] || TRANSACTION_CONFIG.admin_credit;
                                            const Icon = config.icon;
                                            const isCredit = tx.type === 'credit';

                                            return (
                                                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2.5 rounded-xl ${config.bg}`}>
                                                            <Icon className={`w-5 h-5 ${config.color}`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-900 dark:text-white font-medium">{config.label}</p>
                                                            <p className="text-gray-500 dark:text-gray-500 text-sm">
                                                                {tx.description || format(parseISO(tx.created_at), 'MMM dd, yyyy')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-semibold ${isCredit ? 'text-green-500' : 'text-red-500'}`}>
                                                            {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            {format(parseISO(tx.created_at), 'h:mm a')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>No transactions yet</p>
                                        <p className="text-sm mt-1">Earn credits through referrals or get refunds here</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Referral Tab */}
                    <TabsContent value="referral">
                        <Card className="bg-white dark:bg-[#111111] border-gray-200 dark:border-[#2A2A2A]">
                            <CardHeader>
                                <CardTitle className="text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-purple-500" />
                                    Refer & Earn ₹500
                                </CardTitle>
                                <CardDescription className="dark:text-gray-400">
                                    Share your code with friends and both get ₹500 trip credits!
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Referral Code Box */}
                                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20">
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Your Referral Code</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 py-3">
                                            <p className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white">
                                                {referral?.referral_code || 'Loading...'}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={copyReferralCode}
                                            variant="outline"
                                            size="icon"
                                            className="h-12 w-12 border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            onClick={shareReferral}
                                            className="h-12 px-6 bg-purple-600 hover:bg-purple-700"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Share
                                        </Button>
                                    </div>
                                </div>

                                {/* How it works */}
                                <div className="space-y-4">
                                    <h3 className="text-gray-900 dark:text-white font-semibold">How it works</h3>
                                    <div className="grid gap-4">
                                        {[
                                            { step: 1, text: 'Share your unique referral code with friends' },
                                            { step: 2, text: 'They sign up and make their first booking' },
                                            { step: 3, text: 'Both of you get ₹500 trip credits!' },
                                        ].map((item) => (
                                            <div key={item.step} className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold text-sm">
                                                    {item.step}
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300">{item.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Terms */}
                                <div className="text-xs text-gray-500 dark:text-gray-500 bg-gray-50 dark:bg-[#0A0A0A] rounded-lg p-4">
                                    <p className="font-medium mb-1">Terms:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Your friend must be a new user</li>
                                        <li>Credits are added after their first successful booking</li>
                                        <li>Credits can be used for any booking on StayKedar</li>
                                        <li>Referral code expires after 90 days if unused</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>

            <Footer />
        </div>
    );
}

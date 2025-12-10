import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar, Home, Package, Phone, Settings, TrendingUp, User,
  Clock, MapPin, Loader2, Camera, Mail, Key, Eye, EyeOff,
  Shield, CheckCircle, LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format, parseISO } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// --- Schemas ---
const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// --- Types ---
interface ProfileData {
  name: string | null;
  phone_number: string | null;
  role: string | null;
  avatar_url?: string | null;
}

interface Booking {
  id: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  total_amount: number;
  room?: {
    name: string;
    property?: {
      name: string;
      address?: string;
    };
  };
}

const Dashboard = () => {
  console.log("Dashboard loaded - Clean version");
  const { user, signOut, updateProfile, updatePassword, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({ totalTrips: 0, upcomingTrips: 0, completedTrips: 0 });
  const [activeTab, setActiveTab] = useState("overview");

  // Profile Form State
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Forms
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phoneNumber: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  // Fetch Data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsProfileLoading(true);
      try {
        // Fetch profile
        const { data: profile } = await supabase
          .from('customer_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setProfileData(profile);
          profileForm.setValue('fullName', profile.name || '');
          profileForm.setValue('phoneNumber', profile.phone_number || '');
          setAvatarUrl(profile.avatar_url || user.user_metadata?.avatar_url);
        }

        // Fetch bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            id,
            check_in_date,
            check_out_date,
            status,
            total_amount,
            room:rooms(
              name,
              property:properties(name, address)
            )
          `)
          .eq('user_id', user.id)
          .order('check_in_date', { ascending: false });

        if (bookings) {
          const now = new Date();
          const upcoming = bookings.filter(b =>
            new Date(b.check_in_date) > now &&
            (b.status === 'confirmed' || b.status === 'pending')
          ).sort((a, b) => new Date(a.check_in_date).getTime() - new Date(b.check_in_date).getTime());

          const completed = bookings.filter(b => b.status === 'completed' || b.status === 'checked_out');

          setAllBookings(bookings);
          setUpcomingBooking(upcoming[0] || null);
          setRecentBookings(bookings.slice(0, 5));
          setStats({
            totalTrips: bookings.length,
            upcomingTrips: upcoming.length,
            completedTrips: completed.length
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (!authLoading) fetchDashboardData();
  }, [user, authLoading, profileForm]);

  // Handlers
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setIsUploadingImage(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await updateProfile({
        full_name: profileForm.getValues('fullName'),
        phone_number: profileForm.getValues('phoneNumber'),
        avatar_url: publicUrl
      });

      if (updateError) throw updateError;

      toast({ title: "Photo updated", description: "Your profile picture has been updated successfully." });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({ title: "Upload failed", description: error.message || "Error uploading image", variant: "destructive" });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleProfileUpdate = async (data: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const { error } = await updateProfile({
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        avatar_url: avatarUrl || undefined
      });

      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Profile updated", description: "Your profile has been successfully updated." });
      }
    } catch (err) {
      toast({ title: "Update failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordUpdate = async (data: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    setIsUpdatingPassword(true);
    try {
      const { error } = await updatePassword(data.newPassword);
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Password updated", description: "Your password has been successfully updated." });
        passwordForm.reset();
      }
    } catch (err) {
      toast({ title: "Update failed", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Redirects
  if (!user && !authLoading) return <Navigate to="/auth" />;
  if (user && !user.email_confirmed_at) {
    signOut();
    return <Navigate to="/auth" />;
  }

  const daysUntilTrip = upcomingBooking
    ? differenceInDays(new Date(upcomingBooking.check_in_date), new Date())
    : null;

  return (
    <>
      <Helmet>
        <title>Dashboard | StayKedarnath</title>
        <meta name="description" content="Manage your Kedarnath trips and bookings" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Nav />

        <main className="flex-grow py-8">
          <Container>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar / Mobile Nav */}
              <div className="w-full md:w-64 flex-shrink-0">
                <Card className="sticky top-24">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center mb-6 pt-4">
                      <Avatar className="h-20 w-20 mb-3 border-2 border-gray-100">
                        <AvatarImage src={avatarUrl || ""} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                          {profileData?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="font-semibold text-gray-900 text-center truncate w-full">
                        {profileData?.name || 'Traveler'}
                      </h2>
                      <p className="text-xs text-gray-500 truncate w-full text-center">
                        {user?.email}
                      </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                      <TabsList className="flex flex-col h-auto w-full bg-transparent gap-1 p-0">
                        <TabsTrigger
                          value="overview"
                          className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md transition-colors"
                        >
                          <Home className="h-4 w-4 mr-3" />
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="bookings"
                          className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md transition-colors"
                        >
                          <Calendar className="h-4 w-4 mr-3" />
                          My Bookings
                        </TabsTrigger>
                        <TabsTrigger
                          value="profile"
                          className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md transition-colors"
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile Settings
                        </TabsTrigger>
                        <TabsTrigger
                          value="security"
                          className="w-full justify-start px-4 py-2.5 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-md transition-colors"
                        >
                          <Shield className="h-4 w-4 mr-3" />
                          Security
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

                  {/* OVERVIEW TAB */}
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Total Trips</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-full">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Upcoming</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.upcomingTrips}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-full">
                            <Calendar className="h-5 w-5 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Days to Go</p>
                            <p className="text-2xl font-bold text-gray-900">{daysUntilTrip !== null ? daysUntilTrip : '--'}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-full">
                            <Clock className="h-5 w-5 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Upcoming Trip */}
                    {upcomingBooking && (
                      <Card className="border-l-4 border-l-blue-600">
                        <CardHeader>
                          <CardTitle className="flex items-center text-lg">
                            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                            Upcoming Journey
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <h3 className="font-bold text-xl text-gray-900">{upcomingBooking.room?.name}</h3>
                              <p className="text-gray-600 flex items-center mt-1">
                                <Home className="h-4 w-4 mr-1" />
                                {upcomingBooking.room?.property?.name}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {upcomingBooking.room?.property?.address}
                              </p>
                            </div>
                            <div className="flex gap-4 text-sm">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500">Check-in</p>
                                <p className="font-semibold">{format(parseISO(upcomingBooking.check_in_date), 'dd MMM yyyy')}</p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-gray-500">Check-out</p>
                                <p className="font-semibold">{format(parseISO(upcomingBooking.check_out_date), 'dd MMM yyyy')}</p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
                            <Button size="sm" onClick={() => setActiveTab('bookings')}>View Details</Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate('/stays')}>
                        <Home className="h-6 w-6 text-blue-600" />
                        Browse Stays
                      </Button>
                      <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveTab('bookings')}>
                        <Calendar className="h-6 w-6 text-purple-600" />
                        My Bookings
                      </Button>
                      <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate('/packages')}>
                        <Package className="h-6 w-6 text-green-600" />
                        Packages
                      </Button>
                      <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => navigate('/contact')}>
                        <Phone className="h-6 w-6 text-orange-600" />
                        Support
                      </Button>
                    </div>
                  </TabsContent>

                  {/* BOOKINGS TAB */}
                  <TabsContent value="bookings" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>My Bookings</CardTitle>
                        <CardDescription>View and manage all your bookings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {allBookings.length > 0 ? (
                          <div className="space-y-4">
                            {allBookings.map((booking) => (
                              <div key={booking.id} className="flex flex-col md:flex-row justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="flex gap-4">
                                  <div className={`w-1 self-stretch rounded-full ${booking.status === 'confirmed' ? 'bg-green-500' :
                                    booking.status === 'pending' ? 'bg-yellow-500' :
                                      'bg-red-500'
                                    }`} />
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{booking.room?.name}</h4>
                                    <p className="text-sm text-gray-600">{booking.room?.property?.name}</p>
                                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                      <span>{format(parseISO(booking.check_in_date), 'MMM dd')} - {format(parseISO(booking.check_out_date), 'MMM dd, yyyy')}</span>
                                      <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs flex items-center">{booking.status}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 md:mt-0 flex flex-col items-end justify-center">
                                  <p className="font-bold text-gray-900">₹{booking.total_amount}</p>
                                  <Button variant="link" size="sm" className="h-auto p-0 text-blue-600">View Details</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No bookings found</p>
                            <Button className="mt-4" onClick={() => navigate('/stays')}>Book Your First Stay</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* PROFILE TAB */}
                  <TabsContent value="profile" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Settings</CardTitle>
                        <CardDescription>Manage your personal information</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                          <div className="relative group">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                              <AvatarImage src={avatarUrl || ""} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                                {profileData?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                              {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                            </label>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Profile Picture</h3>
                            <p className="text-sm text-gray-500">JPG, GIF or PNG. Max size of 2MB.</p>
                          </div>
                        </div>

                        {/* Profile Form */}
                        <Form {...profileForm}>
                          <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={profileForm.control}
                                name="fullName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input placeholder="Your Name" className="pl-10" {...field} />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={profileForm.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input placeholder="Your Phone Number" className="pl-10" {...field} />
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="space-y-2">
                              <label className="text-sm font-medium">Email Address</label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input value={user?.email || ''} disabled className="pl-10 bg-gray-50" />
                              </div>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" /> Verified
                              </p>
                            </div>

                            <div className="pt-2 flex justify-end">
                              <Button type="submit" disabled={isUpdatingProfile}>
                                {isUpdatingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* SECURITY TAB */}
                  <TabsContent value="security" className="mt-0">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Update your password</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...passwordForm}>
                          <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)} className="space-y-4">
                            <FormField
                              control={passwordForm.control}
                              name="currentPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Current Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                      <Input type={showCurrentPassword ? "text" : "password"} placeholder="••••••" className="pl-10 pr-10" {...field} />
                                      <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input type={showNewPassword ? "text" : "password"} placeholder="••••••" className="pl-10 pr-10" {...field} />
                                        <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowNewPassword(!showNewPassword)}>
                                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input type={showConfirmPassword ? "text" : "password"} placeholder="••••••" className="pl-10 pr-10" {...field} />
                                        <button type="button" className="absolute right-3 top-3 text-gray-400 hover:text-gray-600" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="pt-2 flex justify-end">
                              <Button type="submit" disabled={isUpdatingPassword}>
                                {isUpdatingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Change Password"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </TabsContent>

                </Tabs>
              </div>
            </div>
          </Container>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, User, Phone, Key, Eye, EyeOff, Camera, Mail, Shield, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Container from "@/components/Container";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const Profile = () => {
  const { user, updateProfile, updatePassword, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const getUserData = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('customer_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Could not fetch user data. Please try again later.",
            variant: "destructive",
          });
        } else if (data) {
          setUserData(data);
          profileForm.setValue('fullName', data.name || '');
          profileForm.setValue('phoneNumber', data.phone_number || '');
          setAvatarUrl(data.avatar_url || user.user_metadata?.avatar_url);
        }
      } catch (error) {
        console.error("Exception during user data fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      getUserData();
    }
  }, [user, authLoading, navigate, toast, profileForm]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      setIsUploadingImage(true);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({
        full_name: profileForm.getValues('fullName'),
        phone_number: profileForm.getValues('phoneNumber'),
        avatar_url: publicUrl
      });

      if (updateError) throw updateError;

      toast({
        title: "Photo updated",
        description: "Your profile picture has been updated successfully.",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Error uploading image",
        variant: "destructive",
      });
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
        toast({
          title: "Update failed",
          description: error.message || "Could not update profile. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
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
        toast({
          title: "Update failed",
          description: error.message || "Could not update password. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated.",
        });
        passwordForm.reset();
      }
    } catch (err) {
      console.error("Error updating password:", err);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile Settings | StayKedarnath</title>
        <meta name="description" content="Update your profile information and account settings" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Nav />

        <main className="flex-grow py-12">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">Account Settings</h1>
                <p className="text-gray-600">Manage your personal details and security preferences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
                {/* Sidebar Navigation */}
                <Card className="h-fit">
                  <CardContent className="p-4">
                    <Tabs defaultValue="profile" orientation="vertical" className="w-full">
                      <TabsList className="flex flex-col h-auto w-full bg-transparent gap-2">
                        <TabsTrigger
                          value="profile"
                          className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                        >
                          <User className="h-4 w-4 mr-3" />
                          Profile Information
                        </TabsTrigger>
                        <TabsTrigger
                          value="security"
                          className="w-full justify-start px-4 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                        >
                          <Shield className="h-4 w-4 mr-3" />
                          Security
                        </TabsTrigger>
                      </TabsList>

                      <div className="mt-8 px-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-medium text-blue-900">Verified</span>
                          </div>
                          <p className="text-xs text-blue-700">
                            Your email {user?.email} is verified.
                          </p>
                        </div>
                      </div>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Main Content Area */}
                <div className="flex-1">
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsContent value="profile" className="mt-0 space-y-6">
                      {/* Profile Picture Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Profile Picture</CardTitle>
                          <CardDescription>
                            Upload a picture to personalize your account
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-6">
                          <div className="relative group">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                              <AvatarImage src={avatarUrl || ""} />
                              <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                                {profileForm.getValues('fullName')?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <label
                              htmlFor="avatar-upload"
                              className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white cursor-pointer hover:bg-blue-700 transition-colors shadow-md"
                            >
                              {isUploadingImage ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Camera className="h-4 w-4" />
                              )}
                              <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploadingImage}
                              />
                            </label>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Upload new image</h3>
                            <p className="text-sm text-gray-500 mb-3">
                              JPG, GIF or PNG. Max size of 2MB.
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Personal Details Card */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Details</CardTitle>
                          <CardDescription>
                            Update your personal information
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Email Address
                                </label>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input value={user?.email || ''} disabled className="pl-10 bg-gray-50" />
                                </div>
                                <p className="text-xs text-gray-500">Email address cannot be changed</p>
                              </div>

                              <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isUpdatingProfile} className="bg-blue-600 hover:bg-blue-700">
                                  {isUpdatingProfile ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Saving...
                                    </>
                                  ) : (
                                    "Save Changes"
                                  )}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="security" className="mt-0">
                      <Card>
                        <CardHeader>
                          <CardTitle>Password & Security</CardTitle>
                          <CardDescription>
                            Manage your password and security settings
                          </CardDescription>
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
                                        <Input
                                          type={showCurrentPassword ? "text" : "password"}
                                          placeholder="••••••"
                                          className="pl-10 pr-10"
                                          {...field}
                                        />
                                        <button
                                          type="button"
                                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                          {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
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
                                          <Input
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="••••••"
                                            className="pl-10 pr-10"
                                            {...field}
                                          />
                                          <button
                                            type="button"
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                          >
                                            {showNewPassword ? (
                                              <EyeOff className="h-4 w-4" />
                                            ) : (
                                              <Eye className="h-4 w-4" />
                                            )}
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
                                          <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••"
                                            className="pl-10 pr-10"
                                            {...field}
                                          />
                                          <button
                                            type="button"
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                          >
                                            {showConfirmPassword ? (
                                              <EyeOff className="h-4 w-4" />
                                            ) : (
                                              <Eye className="h-4 w-4" />
                                            )}
                                          </button>
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={isUpdatingPassword} className="bg-blue-600 hover:bg-blue-700">
                                  {isUpdatingPassword ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    "Change Password"
                                  )}
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
            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Profile;
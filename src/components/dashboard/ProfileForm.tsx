
import { useState } from "react";
import { Loader2, User, Phone, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileData {
  name: string | null;
  phone_number: string | null;
}

interface ProfileFormProps {
  profileData: ProfileData | null;
  userEmail: string | undefined;
  isLoading: boolean;
  onUpdateProfile: (values: { fullName: string; phoneNumber: string }) => Promise<void>;
}

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
});

const ProfileForm = ({ profileData, userEmail, isLoading, onUpdateProfile }: ProfileFormProps) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: profileData?.name || "",
      phoneNumber: profileData?.phone_number || "",
    },
  });

  // Update the form when profile data changes
  if (profileData && !isLoading && (
      profileForm.getValues().fullName !== (profileData.name || "") ||
      profileForm.getValues().phoneNumber !== (profileData.phone_number || "")
    )) {
    // Fix TypeScript error by explicitly typing the reset values as required strings
    profileForm.reset({
      fullName: profileData.name || "",
      phoneNumber: profileData.phone_number || "",
    } as { fullName: string; phoneNumber: string });
  }

  const handleSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    try {
      await onUpdateProfile(values);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p className="text-sm text-mist">
                  Update your personal details
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-mist" />
                          <Input placeholder="Your Name" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-mist" />
                    <Input
                      type="email"
                      className="w-full pl-10 bg-gray-100"
                      value={userEmail || ""}
                      readOnly
                      disabled
                    />
                  </div>
                  <p className="text-xs text-mist">Email cannot be changed</p>
                </div>
                <FormField
                  control={profileForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-mist" />
                          <Input placeholder="Your Phone Number" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button type="submit" disabled={isUpdating || isLoading}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;

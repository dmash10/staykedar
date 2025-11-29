import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, ArrowRight, Loader2, Phone, Building, MapPin, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  businessAddress: z.string().min(5, { message: "Please enter a complete address" }),
  businessDescription: z.string().min(20, { message: "Please provide a more detailed description" }),
  hasExistingProperties: z.boolean().default(false),
  existingPropertiesDetails: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const { signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [retrying, setRetrying] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<boolean>(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
      businessName: "",
      businessAddress: "",
      businessDescription: "",
      hasExistingProperties: false,
      existingPropertiesDetails: "",
      agreeToTerms: false,
    },
  });

  const hasExistingProperties = form.watch("hasExistingProperties");

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    setNetworkError(false);

    try {
      // Check internet connection first
      if (!navigator.onLine) {
        setNetworkError(true);
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Register the user with Firebase Auth
      const { error, data } = await signUp(
        values.email,
        values.password,
        {
          full_name: values.fullName,
          phone_number: values.phoneNumber,
          role: 'property_owner',
          business_name: values.businessName,
          business_address: values.businessAddress,
          business_description: values.businessDescription,
          has_existing_properties: values.hasExistingProperties,
          existing_properties_details: values.existingPropertiesDetails || ''
        }
      );

      if (error) {
        if (error.code === "auth/network-request-failed") {
          setNetworkError(true);
          toast({
            title: "Network Error",
            description: "Failed to connect to authentication servers. Please check your internet connection and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed",
            description: error.message || "Failed to create account. Please try again.",
            variant: "destructive",
          });
        }
        setIsSubmitting(false);
        return;
      }

      // After Firebase authentication, show verification message - don't redirect
      setVerificationEmailSent(true);
      setIsSubmitting(false);

      // No need to set customer details in Supabase here, that's handled by the signUp function
    } catch (err) {
      console.error("Signup error:", err);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setRetrying(true);
    // Retry submission with a slight delay
    setTimeout(() => {
      form.handleSubmit(onSubmit)();
      setRetrying(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Property Owner Registration | StayKedarnath</title>
        <meta name="description" content="Register as a property owner to list your accommodations on StayKedarnath platform." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />

        <main className="flex-grow py-20">
          <Container size="md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-primary-deep mb-2">Property Owner Registration</h1>
              <p className="text-mist">Join StayKedarnath as a property owner and start managing your listings</p>
            </div>

            <div className="glass-card p-8 border-gradient">
              {verificationEmailSent ? (
                <div className="text-center py-8">
                  <div className="mb-6 text-primary-deep">
                    <Mail className="h-16 w-16 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Verification Email Sent</h2>
                    <p className="text-mist mb-4">
                      We've sent a verification email to your inbox. Please check your email and click the verification link to activate your account.
                    </p>
                    <p className="text-sm text-mist mb-6">
                      After verifying your email, our team will review your property owner application. You'll receive a notification once your account is approved.
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/auth">Return to Login</Link>
                  </Button>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="bg-primary-50 p-4 rounded-md mb-6">
                      <h2 className="text-xl font-semibold mb-2 text-primary-deep">Personal Information</h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
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

                        <FormField
                          control={form.control}
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-mist" />
                                  <Input placeholder="your.email@example.com" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-mist" />
                                  <Input type="password" placeholder="Min. 6 characters" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-mist" />
                                  <Input type="password" placeholder="Confirm password" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md">
                      <h2 className="text-xl font-semibold mb-2 text-blue-700">Property Business Information</h2>

                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-mist" />
                                <Input placeholder="Your Business Name" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="businessAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Address</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-mist" />
                                  <Input placeholder="Complete address" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="businessDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Business Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us about your business and properties"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="hasExistingProperties"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 bg-white">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>I already have properties to list</FormLabel>
                                <p className="text-sm text-mist">Check this if you have existing properties you want to list immediately</p>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {hasExistingProperties && (
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="existingPropertiesDetails"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Existing Properties Details</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Please provide details about your existing properties (number of properties, locations, types, etc.)"
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name="agreeToTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>I agree to the <Link to="/terms" className="text-primary-deep hover:underline">Terms and Conditions</Link></FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {networkError && (
                      <div className="mt-4 text-center">
                        <p className="text-red-500 mb-2">Connection to authentication servers failed.</p>
                        <Button
                          type="button"
                          onClick={handleRetry}
                          disabled={retrying || isSubmitting}
                          variant="outline"
                          className="mx-auto"
                        >
                          {retrying ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            "Retry Connection"
                          )}
                        </Button>
                      </div>
                    )}

                    <div className="mt-6">
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Register as Property Owner
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="mt-6 text-center">
                      <p className="text-sm text-mist">
                        Already have an account?{" "}
                        <Link to="/auth" className="text-primary-deep hover:underline">Sign in</Link>
                      </p>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Signup; 
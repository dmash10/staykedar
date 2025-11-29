import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, ArrowRight, Loader2, Phone, Eye, EyeOff } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const resetSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

// List of admin email addresses
const ADMIN_EMAILS: string[] = [];

const Auth = () => {
  const { signIn, signUp, resetPassword, user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const checkIfAdmin = async (email: string, uid: string): Promise<boolean> => {
    // This function is no longer used since we're letting route components handle redirects
    console.log("Auth: checkIfAdmin is deprecated, using route components instead");
    return false;
  };

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    console.log("Login form submitted with email:", values.email);
    try {
      console.log("Calling signIn function...");
      const { error } = await signIn(values.email, values.password);

      console.log("signIn completed, error:", error);
      if (!error) {
        console.log("Login successful, no error");
        setIsSubmitting(false);

        // We'll let the route components handle redirection based on role
        // This prevents flashing of admin dashboard
        // Navigate happens in route components
      } else {
        console.log("Login failed with error:", error);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error("Exception during login:", err);
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    console.log("Sign up form submitted with values:", values);

    try {
      const { error } = await signUp(
        values.email,
        values.password,
        {
          full_name: values.fullName,
          phone_number: values.phoneNumber,
          role: 'customer'
        }
      );

      console.log("signUp completed, error:", error);
      setIsSubmitting(false);

      if (!error) {
        console.log("Sign up successful!");

        // Show email verification message
        toast({
          title: "Please Verify Your Email",
          description: "We've sent you a verification email. Please check your inbox and click the link to activate your account.",
          duration: 6000,
        });

        // Don't redirect - user must verify email first
        // Switch to sign-in tab after showing message
        setTimeout(() => {
          setActiveTab('login');
        }, 2000);
      } else {
        console.error("Sign up failed:", error);
        toast({
          title: "Sign Up Failed",
          description: error.message || "An error occurred during sign up. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Exception during sign up:", err);
      setIsSubmitting(false);
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onResetSubmit = async (values: z.infer<typeof resetSchema>) => {
    setIsSubmitting(true);
    await resetPassword(values.email);
    setIsSubmitting(false);

    // Reset the form
    resetForm.reset();
  };

  return (
    <>
      <Helmet>
        <title>Authentication | StayKedarnath</title>
        <meta name="description" content="Sign in or create an account to access personalized services for your Kedarnath journey." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />

        <main className="flex-grow py-20">
          <Container size="md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-primary-deep mb-2">Welcome to StayKedarnath</h1>
              <p className="text-mist">Access your account to manage your Kedarnath journey</p>
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
                      After verifying your email, you can log in with your credentials.
                    </p>
                  </div>
                  <Button onClick={() => {
                    setVerificationEmailSent(false);
                    setActiveTab("login");
                  }}>
                    Return to Login
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form
                        className="space-y-4"
                        onSubmit={(e) => {
                          // Prevent default form submission
                          e.preventDefault();
                          console.log("Form submit event prevented");
                          // Don't handle the form submission here, it's now handled by the button
                        }}
                      >
                        <FormField
                          control={loginForm.control}
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
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-mist" />
                                  <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••"
                                    className="pl-10 pr-10"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-3 text-mist hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                  >
                                    {showPassword ? (
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
                        <Button
                          type="button"
                          className="w-full"
                          disabled={isSubmitting}
                          onClick={async () => {
                            try {
                              // Validate the form
                              const isValid = await loginForm.trigger();
                              if (!isValid) {
                                console.log("Form validation failed");
                                return;
                              }

                              const values = loginForm.getValues();
                              console.log("Sign in button clicked with values:", values);

                              setIsSubmitting(true);

                              // Call signIn directly
                              const { user, error } = await signIn(values.email, values.password);
                              console.log("Sign in response:", { user, error });

                              if (error) {
                                console.log("Sign in error:", error);
                                toast({
                                  title: "Sign in failed",
                                  description: error.message || "Failed to sign in",
                                  variant: "destructive",
                                });
                              } else {
                                console.log("Sign in successful, user:", user);
                                // Success toast
                                toast({
                                  title: "Signed in successfully",
                                  description: "Welcome back!",
                                });

                                // Check user role for redirection
                                const { data: customerData } = await supabase
                                  .from('customer_details')
                                  .select('role')
                                  .eq('id', user.id)
                                  .single();

                                const customer = customerData as any;
                                console.log("User role for redirect:", customer?.role);

                                if (customer?.role === 'admin') {
                                  navigate('/admin');
                                } else if (customer?.role === 'property_owner') {
                                  navigate('/dashboard/properties');
                                } else {
                                  navigate('/');
                                }
                              }
                            } catch (err) {
                              console.error("Unexpected error during sign in:", err);
                              toast({
                                title: "Sign in failed",
                                description: err instanceof Error ? err.message : "An unexpected error occurred",
                                variant: "destructive",
                              });
                            } finally {
                              setIsSubmitting(false);
                            }
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            <>
                              Sign In
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setActiveTab("reset")}
                            className="text-sm text-primary-light hover:underline mt-2"
                          >
                            Forgot password?
                          </button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <Form {...signupForm}>
                      <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                        <FormField
                          control={signupForm.control}
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
                          control={signupForm.control}
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
                        <FormField
                          control={signupForm.control}
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
                        <FormField
                          control={signupForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-mist" />
                                  <Input
                                    type={showSignupPassword ? "text" : "password"}
                                    placeholder="••••••"
                                    className="pl-10 pr-10"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-3 text-mist hover:text-gray-700"
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                  >
                                    {showSignupPassword ? (
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
                          control={signupForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3 h-4 w-4 text-mist" />
                                  <Input
                                    type={showSignupConfirmPassword ? "text" : "password"}
                                    placeholder="••••••"
                                    className="pl-10 pr-10"
                                    {...field}
                                  />
                                  <button
                                    type="button"
                                    className="absolute right-3 top-3 text-mist hover:text-gray-700"
                                    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                                  >
                                    {showSignupConfirmPassword ? (
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
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Account...
                            </>
                          ) : (
                            <>
                              Create Account
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="reset">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-primary-deep mb-2">Reset Password</h3>
                      <p className="text-sm text-mist">Enter your email and we'll send you a link to reset your password.</p>
                    </div>
                    <Form {...resetForm}>
                      <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                        <FormField
                          control={resetForm.control}
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
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending Link...
                            </>
                          ) : (
                            "Send Reset Link"
                          )}
                        </Button>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setActiveTab("login")}
                            className="text-sm text-primary-light hover:underline mt-2"
                          >
                            Back to login
                          </button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Auth;

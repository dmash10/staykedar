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
import { 
  Mail, Lock, User, ArrowRight, Loader2, Phone, Eye, EyeOff, 
  Mountain, Shield, Clock, Star, CheckCircle2, Sparkles, Home, ChevronLeft
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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

const Auth = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "reset">("login");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "", phoneNumber: "", email: "", password: "", confirmPassword: "",
    },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      const { user, error } = await signIn(values.email, values.password);
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        });
      } else if (user) {
        toast({
          title: "Welcome back!",
          description: "You've signed in successfully.",
        });

        const { data: customerData } = await supabase
          .from('customer_details')
          .select('role')
          .eq('id', user.id)
          .single();

        const customer = customerData as any;
        if (customer?.role === 'admin') {
          navigate('/admin');
        } else if (customer?.role === 'property_owner') {
          navigate('/dashboard/properties');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      toast({
        title: "Sign in failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await signUp(values.email, values.password, {
        full_name: values.fullName,
        phone_number: values.phoneNumber,
        role: 'customer'
      });

      if (!error) {
        setVerificationEmailSent(true);
        toast({
          title: "Account Created!",
          description: "Please check your email to verify your account.",
          duration: 6000,
        });
      } else {
        toast({
          title: "Sign Up Failed",
          description: error.message || "An error occurred during sign up.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (values: z.infer<typeof resetSchema>) => {
    setIsSubmitting(true);
    await resetPassword(values.email);
    setIsSubmitting(false);
    resetForm.reset();
    toast({
      title: "Reset Link Sent",
      description: "Check your email for the password reset link.",
    });
  };

  // Input style without focus ring
  const inputStyle = "h-12 bg-white/80 border-gray-200 focus:border-gray-300 focus:ring-0 outline-none pl-11 text-gray-900 placeholder:text-gray-400";

  // Features for the left panel
  const features = [
    { icon: Mountain, title: "Sacred Journey", desc: "Plan your spiritual pilgrimage" },
    { icon: Shield, title: "Secure Booking", desc: "100% safe & verified stays" },
    { icon: Clock, title: "24/7 Support", desc: "We're always here to help" },
    { icon: Star, title: "Best Prices", desc: "Guaranteed lowest rates" },
  ];

  return (
    <>
      <Helmet>
        <title>{activeTab === "login" ? "Sign In" : activeTab === "signup" ? "Create Account" : "Reset Password"} | StayKedarnath</title>
        <meta name="description" content="Sign in or create an account to access personalized services for your Kedarnath journey." />
      </Helmet>

      <div className="min-h-screen flex">
        {/* Left Panel - Branding & Features (Hidden on Mobile) - Fixed position */}
        <div className="hidden lg:flex lg:w-1/2 fixed left-0 top-0 bottom-0 bg-gradient-to-br from-[#0A1628] via-[#0F2167] to-[#1E3A8A] overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 py-16">
            {/* Logo */}
            <Link to="/" className="mb-12">
              <h1 className="text-3xl font-bold text-white">
                StayKedarnath.in
              </h1>
            </Link>

            {/* Main Text */}
            <div className="mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/10"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Your Sacred Journey Awaits</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-white mb-4 leading-tight"
              >
                Begin Your Spiritual<br />
                <span className="text-blue-300">Kedarnath Yatra</span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-blue-100/80 text-lg"
              >
                Access exclusive stays, packages, and personalized services for your divine pilgrimage.
              </motion.p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                    <p className="text-blue-200/70 text-xs">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Text */}
            <div className="mt-auto pt-12">
              <p className="text-blue-200/60 text-sm">
                Trusted by 10,000+ pilgrims every year
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Forms - Offset for fixed left panel */}
        <div className="w-full lg:w-1/2 lg:ml-[50%] flex flex-col min-h-screen bg-gray-50">
          {/* Mobile Header - Enhanced Design */}
          <div className="lg:hidden relative overflow-hidden">
            {/* Background with gradient and pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0F2167] to-[#1E3A8A]" />
            
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            
            {/* Gradient orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl -ml-8 -mb-8" />
            
            {/* Content */}
            <div className="relative z-10 px-5 pt-4 pb-6">
              {/* Top Navigation Row */}
              <div className="flex items-center justify-between mb-5">
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm border border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors text-sm bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm border border-white/10"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </div>
              
              {/* Logo and Title */}
              <div className="text-center">
                <Link to="/" className="inline-block mb-3">
                  <h1 className="text-2xl font-bold text-white">
                    StayKedarnath.in
                  </h1>
                </Link>
                
                {/* Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium backdrop-blur-sm border border-white/10 mb-2">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Trusted by 10,000+ Pilgrims</span>
                </div>
                
                <p className="text-blue-200/80 text-sm">Your sacred journey starts here</p>
              </div>
            </div>
          </div>
          
          {/* Desktop Top Bar */}
          <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
            
            <Link
              to="/"
              className="flex items-center gap-2 text-[#0071c2] hover:text-[#005999] transition-colors text-sm font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Form Container */}
          <div className="flex-1 flex items-center justify-center px-6 py-8 lg:py-12">
            <div className="w-full max-w-md">
              {/* Verification Email Sent Screen */}
              {verificationEmailSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                  <p className="text-gray-600 mb-6">
                    We've sent a verification link to your email address. Please verify to continue.
                  </p>
                  <Button 
                    onClick={() => {
                      setVerificationEmailSent(false);
                      setActiveTab("login");
                    }}
                    className="bg-[#0071c2] hover:bg-[#005999] text-white"
                  >
                    Return to Sign In
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Tab Switcher */}
                  {activeTab !== "reset" && (
                    <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => setActiveTab("login")}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                          activeTab === "login"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => setActiveTab("signup")}
                        className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                          activeTab === "signup"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        Create Account
                      </button>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {/* Login Form */}
                    {activeTab === "login" && (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
                          <p className="text-gray-500">Sign in to your account to continue</p>
                        </div>

                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Email Address</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                      <Input placeholder="you@example.com" className={inputStyle} {...field} />
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
                                  <FormLabel className="text-gray-700">Password</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                      <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className={`${inputStyle} pr-11`}
                                        {...field}
                                      />
                                      <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                      >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="flex items-center justify-end">
                              <button
                                type="button"
                                onClick={() => setActiveTab("reset")}
                                className="text-sm text-[#0071c2] hover:underline"
                              >
                                Forgot password?
                              </button>
                            </div>

                            <Button
                              type="submit"
                              className="w-full h-12 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-xl"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Signing In...
                                </>
                              ) : (
                                <>
                                  Sign In
                                  <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>

                      </motion.div>
                    )}

                    {/* Signup Form */}
                    {activeTab === "signup" && (
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
                          <p className="text-gray-500">Start your spiritual journey today</p>
                        </div>

                        <Form {...signupForm}>
                          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                            <FormField
                              control={signupForm.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Full Name</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                      <Input placeholder="Your full name" className={inputStyle} {...field} />
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
                                  <FormLabel className="text-gray-700">Phone Number</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                      <Input placeholder="+91 98765 43210" className={inputStyle} {...field} />
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
                                  <FormLabel className="text-gray-700">Email Address</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                      <Input placeholder="you@example.com" className={inputStyle} {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={signupForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-700">Password</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                          type={showSignupPassword ? "text" : "password"}
                                          placeholder="••••••"
                                          className={`${inputStyle} pr-11`}
                                          {...field}
                                        />
                                        <button
                                          type="button"
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                                        >
                                          {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                                    <FormLabel className="text-gray-700">Confirm</FormLabel>
                                    <FormControl>
                                      <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                          type={showSignupConfirmPassword ? "text" : "password"}
                                          placeholder="••••••"
                                          className={`${inputStyle} pr-11`}
                                          {...field}
                                        />
                                        <button
                                          type="button"
                                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                          onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                                        >
                                          {showSignupConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                      </div>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <p className="text-xs text-gray-500">
                              By creating an account, you agree to our{" "}
                              <Link to="/terms" className="text-[#0071c2] hover:underline">Terms of Service</Link>
                              {" "}and{" "}
                              <Link to="/privacy" className="text-[#0071c2] hover:underline">Privacy Policy</Link>
                            </p>

                            <Button
                              type="submit"
                              className="w-full h-12 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-xl"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Creating Account...
                                </>
                              ) : (
                                <>
                                  Create Account
                                  <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      </motion.div>
                    )}

                    {/* Reset Password Form */}
                    {activeTab === "reset" && (
                      <motion.div
                        key="reset"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={() => setActiveTab("login")}
                          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                          Back to sign in
                        </button>

                        <div className="mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset your password</h2>
                          <p className="text-gray-500">Enter your email and we'll send you a reset link</p>
                        </div>

                        <Form {...resetForm}>
                          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                            <FormField
                              control={resetForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-gray-700">Email Address</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                      <Input placeholder="you@example.com" className={inputStyle} {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="submit"
                              className="w-full h-12 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-xl"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Sending Link...
                                </>
                              ) : (
                                "Send Reset Link"
                              )}
                            </Button>
                          </form>
                        </Form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Property Owner Link */}
                  {activeTab !== "reset" && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <p className="text-center text-gray-500 text-sm">
                        Want to list your property?{" "}
                        <Link to="/signup" className="text-[#0071c2] hover:underline font-medium">
                          Register as Property Owner
                        </Link>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <Link to="/" className="hover:text-gray-700">Home</Link>
              <span>•</span>
              <Link to="/help" className="hover:text-gray-700">Help</Link>
              <span>•</span>
              <Link to="/privacy" className="hover:text-gray-700">Privacy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-gray-700">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Mail, Lock, User, Phone, MapPin, Briefcase, Eye, EyeOff, Loader2 } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";

const signupSchema = z.object({
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
    businessName: z.string().min(2, { message: "Business name is required" }),
    businessAddress: z.string().min(10, { message: "Please enter your business address" }),
    businessDescription: z.string().min(20, { message: "Please describe your business (at least 20 characters)" }),
    hasExistingProperties: z.boolean(),
    existingPropertiesDetails: z.string().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, {
        message: "You must agree to the terms and conditions"
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const PropertyOwnerSignup = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
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

    const onSubmit = async (values: z.infer<typeof signupSchema>) => {
        setIsSubmitting(true);
        try {
            const { error } = await signUp(
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
                    existing_properties_details: values.existingPropertiesDetails || '',
                }
            );

            if (error) {
                throw error;
            }

            toast({
                title: "Account Created Successfully!",
                description: "Please check your email to verify your account before signing in.",
            });

            navigate("/email-verification", { state: { email: values.email } });
        } catch (error: any) {
            console.error("Signup error:", error);
            toast({
                title: "Signup Failed",
                description: error.message || "An error occurred during signup. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Become a Host - List Your Property | Staykedar</title>
                <meta name="description" content="Join Staykedar as a property owner. List your hotel, homestay, or resort and start earning today." />
            </Helmet>

            <Nav />

            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
                <Container size="md">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0071c2] rounded-full mb-4">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">Become a Host</h1>
                        <p className="text-lg text-gray-600">Join thousands of property owners earning with Staykedar</p>
                    </div>

                    {/* Benefits Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                            <div className="text-3xl font-bold text-[#0071c2] mb-2">10M+</div>
                            <div className="text-sm text-gray-700">Travelers worldwide</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                            <div className="text-3xl font-bold text-[#0071c2] mb-2">24/7</div>
                            <div className="text-sm text-gray-700">Support for hosts</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                            <div className="text-3xl font-bold text-[#0071c2] mb-2">0%</div>
                            <div className="text-sm text-gray-700">Commission first month</div>
                        </div>
                    </div>

                    {/* Signup Form */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Personal Information */}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5 text-[#0071c2]" />
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="fullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} />
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
                                                    <FormLabel>Phone Number *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+91 98765 43210" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Account Credentials */}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-[#0071c2]" />
                                        Account Credentials
                                    </h2>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address *</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="your@email.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Password *</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showPassword ? "text" : "password"}
                                                                    placeholder="••••••••"
                                                                    {...field}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
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
                                                        <FormLabel>Confirm Password *</FormLabel>
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="••••••••"
                                                                    {...field}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                                >
                                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                                </button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Business Information */}
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-[#0071c2]" />
                                        Business Information
                                    </h2>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="businessName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business/Property Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Himalayan Paradise Hotel" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="businessAddress"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business Address *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="123 Main Street, Kedarnath, Uttarakhand" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="businessDescription"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business Description *</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Tell us about your property, its unique features, and what makes it special..."
                                                            className="min-h-[100px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Existing Properties */}
                                <div>
                                    <FormField
                                        control={form.control}
                                        name="hasExistingProperties"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>
                                                        I have existing properties listed on other platforms
                                                    </FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    {form.watch("hasExistingProperties") && (
                                        <FormField
                                            control={form.control}
                                            name="existingPropertiesDetails"
                                            render={({ field }) => (
                                                <FormItem className="mt-3">
                                                    <FormLabel>Tell us about your existing properties (optional)</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="List the platforms and property names..."
                                                            className="min-h-[80px]"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                {/* Terms and Conditions */}
                                <FormField
                                    control={form.control}
                                    name="agreeToTerms"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    I agree to the <a href="/terms" className="text-[#0071c2] hover:underline">Terms & Conditions</a> and <a href="/privacy" className="text-[#0071c2] hover:underline">Privacy Policy</a> *
                                                </FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-[#0071c2] hover:bg-[#005a9c] text-white py-6 text-lg font-semibold"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Creating Your Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Host Account
                                        </>
                                    )}
                                </Button>

                                {/* Login Link */}
                                <p className="text-center text-sm text-gray-600">
                                    Already have an account?{" "}
                                    <a href="/auth" className="text-[#0071c2] hover:underline font-medium">
                                        Sign in here
                                    </a>
                                </p>
                            </form>
                        </Form>
                    </div>
                </Container>
            </main>

            <Footer />
        </>
    );
};

export default PropertyOwnerSignup;

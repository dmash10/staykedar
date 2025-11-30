import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Mail, CheckCircle, RefreshCw, ArrowRight } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const EmailVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [email, setEmail] = useState<string>("");
    const [isResending, setIsResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        // Get email from navigation state or redirect if not present
        const stateEmail = location.state?.email;
        if (stateEmail) {
            setEmail(stateEmail);
        } else {
            navigate("/auth");
        }
    }, [location, navigate]);

    useEffect(() => {
        // Countdown timer for resend button
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResendEmail = async () => {
        if (!email || isResending || resendCooldown > 0) return;

        setIsResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });

            if (error) throw error;

            toast({
                title: "Email Sent!",
                description: "Verification email has been resent. Please check your inbox.",
            });

            setResendCooldown(60); // 60 second cooldown
        } catch (error: any) {
            console.error("Resend error:", error);
            toast({
                title: "Failed to Resend",
                description: error.message || "Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Verify Your Email | Staykedar</title>
                <meta name="description" content="Please verify your email address to complete your registration." />
            </Helmet>

            <Nav />

            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
                <Container size="sm">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                            <Mail className="w-10 h-10 text-[#0071c2]" />
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">Check Your Email</h1>
                        <p className="text-lg text-gray-600 mb-8">
                            We've sent a verification link to
                        </p>
                        <div className="bg-blue-50 rounded-lg px-4 py-3 mb-8 inline-block">
                            <p className="text-[#0071c2] font-semibold">{email}</p>
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Next Steps:
                            </h2>
                            <ol className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-[#0071c2] min-w-[20px]">1.</span>
                                    <span>Open your email inbox</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-[#0071c2] min-w-[20px]">2.</span>
                                    <span>Look for an email from Staykedar (check spam folder if needed)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-[#0071c2] min-w-[20px]">3.</span>
                                    <span>Click the verification link in the email</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="font-semibold text-[#0071c2] min-w-[20px]">4.</span>
                                    <span>You'll be redirected to sign in to your account</span>
                                </li>
                            </ol>
                        </div>

                        {/* Resend Button */}
                        <div className="mb-6">
                            <p className="text-sm text-gray-600 mb-3">Didn't receive the email?</p>
                            <Button
                                onClick={handleResendEmail}
                                disabled={isResending || resendCooldown > 0}
                                variant="outline"
                                className="border-[#0071c2] text-[#0071c2] hover:bg-blue-50"
                            >
                                {isResending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Sending...
                                    </>
                                ) : resendCooldown > 0 ? (
                                    <>
                                        Resend in {resendCooldown}s
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Resend Verification Email
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Back to Login */}
                        <Button
                            onClick={() => navigate("/auth")}
                            className="w-full bg-[#0071c2] hover:bg-[#005a9c] text-white"
                        >
                            Back to Sign In
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>

                        {/* Help Section */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Need help?{" "}
                                <a href="/contact" className="text-[#0071c2] hover:underline font-medium">
                                    Contact Support
                                </a>
                            </p>
                        </div>
                    </div>
                </Container>
            </main>

            <Footer />
        </>
    );
};

export default EmailVerification;

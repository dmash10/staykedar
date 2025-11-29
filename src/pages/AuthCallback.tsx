import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const error = hashParams.get('error');
                const errorDescription = hashParams.get('error_description');

                if (error) {
                    console.error('Auth error:', error, errorDescription);

                    if (error === 'access_denied' && errorDescription?.includes('expired')) {
                        setErrorMessage('Your verification link has expired. Please request a new one.');
                    } else {
                        setErrorMessage(errorDescription || 'Authentication failed. Please try again.');
                    }

                    setStatus('error');
                    return;
                }

                // Get session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    setErrorMessage('Failed to create session. Please try logging in.');
                    setStatus('error');
                    return;
                }

                if (session) {
                    // Successfully authenticated
                    console.log('✅ Email verified for:', session.user.email);
                    setStatus('success');

                    // Start countdown
                    let timeLeft = 3;
                    const timer = setInterval(() => {
                        timeLeft--;
                        setCountdown(timeLeft);

                        if (timeLeft <= 0) {
                            clearInterval(timer);
                            navigate('/admin/dashboard');
                        }
                    }, 1000);

                    return () => clearInterval(timer);
                } else {
                    setErrorMessage('No session found. Please try logging in.');
                    setStatus('error');
                }
            } catch (err) {
                console.error('Auth callback error:', err);
                setErrorMessage('An unexpected error occurred.');
                setStatus('error');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="text-center bg-white p-12 rounded-2xl shadow-2xl max-w-md">
                    <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Verifying Your Email
                    </h2>
                    <p className="text-gray-600">
                        Please wait while we confirm your account...
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="text-center bg-white p-12 rounded-2xl shadow-2xl max-w-md">
                    <div className="mb-6">
                        <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Email Verified! 🎉
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Your account has been successfully verified.
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <p className="text-green-700 font-medium">
                            Redirecting to dashboard in {countdown} second{countdown !== 1 ? 's' : ''}...
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/admin/dashboard')}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                        Go to Dashboard Now
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
            <div className="text-center bg-white p-12 rounded-2xl shadow-2xl max-w-md">
                <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">
                    {errorMessage}
                </p>
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/')}
                        className="w-full"
                    >
                        Return Home
                    </Button>
                    <Button
                        onClick={() => navigate('/auth')}
                        variant="outline"
                        className="w-full"
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        </div>
    );
}

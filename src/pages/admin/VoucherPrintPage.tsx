import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { VoucherTemplate, VoucherData } from '@/components/admin/bookings/VoucherTemplate';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';

export default function VoucherPrintPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const data = location.state?.data as VoucherData;

    useEffect(() => {
        if (data) {
            // Give time for images to load?
            const timer = setTimeout(() => {
                window.print();
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [data]);

    if (!data) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Voucher Data Found</h2>
            <p className="text-gray-500 mb-6">Please generate a voucher from the Bookings page.</p>
            <Button onClick={() => navigate('/admin/bookings')}>Back to Bookings</Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-8 print:p-0 print:bg-white">
            {/* Toolbar - Hides on Print */}
            <div className="mb-6 flex justify-between print:hidden max-w-[800px] mx-auto w-full">
                <Button variant="outline" onClick={() => navigate('/admin/bookings')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button onClick={() => window.print()} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Printer className="w-4 h-4 mr-2" /> Print PDF
                </Button>
            </div>

            {/* Voucher Area */}
            <VoucherTemplate data={data} />
        </div>
    );
}

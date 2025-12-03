import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export const LoadingSpinner = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Show spinner quickly if loading (prevents white flash)
        const timer = setTimeout(() => setShow(true), 50);
        return () => clearTimeout(timer);
    }, []);

    if (!show) return (
        // Show placeholder immediately to prevent white flash
        <div className="flex items-center justify-center min-h-[50vh] bg-background" />
    );

    return (
        <div className="flex items-center justify-center min-h-[50vh] bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-[#0071c2]" />
        </div>
    );
};

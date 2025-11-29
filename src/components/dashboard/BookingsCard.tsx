
import { Calendar, Home } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookingsCardProps {
  isFullWidth?: boolean;
}

const BookingsCard = ({ isFullWidth = false }: BookingsCardProps) => {
  return (
    <Card className={isFullWidth ? "md:col-span-2" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary-deep" />
          Upcoming Bookings
        </CardTitle>
        <CardDescription>Your scheduled trips to Kedarnath</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-6 text-center text-mist">
          <Home className="h-12 w-12 mx-auto mb-4 text-mist opacity-50" />
          <h3 className="text-lg font-medium text-primary-deep mb-2">No Bookings Found</h3>
          <p className="max-w-md mx-auto mb-6">
            You haven't made any bookings yet. Start planning your spiritual journey to Kedarnath now.
          </p>
          <Button variant="outline">Browse Stays</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingsCard;

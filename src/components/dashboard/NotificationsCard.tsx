
import { Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotificationsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-primary-deep" />
          Notifications
        </CardTitle>
        <CardDescription>Your latest updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-6 text-center text-mist">
          <p>No new notifications</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;

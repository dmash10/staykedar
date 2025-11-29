
import { User, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileData {
  name: string | null;
  phone_number: string | null;
}

interface ProfileCardProps {
  profileData: ProfileData | null;
  userEmail: string | undefined;
}

const ProfileCard = ({ profileData, userEmail }: ProfileCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5 text-primary-deep" />
          Profile Information
        </CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <User className="w-5 h-5 mr-3 text-mist" />
            <div>
              <span className="text-sm text-mist">Name</span>
              <p className="font-medium">{profileData?.name || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Mail className="w-5 h-5 mr-3 text-mist" />
            <div>
              <span className="text-sm text-mist">Email</span>
              <p className="font-medium">{userEmail}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-3 text-mist" />
            <div>
              <span className="text-sm text-mist">Phone</span>
              <p className="font-medium">{profileData?.phone_number || "Not provided"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;

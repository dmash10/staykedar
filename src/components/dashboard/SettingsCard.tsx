
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SettingsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your account preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              <p className="text-sm text-mist">
                Control how and when we contact you
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="email-notifications" className="rounded" />
                <label htmlFor="email-notifications">Email Notifications</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="sms-notifications" className="rounded" />
                <label htmlFor="sms-notifications">SMS Notifications</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="marketing-emails" className="rounded" />
                <label htmlFor="marketing-emails">Marketing Emails</label>
              </div>
            </div>
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Security</h3>
              <p className="text-sm text-mist">
                Manage your security settings
              </p>
            </div>
            <div className="space-y-2">
              <Button variant="outline">Change Password</Button>
              <Button variant="outline" className="ml-2">Enable Two-Factor Authentication</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsCard;

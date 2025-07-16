import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Building, Mail, Globe, FileText, Download, Bell } from "lucide-react";

export default function Settings() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Company Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    defaultValue="My Abroad Ally"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="company-email">Contact Email</Label>
                  <Input 
                    id="company-email" 
                    type="email"
                    defaultValue="maa@myabroadally.com"
                    placeholder="Enter contact email"
                  />
                </div>
                <div>
                  <Label htmlFor="company-phone">Phone Number</Label>
                  <Input 
                    id="company-phone" 
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="company-website">Website</Label>
                  <Input 
                    id="company-website" 
                    defaultValue="myabroadally.com"
                    placeholder="Enter website URL"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="company-address">Address</Label>
                <Input 
                  id="company-address" 
                  placeholder="Enter company address"
                />
              </div>
              <Button>Save Company Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Settings */}
        <TabsContent value="quotes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Quote Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quote-prefix">Quote Number Prefix</Label>
                  <Input 
                    id="quote-prefix" 
                    defaultValue="TPQ"
                    placeholder="Enter quote prefix"
                  />
                </div>
                <div>
                  <Label htmlFor="quote-validity">Quote Validity (days)</Label>
                  <Input 
                    id="quote-validity" 
                    type="number"
                    defaultValue="30"
                    placeholder="Enter validity period"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Default Services</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="include-insurance" defaultChecked />
                  <Label htmlFor="include-insurance">Include travel insurance by default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-transfers" defaultChecked />
                  <Label htmlFor="include-transfers">Include airport transfers by default</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="include-transport" defaultChecked />
                  <Label htmlFor="include-transport">Include local transport card by default</Label>
                </div>
              </div>
              
              <Button>Save Quote Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="email-notifications" defaultChecked />
                  <Label htmlFor="email-notifications">Email notifications for new quotes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="client-notifications" defaultChecked />
                  <Label htmlFor="client-notifications">Notify when new clients are added</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="quote-reminders" />
                  <Label htmlFor="quote-reminders">Remind about expiring quotes</Label>
                </div>
              </div>
              
              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Settings */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5" />
                <span>Export & Backup</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="include-logos" defaultChecked />
                  <Label htmlFor="include-logos">Include company logo in PDF exports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="watermark" />
                  <Label htmlFor="watermark">Add watermark to PDF exports</Label>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Data Export</Label>
                <div className="flex space-x-2">
                  <Button variant="outline">Export All Quotes</Button>
                  <Button variant="outline">Export All Clients</Button>
                  <Button variant="outline">Full Database Backup</Button>
                </div>
              </div>
              
              <Button>Save Export Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Save, 
  Loader2, 
  Globe, 
  Mail, 
  Phone, 
  Facebook, 
  Twitter, 
  Instagram, 
  Search,
  CreditCard,
  Calendar,
  Shield,
  Percent,
  Clock,
  Users,
  PawPrint,
  Youtube,
  Linkedin,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
interface GeneralSettings {
  siteName: string;
  tagline: string;
  supportEmail: string;
  phoneNumber: string;
  whatsappNumber: string;
  address: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  maintenanceMode: boolean;
  timezone: string;
  currency: string;
}

interface SEOSettings {
  page_key: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  robots_directive: string;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  smtp_secure: boolean;
  from_email: string;
  from_name: string;
  reply_to: string;
  is_enabled: boolean;
}

interface PaymentSettings {
  provider: string;
  is_enabled: boolean;
  is_test_mode: boolean;
  api_key: string;
  secret_key: string;
  webhook_secret: string;
  currency: string;
}

interface BookingRules {
  check_in_time: string;
  check_out_time: string;
  min_advance_booking_days: number;
  max_advance_booking_days: number;
  cancellation_policy: string;
  cancellation_hours: number;
  cancellation_fee_percent: number;
  allow_same_day_booking: boolean;
  require_id_verification: boolean;
  require_phone_verification: boolean;
  max_guests_per_room: number;
  child_age_limit: number;
  pet_policy: string;
  pets_allowed: boolean;
}

interface TaxSetting {
  id?: string;
  tax_name: string;
  tax_rate: number;
  is_inclusive: boolean;
  is_enabled: boolean;
  applies_to: string;
}

const DEFAULT_GENERAL: GeneralSettings = {
  siteName: 'StayKedar',
  tagline: 'Your Gateway to Divine Kedarnath',
  supportEmail: 'support@staykedar.com',
  phoneNumber: '+91 98765 43210',
  whatsappNumber: '+91 98765 43210',
  address: 'Kedarnath, Uttarakhand, India',
  socials: {
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
    linkedin: ''
  },
  maintenanceMode: false,
  timezone: 'Asia/Kolkata',
  currency: 'INR'
};

const DEFAULT_EMAIL: EmailSettings = {
  smtp_host: '',
  smtp_port: 587,
  smtp_user: '',
  smtp_password: '',
  smtp_secure: true,
  from_email: '',
  from_name: 'StayKedar',
  reply_to: '',
  is_enabled: false
};

const DEFAULT_PAYMENT: PaymentSettings = {
  provider: 'razorpay',
  is_enabled: false,
  is_test_mode: true,
  api_key: '',
  secret_key: '',
  webhook_secret: '',
  currency: 'INR'
};

const DEFAULT_BOOKING: BookingRules = {
  check_in_time: '14:00',
  check_out_time: '11:00',
  min_advance_booking_days: 1,
  max_advance_booking_days: 365,
  cancellation_policy: '',
  cancellation_hours: 24,
  cancellation_fee_percent: 50,
  allow_same_day_booking: false,
  require_id_verification: true,
  require_phone_verification: false,
  max_guests_per_room: 4,
  child_age_limit: 12,
  pet_policy: '',
  pets_allowed: false
};

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Form states
  const [generalForm, setGeneralForm] = useState<GeneralSettings>(DEFAULT_GENERAL);
  const [emailForm, setEmailForm] = useState<EmailSettings>(DEFAULT_EMAIL);
  const [paymentForm, setPaymentForm] = useState<PaymentSettings>(DEFAULT_PAYMENT);
  const [bookingForm, setBookingForm] = useState<BookingRules>(DEFAULT_BOOKING);
  const [seoForms, setSeoForms] = useState<SEOSettings[]>([]);
  const [taxForms, setTaxForms] = useState<TaxSetting[]>([]);

  // Fetch all settings
  const { data: allSettings, isLoading } = useQuery({
    queryKey: ['all-admin-settings'],
    queryFn: async () => {
      const [generalRes, seoRes, emailRes, paymentRes, bookingRes, taxRes] = await Promise.all([
        supabase.from('site_content').select('content').eq('key', 'global_settings').maybeSingle(),
        supabase.from('seo_settings').select('*'),
        supabase.from('email_settings').select('*').limit(1).maybeSingle(),
        supabase.from('payment_settings').select('*').limit(1).maybeSingle(),
        supabase.from('booking_rules').select('*').limit(1).maybeSingle(),
        supabase.from('tax_settings').select('*').order('created_at')
      ]);

      return {
        general: generalRes.data?.content as GeneralSettings | null,
        seo: seoRes.data as SEOSettings[] | null,
        email: emailRes.data as EmailSettings | null,
        payment: paymentRes.data as PaymentSettings | null,
        booking: bookingRes.data as BookingRules | null,
        taxes: taxRes.data as TaxSetting[] | null
      };
    }
  });

  // Update forms when data loads
  useEffect(() => {
    if (allSettings) {
      if (allSettings.general) setGeneralForm({ ...DEFAULT_GENERAL, ...allSettings.general });
      if (allSettings.seo) setSeoForms(allSettings.seo);
      if (allSettings.email) setEmailForm({ ...DEFAULT_EMAIL, ...allSettings.email });
      if (allSettings.payment) setPaymentForm({ ...DEFAULT_PAYMENT, ...allSettings.payment });
      if (allSettings.booking) setBookingForm({ ...DEFAULT_BOOKING, ...allSettings.booking });
      if (allSettings.taxes) setTaxForms(allSettings.taxes);
    }
  }, [allSettings]);

  // Save mutations
  const saveGeneralMutation = useMutation({
    mutationFn: async (data: GeneralSettings) => {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key: 'global_settings', content: data as any }, { onConflict: 'key' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-admin-settings'] });
      toast({ title: "Saved!", description: "General settings updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const saveSEOMutation = useMutation({
    mutationFn: async (data: SEOSettings[]) => {
      for (const seo of data) {
        const { error } = await supabase
          .from('seo_settings')
          .upsert(seo, { onConflict: 'page_key' });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-admin-settings'] });
      toast({ title: "Saved!", description: "SEO settings updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const saveEmailMutation = useMutation({
    mutationFn: async (data: EmailSettings) => {
      const existing = await supabase.from('email_settings').select('id').limit(1).maybeSingle();
      if (existing.data?.id) {
        const { error } = await supabase.from('email_settings').update(data).eq('id', existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_settings').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-admin-settings'] });
      toast({ title: "Saved!", description: "Email settings updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const savePaymentMutation = useMutation({
    mutationFn: async (data: PaymentSettings) => {
      const existing = await supabase.from('payment_settings').select('id').limit(1).maybeSingle();
      if (existing.data?.id) {
        const { error } = await supabase.from('payment_settings').update(data).eq('id', existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('payment_settings').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-admin-settings'] });
      toast({ title: "Saved!", description: "Payment settings updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const saveBookingMutation = useMutation({
    mutationFn: async (data: BookingRules) => {
      const existing = await supabase.from('booking_rules').select('id').limit(1).maybeSingle();
      if (existing.data?.id) {
        const { error } = await supabase.from('booking_rules').update(data).eq('id', existing.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('booking_rules').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-admin-settings'] });
      toast({ title: "Saved!", description: "Booking rules updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const saveTaxMutation = useMutation({
    mutationFn: async (data: TaxSetting[]) => {
      // Delete all existing and insert new
      await supabase.from('tax_settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      for (const tax of data) {
        const { id, ...taxData } = tax;
        const { error } = await supabase.from('tax_settings').insert(taxData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-admin-settings'] });
      toast({ title: "Saved!", description: "Tax settings updated successfully." });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const addTax = () => {
    setTaxForms([...taxForms, { tax_name: '', tax_rate: 0, is_inclusive: false, is_enabled: true, applies_to: 'all' }]);
  };

  const removeTax = (index: number) => {
    setTaxForms(taxForms.filter((_, i) => i !== index));
  };

  const updateSeoForm = (index: number, field: keyof SEOSettings, value: string) => {
    const updated = [...seoForms];
    updated[index] = { ...updated[index], [field]: value };
    setSeoForms(updated);
  };

  const updateTaxForm = (index: number, field: keyof TaxSetting, value: any) => {
    const updated = [...taxForms];
    updated[index] = { ...updated[index], [field]: value };
    setTaxForms(updated);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[#111111] border border-[#2A2A2A] p-1 flex-wrap h-auto gap-1">
            <TabsTrigger value="general" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
              <Globe className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
              <Search className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="booking" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
              <Calendar className="w-4 h-4 mr-2" />
              Booking Rules
            </TabsTrigger>
            <TabsTrigger value="tax" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400">
              <Percent className="w-4 h-4 mr-2" />
              Tax & Fees
            </TabsTrigger>
          </TabsList>

          {/* GENERAL SETTINGS */}
          <TabsContent value="general">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                General Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                  Basic site configuration and contact information
              </CardDescription>
            </CardHeader>
              <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Site Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Site Name</Label>
                      <Input
                        value={generalForm.siteName}
                        onChange={(e) => setGeneralForm({ ...generalForm, siteName: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="StayKedar"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Tagline</Label>
                      <Input
                        value={generalForm.tagline}
                        onChange={(e) => setGeneralForm({ ...generalForm, tagline: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="Your Gateway to Divine Kedarnath"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Timezone</Label>
                      <Select value={generalForm.timezone} onValueChange={(v) => setGeneralForm({ ...generalForm, timezone: v })}>
                        <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Currency</Label>
                      <Select value={generalForm.currency} onValueChange={(v) => setGeneralForm({ ...generalForm, currency: v })}>
                        <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                        </SelectContent>
                      </Select>
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Contact Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Support Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                          value={generalForm.supportEmail}
                          onChange={(e) => setGeneralForm({ ...generalForm, supportEmail: e.target.value })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="support@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                          value={generalForm.phoneNumber}
                          onChange={(e) => setGeneralForm({ ...generalForm, phoneNumber: e.target.value })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">WhatsApp Number</Label>
                      <Input
                        value={generalForm.whatsappNumber}
                        onChange={(e) => setGeneralForm({ ...generalForm, whatsappNumber: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Address</Label>
                      <Input
                        value={generalForm.address}
                        onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="Kedarnath, Uttarakhand"
                      />
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Social Media</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                      <Label className="text-gray-300">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                          value={generalForm.socials.facebook}
                          onChange={(e) => setGeneralForm({
                            ...generalForm,
                            socials: { ...generalForm.socials, facebook: e.target.value }
                        })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label className="text-gray-300">Twitter</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                          value={generalForm.socials.twitter}
                          onChange={(e) => setGeneralForm({
                            ...generalForm,
                            socials: { ...generalForm.socials, twitter: e.target.value }
                        })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label className="text-gray-300">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                          value={generalForm.socials.instagram}
                          onChange={(e) => setGeneralForm({
                            ...generalForm,
                            socials: { ...generalForm.socials, instagram: e.target.value }
                        })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="https://instagram.com/..."
                      />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">YouTube</Label>
                      <div className="relative">
                        <Youtube className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          value={generalForm.socials.youtube}
                          onChange={(e) => setGeneralForm({
                            ...generalForm,
                            socials: { ...generalForm.socials, youtube: e.target.value }
                          })}
                          className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">LinkedIn</Label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          value={generalForm.socials.linkedin}
                          onChange={(e) => setGeneralForm({
                            ...generalForm,
                            socials: { ...generalForm.socials, linkedin: e.target.value }
                          })}
                          className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* System Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">System Status</h3>
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Temporarily disable the public site for maintenance.
                    </p>
                  </div>
                  <Switch
                      checked={generalForm.maintenanceMode}
                      onCheckedChange={(checked) => setGeneralForm({ ...generalForm, maintenanceMode: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                    onClick={() => saveGeneralMutation.mutate(generalForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                    disabled={saveGeneralMutation.isPending}
                  >
                    {saveGeneralMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Save Changes</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO SETTINGS */}
          <TabsContent value="seo">
            <Card className="bg-[#111111] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-400" />
                  SEO Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure meta tags and search engine optimization for each page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {seoForms.map((seo, index) => (
                  <div key={seo.page_key} className="p-4 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {seo.page_key.toUpperCase()} PAGE
                      </Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Meta Title</Label>
                        <Input
                          value={seo.meta_title || ''}
                          onChange={(e) => updateSeoForm(index, 'meta_title', e.target.value)}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="Page title for search engines"
                        />
                        <p className="text-xs text-gray-500">{(seo.meta_title || '').length}/60 characters</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Meta Keywords</Label>
                        <Input
                          value={seo.meta_keywords || ''}
                          onChange={(e) => updateSeoForm(index, 'meta_keywords', e.target.value)}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Meta Description</Label>
                      <Textarea
                        value={seo.meta_description || ''}
                        onChange={(e) => updateSeoForm(index, 'meta_description', e.target.value)}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[80px]"
                        placeholder="Brief description for search results"
                      />
                      <p className="text-xs text-gray-500">{(seo.meta_description || '').length}/160 characters</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-gray-300">OG Image URL</Label>
                        <Input
                          value={seo.og_image || ''}
                          onChange={(e) => updateSeoForm(index, 'og_image', e.target.value)}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-300">Robots Directive</Label>
                        <Select 
                          value={seo.robots_directive || 'index, follow'} 
                          onValueChange={(v) => updateSeoForm(index, 'robots_directive', v)}
                        >
                          <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                            <SelectItem value="index, follow">Index, Follow</SelectItem>
                            <SelectItem value="noindex, follow">No Index, Follow</SelectItem>
                            <SelectItem value="index, nofollow">Index, No Follow</SelectItem>
                            <SelectItem value="noindex, nofollow">No Index, No Follow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => saveSEOMutation.mutate(seoForms)}
                    className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
                    disabled={saveSEOMutation.isPending}
                  >
                    {saveSEOMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Save SEO Settings</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EMAIL SETTINGS */}
          <TabsContent value="email">
            <Card className="bg-[#111111] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-400" />
                  Email Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure SMTP settings for sending emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    {emailForm.is_enabled ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <div>
                      <Label className="text-base text-white">Email Service</Label>
                      <p className="text-sm text-gray-500">
                        {emailForm.is_enabled ? 'Email sending is enabled' : 'Email sending is disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={emailForm.is_enabled}
                    onCheckedChange={(checked) => setEmailForm({ ...emailForm, is_enabled: checked })}
                  />
                </div>

                <Separator className="bg-[#2A2A2A]" />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">SMTP Configuration</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">SMTP Host</Label>
                      <Input
                        value={emailForm.smtp_host}
                        onChange={(e) => setEmailForm({ ...emailForm, smtp_host: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">SMTP Port</Label>
                      <Input
                        type="number"
                        value={emailForm.smtp_port}
                        onChange={(e) => setEmailForm({ ...emailForm, smtp_port: parseInt(e.target.value) })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="587"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">SMTP Username</Label>
                      <Input
                        value={emailForm.smtp_user}
                        onChange={(e) => setEmailForm({ ...emailForm, smtp_user: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">SMTP Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={emailForm.smtp_password}
                          onChange={(e) => setEmailForm({ ...emailForm, smtp_password: e.target.value })}
                          className="bg-[#1A1A1A] border-[#2A2A2A] text-white pr-10"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1A1A1A]">
                    <Switch
                      checked={emailForm.smtp_secure}
                      onCheckedChange={(checked) => setEmailForm({ ...emailForm, smtp_secure: checked })}
                    />
                    <Label className="text-gray-300">Use SSL/TLS</Label>
                  </div>
                </div>

                <Separator className="bg-[#2A2A2A]" />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Sender Details</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">From Email</Label>
                      <Input
                        value={emailForm.from_email}
                        onChange={(e) => setEmailForm({ ...emailForm, from_email: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="noreply@staykedar.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">From Name</Label>
                      <Input
                        value={emailForm.from_name}
                        onChange={(e) => setEmailForm({ ...emailForm, from_name: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="StayKedar"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-gray-300">Reply-To Email</Label>
                      <Input
                        value={emailForm.reply_to}
                        onChange={(e) => setEmailForm({ ...emailForm, reply_to: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="support@staykedar.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A]"
                  >
                    <TestTube className="mr-2 h-4 w-4" />
                    Send Test Email
                  </Button>
                  <Button
                    onClick={() => saveEmailMutation.mutate(emailForm)}
                    className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]"
                    disabled={saveEmailMutation.isPending}
                  >
                    {saveEmailMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Save Email Settings</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENT SETTINGS */}
          <TabsContent value="payment">
            <Card className="bg-[#111111] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  Payment Gateway Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure payment gateway for accepting online payments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                  <div className="flex items-center gap-3">
                    {paymentForm.is_enabled ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <div>
                      <Label className="text-base text-white">Payment Gateway</Label>
                      <p className="text-sm text-gray-500">
                        {paymentForm.is_enabled ? 'Online payments are enabled' : 'Online payments are disabled'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentForm.is_enabled}
                    onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, is_enabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
                  <div className="flex items-center gap-3">
                    <TestTube className="w-5 h-5 text-amber-400" />
                    <div>
                      <Label className="text-base text-white">Test Mode</Label>
                      <p className="text-sm text-amber-400/80">
                        {paymentForm.is_test_mode ? 'Using test/sandbox environment' : 'Using LIVE environment - real transactions!'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentForm.is_test_mode}
                    onCheckedChange={(checked) => setPaymentForm({ ...paymentForm, is_test_mode: checked })}
                  />
                </div>

                <Separator className="bg-[#2A2A2A]" />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Gateway Configuration</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Payment Provider</Label>
                      <Select 
                        value={paymentForm.provider} 
                        onValueChange={(v) => setPaymentForm({ ...paymentForm, provider: v })}
                      >
                        <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paytm">Paytm</SelectItem>
                          <SelectItem value="phonepe">PhonePe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Currency</Label>
                      <Select 
                        value={paymentForm.currency} 
                        onValueChange={(v) => setPaymentForm({ ...paymentForm, currency: v })}
                      >
                        <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">API Key (Publishable)</Label>
                    <div className="relative">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={paymentForm.api_key}
                        onChange={(e) => setPaymentForm({ ...paymentForm, api_key: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white pr-10"
                        placeholder="rzp_test_xxxxxxxxxxxxx"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Secret Key</Label>
                    <Input
                      type="password"
                      value={paymentForm.secret_key}
                      onChange={(e) => setPaymentForm({ ...paymentForm, secret_key: e.target.value })}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      placeholder="••••••••••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Webhook Secret</Label>
                    <Input
                      type="password"
                      value={paymentForm.webhook_secret}
                      onChange={(e) => setPaymentForm({ ...paymentForm, webhook_secret: e.target.value })}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      placeholder="whsec_xxxxxxxxxxxxx"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => savePaymentMutation.mutate(paymentForm)}
                    className="bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]"
                    disabled={savePaymentMutation.isPending}
                  >
                    {savePaymentMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Save Payment Settings</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BOOKING RULES */}
          <TabsContent value="booking">
            <Card className="bg-[#111111] border-[#2A2A2A]">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Booking Rules
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Configure check-in/out times, cancellation policies, and guest rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Check-in/out Times */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Check-in / Check-out
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Check-in Time</Label>
                      <Input
                        type="time"
                        value={bookingForm.check_in_time}
                        onChange={(e) => setBookingForm({ ...bookingForm, check_in_time: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Check-out Time</Label>
                      <Input
                        type="time"
                        value={bookingForm.check_out_time}
                        onChange={(e) => setBookingForm({ ...bookingForm, check_out_time: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#2A2A2A]" />

                {/* Booking Window */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Booking Window</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Minimum Advance Booking (Days)</Label>
                      <Input
                        type="number"
                        value={bookingForm.min_advance_booking_days}
                        onChange={(e) => setBookingForm({ ...bookingForm, min_advance_booking_days: parseInt(e.target.value) })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Maximum Advance Booking (Days)</Label>
                      <Input
                        type="number"
                        value={bookingForm.max_advance_booking_days}
                        onChange={(e) => setBookingForm({ ...bookingForm, max_advance_booking_days: parseInt(e.target.value) })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1A1A1A]">
                    <Switch
                      checked={bookingForm.allow_same_day_booking}
                      onCheckedChange={(checked) => setBookingForm({ ...bookingForm, allow_same_day_booking: checked })}
                    />
                    <Label className="text-gray-300">Allow Same-Day Booking</Label>
                  </div>
                </div>

                <Separator className="bg-[#2A2A2A]" />

                {/* Cancellation Policy */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Cancellation Policy
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Free Cancellation Window (Hours)</Label>
                      <Input
                        type="number"
                        value={bookingForm.cancellation_hours}
                        onChange={(e) => setBookingForm({ ...bookingForm, cancellation_hours: parseInt(e.target.value) })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Late Cancellation Fee (%)</Label>
                      <Input
                        type="number"
                        value={bookingForm.cancellation_fee_percent}
                        onChange={(e) => setBookingForm({ ...bookingForm, cancellation_fee_percent: parseInt(e.target.value) })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Cancellation Policy Text</Label>
                    <Textarea
                      value={bookingForm.cancellation_policy}
                      onChange={(e) => setBookingForm({ ...bookingForm, cancellation_policy: e.target.value })}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[100px]"
                      placeholder="Describe your cancellation policy..."
                    />
                  </div>
                </div>

                <Separator className="bg-[#2A2A2A]" />

                {/* Guest Rules */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Guest Rules
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-gray-300">Max Guests Per Room</Label>
                      <Input
                        type="number"
                        value={bookingForm.max_guests_per_room}
                        onChange={(e) => setBookingForm({ ...bookingForm, max_guests_per_room: parseInt(e.target.value) })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-300">Child Age Limit (Years)</Label>
                      <Input
                        type="number"
                        value={bookingForm.child_age_limit}
                        onChange={(e) => setBookingForm({ ...bookingForm, child_age_limit: parseInt(e.target.value) })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1A1A1A]">
                      <Switch
                        checked={bookingForm.require_id_verification}
                        onCheckedChange={(checked) => setBookingForm({ ...bookingForm, require_id_verification: checked })}
                      />
                      <Label className="text-gray-300">Require ID Verification</Label>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1A1A1A]">
                      <Switch
                        checked={bookingForm.require_phone_verification}
                        onCheckedChange={(checked) => setBookingForm({ ...bookingForm, require_phone_verification: checked })}
                      />
                      <Label className="text-gray-300">Require Phone Verification</Label>
                    </div>
                  </div>
                </div>

                <Separator className="bg-[#2A2A2A]" />

                {/* Pet Policy */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider flex items-center gap-2">
                    <PawPrint className="w-4 h-4" />
                    Pet Policy
                  </h3>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[#1A1A1A]">
                    <Switch
                      checked={bookingForm.pets_allowed}
                      onCheckedChange={(checked) => setBookingForm({ ...bookingForm, pets_allowed: checked })}
                    />
                    <Label className="text-gray-300">Allow Pets</Label>
                  </div>
                  {bookingForm.pets_allowed && (
                    <div className="space-y-2">
                      <Label className="text-gray-300">Pet Policy Details</Label>
                      <Textarea
                        value={bookingForm.pet_policy}
                        onChange={(e) => setBookingForm({ ...bookingForm, pet_policy: e.target.value })}
                        className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="Describe pet rules, fees, restrictions..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => saveBookingMutation.mutate(bookingForm)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[120px]"
                    disabled={saveBookingMutation.isPending}
                  >
                    {saveBookingMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Save Booking Rules</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAX SETTINGS */}
          <TabsContent value="tax">
            <Card className="bg-[#111111] border-[#2A2A2A]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Percent className="w-5 h-5 text-rose-400" />
                      Tax & Fees
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure taxes and additional fees
                    </CardDescription>
                  </div>
                  <Button
                    onClick={addTax}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tax
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {taxForms.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No taxes configured. Click "Add Tax" to create one.
                  </div>
                ) : (
                  taxForms.map((tax, index) => (
                    <div key={index} className="p-4 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={tax.is_enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                          {tax.is_enabled ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTax(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                </Button>
              </div>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Tax Name</Label>
                          <Input
                            value={tax.tax_name}
                            onChange={(e) => updateTaxForm(index, 'tax_name', e.target.value)}
                            className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="GST"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Rate (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={tax.tax_rate}
                            onChange={(e) => updateTaxForm(index, 'tax_rate', parseFloat(e.target.value))}
                            className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                            placeholder="18"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Applies To</Label>
                          <Select 
                            value={tax.applies_to} 
                            onValueChange={(v) => updateTaxForm(index, 'applies_to', v)}
                          >
                            <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                              <SelectItem value="all">All Bookings</SelectItem>
                              <SelectItem value="rooms">Room Bookings Only</SelectItem>
                              <SelectItem value="packages">Packages Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">Options</Label>
                          <div className="flex items-center gap-4 h-10">
                            <label className="flex items-center gap-2 text-sm text-gray-300">
                              <Switch
                                checked={tax.is_inclusive}
                                onCheckedChange={(checked) => updateTaxForm(index, 'is_inclusive', checked)}
                              />
                              Inclusive
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-300">
                              <Switch
                                checked={tax.is_enabled}
                                onCheckedChange={(checked) => updateTaxForm(index, 'is_enabled', checked)}
                              />
                              Enabled
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => saveTaxMutation.mutate(taxForms)}
                    className="bg-rose-600 hover:bg-rose-700 text-white min-w-[120px]"
                    disabled={saveTaxMutation.isPending}
                  >
                    {saveTaxMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="mr-2 h-4 w-4" />Save Tax Settings</>
                    )}
                  </Button>
                </div>
            </CardContent>
          </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Car, User, Phone, Mail, MapPin, FileText, Shield, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, Upload, Camera, CreditCard,
  Star, Clock, IndianRupee, Users, Award, Briefcase, Languages
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SERVICE_AREAS, LANGUAGES, VEHICLE_TYPES } from "@/types/carRentals";

// Form schemas for each step
const personalDetailsSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
  whatsapp: z.string().optional(),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  baseCity: z.string().min(2, "Please enter your base city"),
  address: z.string().min(10, "Please enter your complete address"),
  experienceYears: z.string().min(1, "Please select your experience"),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
});

const vehicleDetailsSchema = z.object({
  vehicleType: z.string().min(1, "Please select vehicle type"),
  vehicleName: z.string().min(2, "Please enter vehicle name/model"),
  vehicleNumber: z.string().min(4, "Please enter vehicle registration number"),
  vehicleCapacity: z.string().min(1, "Please select passenger capacity"),
  hasAC: z.boolean(),
  hasMusicSystem: z.boolean(),
  hasFirstAidKit: z.boolean(),
  hasGPS: z.boolean(),
});

const serviceDetailsSchema = z.object({
  serviceAreas: z.array(z.string()).min(1, "Please select at least one service area"),
  pricePerKm: z.string().min(1, "Please enter your rate per km"),
  availableForOutstation: z.boolean(),
  availableForLocal: z.boolean(),
  bio: z.string().min(20, "Please write a brief description about yourself (min 20 chars)"),
});

const documentsSchema = z.object({
  hasValidDL: z.boolean().refine(val => val === true, "You must have a valid driving license"),
  hasVehicleRC: z.boolean().refine(val => val === true, "You must have vehicle RC"),
  hasInsurance: z.boolean().refine(val => val === true, "You must have valid insurance"),
  hasPermit: z.boolean(),
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
  agreeToVerification: z.boolean().refine(val => val === true, "You must agree to verification"),
});

type PersonalDetails = z.infer<typeof personalDetailsSchema>;
type VehicleDetails = z.infer<typeof vehicleDetailsSchema>;
type ServiceDetails = z.infer<typeof serviceDetailsSchema>;
type Documents = z.infer<typeof documentsSchema>;

const steps = [
  { id: 1, name: "Personal Details", icon: User },
  { id: 2, name: "Vehicle Info", icon: Car },
  { id: 3, name: "Services & Pricing", icon: IndianRupee },
  { id: 4, name: "Documents & Submit", icon: FileText },
];

const benefits = [
  { icon: <IndianRupee className="w-6 h-6" />, title: "Earn ₹50,000+/month", desc: "Top drivers earn over ₹50,000 monthly" },
  { icon: <Clock className="w-6 h-6" />, title: "Flexible Schedule", desc: "Work when you want, as much as you want" },
  { icon: <Users className="w-6 h-6" />, title: "Direct Bookings", desc: "No middlemen, get bookings directly" },
  { icon: <Shield className="w-6 h-6" />, title: "Insurance Support", desc: "Comprehensive trip insurance coverage" },
];

const DriverRegistration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personal: {} as PersonalDetails,
    vehicle: {} as VehicleDetails,
    service: {} as ServiceDetails,
    documents: {} as Documents,
  });

  // Forms for each step
  const personalForm = useForm<PersonalDetails>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      whatsapp: "",
      email: "",
      baseCity: "Rishikesh",
      address: "",
      experienceYears: "",
      languages: ["Hindi"],
    },
  });

  const vehicleForm = useForm<VehicleDetails>({
    resolver: zodResolver(vehicleDetailsSchema),
    defaultValues: {
      vehicleType: "",
      vehicleName: "",
      vehicleNumber: "",
      vehicleCapacity: "",
      hasAC: true,
      hasMusicSystem: true,
      hasFirstAidKit: false,
      hasGPS: false,
    },
  });

  const serviceForm = useForm<ServiceDetails>({
    resolver: zodResolver(serviceDetailsSchema),
    defaultValues: {
      serviceAreas: ["Kedarnath"],
      pricePerKm: "",
      availableForOutstation: true,
      availableForLocal: true,
      bio: "",
    },
  });

  const documentsForm = useForm<Documents>({
    resolver: zodResolver(documentsSchema),
    defaultValues: {
      hasValidDL: false,
      hasVehicleRC: false,
      hasInsurance: false,
      hasPermit: false,
      agreeToTerms: false,
      agreeToVerification: false,
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
  };

  const handleStep1Submit = (data: PersonalDetails) => {
    setFormData({ ...formData, personal: data });
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: VehicleDetails) => {
    setFormData({ ...formData, vehicle: data });
    setCurrentStep(3);
  };

  const handleStep3Submit = (data: ServiceDetails) => {
    setFormData({ ...formData, service: data });
    setCurrentStep(4);
  };

  const handleFinalSubmit = async (data: Documents) => {
    setIsSubmitting(true);
    
    const allData = {
      personal: formData.personal,
      vehicle: formData.vehicle,
      service: formData.service,
      documents: data,
    };

    try {
      // Create driver profile
      const driverData = {
        name: allData.personal.fullName,
        slug: generateSlug(allData.personal.fullName),
        phone: allData.personal.phone,
        whatsapp: allData.personal.whatsapp || allData.personal.phone,
        email: allData.personal.email || null,
        base_city: allData.personal.baseCity,
        experience_years: parseInt(allData.personal.experienceYears),
        languages: allData.personal.languages,
        service_areas: allData.service.serviceAreas,
        price_per_km: parseFloat(allData.service.pricePerKm),
        bio: allData.service.bio,
        is_verified: false,
        is_featured: false,
        is_active: false, // Pending approval
        rating: 5.0,
        total_trips: 0,
        total_reviews: 0,
      };

      const { data: driver, error: driverError } = await supabase
        .from('car_drivers')
        .insert([driverData])
        .select()
        .single();

      if (driverError) throw driverError;

      // Create vehicle record
      const vehicleFeatures = [];
      if (allData.vehicle.hasAC) vehicleFeatures.push("AC");
      if (allData.vehicle.hasMusicSystem) vehicleFeatures.push("Music System");
      if (allData.vehicle.hasFirstAidKit) vehicleFeatures.push("First Aid Kit");
      if (allData.vehicle.hasGPS) vehicleFeatures.push("GPS Navigation");

      const vehicleData = {
        driver_id: driver.id,
        vehicle_type: allData.vehicle.vehicleType,
        vehicle_name: allData.vehicle.vehicleName,
        vehicle_number: allData.vehicle.vehicleNumber,
        capacity: parseInt(allData.vehicle.vehicleCapacity),
        luggage_capacity: Math.floor(parseInt(allData.vehicle.vehicleCapacity) / 2),
        features: vehicleFeatures,
        price_per_km: parseFloat(allData.service.pricePerKm),
        is_primary: true,
        is_active: true,
      };

      const { error: vehicleError } = await supabase
        .from('car_vehicles')
        .insert([vehicleData]);

      if (vehicleError) throw vehicleError;

      // Success!
      toast({
        title: "Registration Successful! 🎉",
        description: "Your application has been submitted. We'll verify and activate your profile within 24-48 hours.",
      });

      // Redirect to success page or WhatsApp
      const message = `Hi! I just registered as a driver on StayKedarnath.\n\nName: ${allData.personal.fullName}\nPhone: ${allData.personal.phone}\nVehicle: ${allData.vehicle.vehicleName} (${allData.vehicle.vehicleType})\n\nPlease verify my profile.`;
      window.open(`https://wa.me/919027475942?text=${encodeURIComponent(message)}`, '_blank');
      
      navigate('/car-rentals');

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      <Helmet>
        <title>Become a Driver Partner | Earn with StayKedarnath</title>
        <meta name="description" content="Register as a taxi driver partner with StayKedarnath. Earn ₹50,000+ monthly driving pilgrims to Kedarnath. Flexible hours, direct bookings, no commission." />
        <link rel="canonical" href="https://staykedarnath.in/driver-registration" />
      </Helmet>

      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <Container className="relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-4">
              <Car className="w-3 h-3 mr-1" /> Now Hiring Drivers
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Drive with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                StayKedarnath
              </span>
            </h1>
            <p className="text-xl text-blue-100/80 mb-8">
              Join 500+ driver partners earning ₹50,000+ monthly. Get direct bookings from pilgrims traveling to Kedarnath.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 text-white">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-white text-sm">{benefit.title}</h3>
                  <p className="text-xs text-blue-200/70">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Registration Form */}
      <section className="py-12 bg-gray-50">
        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : isActive
                              ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                          {step.name}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 rounded ${
                          currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                        }`} style={{ minWidth: '40px' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Card */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {/* Step 1: Personal Details */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <User className="w-6 h-6 text-blue-600" />
                          Personal Details
                        </h2>
                        <p className="text-gray-500">Tell us about yourself</p>
                      </div>

                      <Form {...personalForm}>
                        <form onSubmit={personalForm.handleSubmit(handleStep1Submit)} className="space-y-5">
                          <FormField
                            control={personalForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={personalForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="10-digit mobile number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={personalForm.control}
                              name="whatsapp"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>WhatsApp Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Same as phone if empty" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={personalForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={personalForm.control}
                              name="baseCity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Base City *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select your city" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="Rishikesh">Rishikesh</SelectItem>
                                      <SelectItem value="Haridwar">Haridwar</SelectItem>
                                      <SelectItem value="Dehradun">Dehradun</SelectItem>
                                      <SelectItem value="Delhi">Delhi NCR</SelectItem>
                                      <SelectItem value="Rudraprayag">Rudraprayag</SelectItem>
                                      <SelectItem value="Srinagar">Srinagar (UK)</SelectItem>
                                      <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={personalForm.control}
                              name="experienceYears"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Driving Experience *</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Years of experience" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="1">1-2 years</SelectItem>
                                      <SelectItem value="3">3-5 years</SelectItem>
                                      <SelectItem value="5">5-10 years</SelectItem>
                                      <SelectItem value="10">10+ years</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={personalForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Address *</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Your complete address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={personalForm.control}
                            name="languages"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Languages Spoken *</FormLabel>
                                <div className="flex flex-wrap gap-3">
                                  {LANGUAGES.map((lang) => (
                                    <label key={lang} className="flex items-center gap-2 cursor-pointer">
                                      <Checkbox
                                        checked={field.value?.includes(lang)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...field.value, lang]);
                                          } else {
                                            field.onChange(field.value.filter((l: string) => l !== lang));
                                          }
                                        }}
                                      />
                                      <span className="text-sm">{lang}</span>
                                    </label>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                            Continue <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </form>
                      </Form>
                    </motion.div>
                  )}

                  {/* Step 2: Vehicle Details */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <Car className="w-6 h-6 text-blue-600" />
                          Vehicle Information
                        </h2>
                        <p className="text-gray-500">Tell us about your vehicle</p>
                      </div>

                      <Form {...vehicleForm}>
                        <form onSubmit={vehicleForm.handleSubmit(handleStep2Submit)} className="space-y-5">
                          <FormField
                            control={vehicleForm.control}
                            name="vehicleType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vehicle Type *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select vehicle type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {VEHICLE_TYPES.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.icon} {type.label} ({type.capacity} seats)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={vehicleForm.control}
                              name="vehicleName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vehicle Model *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., Innova Crysta, Swift Dzire" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={vehicleForm.control}
                              name="vehicleNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Registration Number *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g., UK07AB1234" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={vehicleForm.control}
                            name="vehicleCapacity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Passenger Capacity *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="How many passengers?" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="4">4 passengers</SelectItem>
                                    <SelectItem value="5">5 passengers</SelectItem>
                                    <SelectItem value="6">6 passengers</SelectItem>
                                    <SelectItem value="7">7 passengers</SelectItem>
                                    <SelectItem value="12">12 passengers</SelectItem>
                                    <SelectItem value="17">17 passengers</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div>
                            <FormLabel className="mb-3 block">Vehicle Features</FormLabel>
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={vehicleForm.control}
                                name="hasAC"
                                render={({ field }) => (
                                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    <span>Air Conditioning</span>
                                  </label>
                                )}
                              />
                              <FormField
                                control={vehicleForm.control}
                                name="hasMusicSystem"
                                render={({ field }) => (
                                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    <span>Music System</span>
                                  </label>
                                )}
                              />
                              <FormField
                                control={vehicleForm.control}
                                name="hasFirstAidKit"
                                render={({ field }) => (
                                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    <span>First Aid Kit</span>
                                  </label>
                                )}
                              />
                              <FormField
                                control={vehicleForm.control}
                                name="hasGPS"
                                render={({ field }) => (
                                  <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    <span>GPS Navigation</span>
                                  </label>
                                )}
                              />
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                              <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                              Continue <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </motion.div>
                  )}

                  {/* Step 3: Service Details */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <IndianRupee className="w-6 h-6 text-blue-600" />
                          Services & Pricing
                        </h2>
                        <p className="text-gray-500">Set your service areas and rates</p>
                      </div>

                      <Form {...serviceForm}>
                        <form onSubmit={serviceForm.handleSubmit(handleStep3Submit)} className="space-y-5">
                          <FormField
                            control={serviceForm.control}
                            name="serviceAreas"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service Areas *</FormLabel>
                                <FormDescription>Select all routes you can serve</FormDescription>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {SERVICE_AREAS.map((area) => (
                                    <label
                                      key={area}
                                      className={`flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer transition ${
                                        field.value?.includes(area)
                                          ? 'bg-blue-600 text-white border-blue-600'
                                          : 'bg-white hover:border-blue-300'
                                      }`}
                                    >
                                      <Checkbox
                                        checked={field.value?.includes(area)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([...field.value, area]);
                                          } else {
                                            field.onChange(field.value.filter((a: string) => a !== area));
                                          }
                                        }}
                                        className="hidden"
                                      />
                                      <span className="text-sm">{area}</span>
                                    </label>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={serviceForm.control}
                            name="pricePerKm"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Your Rate (₹ per km) *</FormLabel>
                                <FormDescription>
                                  Suggested: Sedan ₹12-15, SUV ₹18-22, Tempo ₹25-35 per km
                                </FormDescription>
                                <FormControl>
                                  <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input type="number" placeholder="e.g., 18" className="pl-10" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-4">
                            <FormField
                              control={serviceForm.control}
                              name="availableForOutstation"
                              render={({ field }) => (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  <span>Available for outstation trips</span>
                                </label>
                              )}
                            />
                            <FormField
                              control={serviceForm.control}
                              name="availableForLocal"
                              render={({ field }) => (
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  <span>Available for local trips</span>
                                </label>
                              )}
                            />
                          </div>

                          <FormField
                            control={serviceForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>About You *</FormLabel>
                                <FormDescription>
                                  Write a brief description about yourself and your service
                                </FormDescription>
                                <FormControl>
                                  <Textarea
                                    placeholder="I am an experienced driver with 10+ years of driving in hilly terrain. I specialize in Char Dham routes and ensure safe, comfortable journeys..."
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                              <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                              Continue <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </motion.div>
                  )}

                  {/* Step 4: Documents & Submit */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <FileText className="w-6 h-6 text-blue-600" />
                          Documents & Verification
                        </h2>
                        <p className="text-gray-500">Confirm you have the required documents</p>
                      </div>

                      <Form {...documentsForm}>
                        <form onSubmit={documentsForm.handleSubmit(handleFinalSubmit)} className="space-y-5">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-yellow-800">
                              <strong>Note:</strong> You'll need to share these documents via WhatsApp after registration for verification.
                            </p>
                          </div>

                          <div className="space-y-3">
                            <FormField
                              control={documentsForm.control}
                              name="hasValidDL"
                              render={({ field }) => (
                                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                                  <div>
                                    <span className="font-medium">Valid Driving License *</span>
                                    <p className="text-sm text-gray-500">Commercial driving license (LMV/HMV)</p>
                                  </div>
                                </label>
                              )}
                            />
                            <FormField
                              control={documentsForm.control}
                              name="hasVehicleRC"
                              render={({ field }) => (
                                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                                  <div>
                                    <span className="font-medium">Vehicle Registration Certificate (RC) *</span>
                                    <p className="text-sm text-gray-500">Valid RC book of your vehicle</p>
                                  </div>
                                </label>
                              )}
                            />
                            <FormField
                              control={documentsForm.control}
                              name="hasInsurance"
                              render={({ field }) => (
                                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                                  <div>
                                    <span className="font-medium">Valid Insurance *</span>
                                    <p className="text-sm text-gray-500">Comprehensive vehicle insurance</p>
                                  </div>
                                </label>
                              )}
                            />
                            <FormField
                              control={documentsForm.control}
                              name="hasPermit"
                              render={({ field }) => (
                                <label className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                                  <div>
                                    <span className="font-medium">Tourist/All India Permit</span>
                                    <p className="text-sm text-gray-500">Permit for interstate travel (if applicable)</p>
                                  </div>
                                </label>
                              )}
                            />
                          </div>

                          <div className="border-t pt-5 mt-5 space-y-3">
                            <FormField
                              control={documentsForm.control}
                              name="agreeToTerms"
                              render={({ field }) => (
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                                  <span className="text-sm">
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-blue-600 hover:underline">Terms & Conditions</Link>
                                    {" "}and{" "}
                                    <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> *
                                  </span>
                                </label>
                              )}
                            />
                            <FormField
                              control={documentsForm.control}
                              name="agreeToVerification"
                              render={({ field }) => (
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                                  <span className="text-sm">
                                    I consent to background verification and document verification by StayKedarnath *
                                  </span>
                                </label>
                              )}
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={goBack} className="flex-1">
                              <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button 
                              type="submit" 
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Submitting...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Submit Application
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* Help Section */}
            <div className="mt-8 text-center">
              <p className="text-gray-500 mb-2">Need help with registration?</p>
              <Button
                variant="outline"
                onClick={() => window.open('https://wa.me/919027475942?text=Hi! I need help with driver registration on StayKedarnath.', '_blank')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </>
  );
};

export default DriverRegistration;



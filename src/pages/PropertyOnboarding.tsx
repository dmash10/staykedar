import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin, FileText, Bed, CheckCircle, ChevronRight, ChevronLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/hooks/use-toast";
import stayService from "@/api/stayService";

// Schema for step 1: Property Basics
const step1Schema = z.object({
    propertyName: z.string().min(3, "Property name must be at least 3 characters"),
    propertyType: z.string().min(1, "Please select a property type"),
    address: z.string().min(10, "Please enter a complete address"),
});

// Schema for step 2: Description & Amenities
const step2Schema = z.object({
    description: z.string().min(50, "Description must be at least 50 characters"),
    amenities: z.array(z.string()).min(1, "Please select at least one amenity"),
    imageUrls: z.array(z.string()).min(1, "Please add at least one image URL"),
});

// Room types for step 3
type RoomInventory = {
    id: string;
    roomType: string;
    name: string;
    price: number;
    capacity: number;
    quantity: number;
    description: string;
};

const PropertyOnboarding = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1 state
    const [propertyName, setPropertyName] = useState("");
    const [propertyType, setPropertyType] = useState("");
    const [address, setAddress] = useState("");

    // Step 2 state
    const [description, setDescription] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([""]);

    // Step 3 state
    const [rooms, setRooms] = useState<RoomInventory[]>([]);

    const propertyTypes = ["Hotel", "Homestay", "Resort", "Guest House", "Dharamshala", "Villa"];
    const amenitiesList = ["WiFi", "Parking", "Restaurant", "Room Service", "Power Backup", "Geyser", "TV", "AC", "Balcony", "Mountain View"];
    const roomTypes = ["Standard", "Deluxe", "Suite", "Family", "Dormitory", "Villa"];

    const steps = [
        { number: 1, title: "Property Basics", icon: Building2 },
        { number: 2, title: "Description & Photos", icon: FileText },
        { number: 3, title: "Room Configuration", icon: Bed },
        { number: 4, title: "Review & Submit", icon: CheckCircle },
    ];

    const handleNextStep = () => {
        // Validation for each step
        if (currentStep === 1) {
            if (!propertyName || !propertyType || !address) {
                toast({
                    title: "Incomplete Information",
                    description: "Please fill in all required fields.",
                    variant: "destructive",
                });
                return;
            }
        } else if (currentStep === 2) {
            if (!description || selectedAmenities.length === 0 || imageUrls.filter(url => url.trim()).length === 0) {
                toast({
                    title: "Incomplete Information",
                    description: "Please add description, at least one amenity, and one image.",
                    variant: "destructive",
                });
                return;
            }
        } else if (currentStep === 3) {
            if (rooms.length === 0) {
                toast({
                    title: "No Rooms Added",
                    description: "Please add at least one room type.",
                    variant: "destructive",
                });
                return;
            }
        }

        setCurrentStep(currentStep + 1);
    };

    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const addImageUrl = () => {
        setImageUrls([...imageUrls, ""]);
    };

    const updateImageUrl = (index: number, value: string) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const removeImageUrl = (index: number) => {
        setImageUrls(imageUrls.filter((_, i) => i !== index));
    };

    const addRoom = () => {
        const newRoom: RoomInventory = {
            id: `room-${Date.now()}`,
            roomType: roomTypes[0],
            name: "",
            price: 0,
            capacity: 1,
            quantity: 1,
            description: "",
        };
        setRooms([...rooms, newRoom]);
    };

    const updateRoom = (id: string, field: keyof RoomInventory, value: any) => {
        setRooms(rooms.map(room => room.id === id ? { ...room, [field]: value } : room));
    };

    const removeRoom = (id: string) => {
        setRooms(rooms.filter(room => room.id !== id));
    };

    const handleSubmit = async () => {
        if (!user) {
            toast({
                title: "Not Authenticated",
                description: "Please sign in to continue.",
                variant: "destructive",
            });
            navigate("/auth");
            return;
        }

        setIsSubmitting(true);

        try {
            // Create property
            const property = await stayService.createProperty({
                name: propertyName,
                description,
                address,
                amenities: selectedAmenities,
                images: imageUrls.filter(url => url.trim()),
                owner_id: user.id,
                property_type: propertyType,
                rating: 0,
            });

            // Create rooms
            for (const room of rooms) {
                for (let i = 0; i < room.quantity; i++) {
                    await stayService.createRoom({
                        property_id: property.id,
                        name: `${room.name} ${i + 1}`,
                        description: room.description,
                        room_type: room.roomType.toLowerCase(),
                        price: room.price,
                        capacity: room.capacity,
                        amenities: selectedAmenities,
                        status: stayService.ROOM_STATUSES.AVAILABLE,
                        last_status_update: new Date().toISOString(),
                    });
                }
            }

            toast({
                title: "Property Listed Successfully!",
                description: "Your property is now live on Staykedar.",
            });

            navigate("/dashboard/properties");
        } catch (error: any) {
            console.error("Error creating property:", error);
            toast({
                title: "Submission Failed",
                description: error.message || "Failed to list property. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>List Your Property | Staykedar</title>
            </Helmet>

            <Nav />

            <main className="min-h-screen bg-gray-50 py-12">
                <Container size="lg">
                    {/* Progress Indicator */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between max-w-3xl mx-auto">
                            {steps.map((step, index) => (
                                <div key={step.number} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${currentStep >= step.number
                                                ? "bg-[#0071c2] border-[#0071c2] text-white"
                                                : "bg-white border-gray-300 text-gray-400"
                                                }`}
                                        >
                                            <step.icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-sm font-medium mt-2 text-center">
                                            <div className={currentStep >= step.number ? "text-[#0071c2]" : "text-gray-500"}>
                                                {step.title}
                                            </div>
                                        </div>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`h-1 flex-1 mx-2 ${currentStep > step.number ? "bg-[#0071c2]" : "bg-gray-300"}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-4xl mx-auto">
                        {/* Step 1: Property Basics */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Property Basics</h2>
                                    <p className="text-gray-600">Tell us about your property</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Name *</label>
                                        <Input
                                            placeholder="e.g., Himalayan Paradise Hotel"
                                            value={propertyName}
                                            onChange={(e) => setPropertyName(e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type *</label>
                                        <select
                                            value={propertyType}
                                            onChange={(e) => setPropertyType(e.target.value)}
                                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0071c2]"
                                        >
                                            <option value="">Select property type</option>
                                            {propertyTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                                        <Textarea
                                            placeholder="Enter complete address with city and state"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Description & Photos */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Description & Photos</h2>
                                    <p className="text-gray-600">Make your property shine</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Description *</label>
                                        <Textarea
                                            placeholder="Describe your property, its unique features, and what makes it special..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="min-h-[150px]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Amenities *</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {amenitiesList.map(amenity => (
                                                <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                                    <Checkbox
                                                        checked={selectedAmenities.includes(amenity)}
                                                        onCheckedChange={() => toggleAmenity(amenity)}
                                                    />
                                                    <span className="text-sm">{amenity}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Images *</label>
                                        <p className="text-sm text-gray-500 mb-3">Add image URLs (we'll support uploads soon)</p>
                                        {imageUrls.map((url, index) => (
                                            <div key={index} className="flex gap-2 mb-2">
                                                <Input
                                                    placeholder="https://example.com/image.jpg"
                                                    value={url}
                                                    onChange={(e) => updateImageUrl(index, e.target.value)}
                                                />
                                                {imageUrls.length > 1 && (
                                                    <Button variant="outline" onClick={() => removeImageUrl(index)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" onClick={addImageUrl} className="mt-2">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Another Image
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Room Configuration */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Configuration</h2>
                                        <p className="text-gray-600">Define your room types and inventory</p>
                                    </div>
                                    <Button onClick={addRoom} className="bg-[#0071c2] hover:bg-[#005a9c]">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Room Type
                                    </Button>
                                </div>

                                {rooms.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <Bed className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 mb-4">No rooms added yet</p>
                                        <Button onClick={addRoom} className="bg-[#0071c2] hover:bg-[#005a9c]">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Your First Room Type
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {rooms.map((room, index) => (
                                            <div key={room.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-gray-900">Room Type #{index + 1}</h3>
                                                    <Button variant="outline" onClick={() => removeRoom(room.id)} className="text-red-600">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                                                        <select
                                                            value={room.roomType}
                                                            onChange={(e) => updateRoom(room.id, 'roomType', e.target.value)}
                                                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                                                        >
                                                            {roomTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
                                                        <Input
                                                            placeholder="e.g., Deluxe Mountain View"
                                                            value={room.name}
                                                            onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Price per Night (₹)</label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={room.price}
                                                            onChange={(e) => updateRoom(room.id, 'price', Number(e.target.value))}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Capacity (guests)</label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={room.capacity}
                                                            onChange={(e) => updateRoom(room.id, 'capacity', Number(e.target.value))}
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (# of rooms)</label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={room.quantity}
                                                            onChange={(e) => updateRoom(room.id, 'quantity', Number(e.target.value))}
                                                        />
                                                    </div>

                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                                        <Textarea
                                                            placeholder="Describe this room type..."
                                                            value={room.description}
                                                            onChange={(e) => updateRoom(room.id, 'description', e.target.value)}
                                                            className="min-h-[80px]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Submit</h2>
                                    <p className="text-gray-600">Review your property details before submitting</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Property Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Name:</span>
                                                <p className="font-medium">{propertyName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Type:</span>
                                                <p className="font-medium">{propertyType}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Address:</span>
                                                <p className="font-medium">{address}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Amenities:</span>
                                                <p className="font-medium">{selectedAmenities.join(", ")}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Total Room Types:</span>
                                                <p className="font-medium">{rooms.length}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-600">Total Rooms:</span>
                                                <p className="font-medium">{rooms.reduce((sum, room) => sum + room.quantity, 0)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-900">
                                            By submitting, you agree to list your property on Staykedar and accept our terms and conditions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                            <Button
                                variant="outline"
                                onClick={handlePreviousStep}
                                disabled={currentStep === 1 || isSubmitting}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Previous
                            </Button>

                            {currentStep < 4 ? (
                                <Button onClick={handleNextStep} className="bg-[#0071c2] hover:bg-[#005a9c]">
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Submit Property
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </Container>
            </main>

            <Footer />
        </>
    );
};

export default PropertyOnboarding;

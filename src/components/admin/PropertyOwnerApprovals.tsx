import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Search, CheckCircle, XCircle, Eye, Building, Phone, Mail, FileText, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PropertyOwner {
  id: string;
  firebase_uid: string;
  business_name: string;
  business_address: string;
  business_description: string;
  has_existing_properties: boolean;
  existing_properties_details: string | null;
  profile_complete: boolean;
  verification_status: string;
  created_at: string;
  user_details: {
    name: string;
    email: string;
    phone_number: string;
  }
}

const PropertyOwnerApprovals = () => {
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<PropertyOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwner | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPropertyOwners();
  }, []);

  useEffect(() => {
    filterOwners();
  }, [searchTerm, activeTab, owners]);

  const fetchPropertyOwners = async () => {
    try {
      setLoading(true);
      
      // Get property owners with user details
      const { data, error } = await supabase
        .from('property_owner_details')
        .select(`
          *,
          user_details:customer_details(name, email, phone_number)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setOwners(data || []);
      
    } catch (error) {
      console.error('Error fetching property owners:', error);
      toast({
        title: "Error",
        description: "Failed to load property owner requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOwners = () => {
    const filtered = owners.filter(owner => {
      const matchesSearch = searchTerm === "" || 
        (owner.business_name && owner.business_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (owner.user_details.name && owner.user_details.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (owner.user_details.email && owner.user_details.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTab = activeTab === "all" || 
        (activeTab === "pending" && owner.verification_status === "pending") ||
        (activeTab === "approved" && owner.verification_status === "approved") ||
        (activeTab === "rejected" && owner.verification_status === "rejected");
      
      return matchesSearch && matchesTab;
    });
    
    setFilteredOwners(filtered);
  };

  const handleApprove = async (ownerId: string, firebaseUid: string) => {
    try {
      setLoading(true);
      
      // Update verification status
      const { error: updateError } = await supabase
        .from('property_owner_details')
        .update({ 
          verification_status: 'approved',
          verification_documents: { approved_by: "admin", approved_at: new Date().toISOString() }
        })
        .eq('id', ownerId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update user role approval status
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ 
          is_approved: true,
          approval_date: new Date().toISOString(),
          approved_by: "admin" // Ideally this would be the current admin's ID
        })
        .eq('firebase_uid', firebaseUid);
        
      if (roleError) {
        throw roleError;
      }
      
      // Update owners list
      setOwners(prev => prev.map(owner => 
        owner.id === ownerId 
          ? {...owner, verification_status: 'approved'} 
          : owner
      ));
      
      toast({
        title: "Property Owner Approved",
        description: "The property owner has been approved and can now add listings.",
      });
      
    } catch (error) {
      console.error('Error approving property owner:', error);
      toast({
        title: "Error",
        description: "Failed to approve property owner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDetails(false);
    }
  };

  const handleReject = async (ownerId: string, firebaseUid: string) => {
    try {
      setLoading(true);
      
      // Update verification status
      const { error: updateError } = await supabase
        .from('property_owner_details')
        .update({ 
          verification_status: 'rejected',
          verification_documents: { rejected_by: "admin", rejected_at: new Date().toISOString() }
        })
        .eq('id', ownerId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ 
          is_approved: false
        })
        .eq('firebase_uid', firebaseUid);
        
      if (roleError) {
        throw roleError;
      }
      
      // Update owners list
      setOwners(prev => prev.map(owner => 
        owner.id === ownerId 
          ? {...owner, verification_status: 'rejected'} 
          : owner
      ));
      
      toast({
        title: "Property Owner Rejected",
        description: "The property owner application has been rejected.",
      });
      
    } catch (error) {
      console.error('Error rejecting property owner:', error);
      toast({
        title: "Error",
        description: "Failed to reject property owner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowDetails(false);
    }
  };

  const handleViewDetails = (owner: PropertyOwner) => {
    setSelectedOwner(owner);
    setShowDetails(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Property Owner Approvals</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search owners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="outline" className="ml-2">
              {owners.filter(o => o.verification_status === "pending").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="outline" className="ml-2">
              {owners.filter(o => o.verification_status === "approved").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="outline" className="ml-2">
              {owners.filter(o => o.verification_status === "rejected").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {renderOwnersList("pending")}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {renderOwnersList("approved")}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {renderOwnersList("rejected")}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {renderOwnersList("all")}
        </TabsContent>
      </Tabs>

      {/* Owner Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl">
          {selectedOwner && (
            <>
              <DialogHeader>
                <DialogTitle>Property Owner Details</DialogTitle>
                <DialogDescription>
                  Review the property owner application before making a decision
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Personal Information
                  </h3>
                  
                  <div className="rounded-md border p-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p>{selectedOwner.user_details.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{selectedOwner.user_details.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p>{selectedOwner.user_details.phone_number}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Registered On</p>
                        <p>{format(new Date(selectedOwner.created_at), 'PPP')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Business Information
                  </h3>
                  
                  <div className="rounded-md border p-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                        <p>{selectedOwner.business_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Business Address</p>
                        <p>{selectedOwner.business_address}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Existing Properties</p>
                        <p>{selectedOwner.has_existing_properties ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Business Description
                </h3>
                
                <div className="rounded-md border p-4">
                  <p className="text-sm">{selectedOwner.business_description}</p>
                </div>
              </div>
              
              {selectedOwner.has_existing_properties && selectedOwner.existing_properties_details && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    Existing Properties Details
                  </h3>
                  
                  <div className="rounded-md border p-4">
                    <p className="text-sm">{selectedOwner.existing_properties_details}</p>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetails(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleReject(selectedOwner.id, selectedOwner.firebase_uid)}
                  disabled={loading || selectedOwner.verification_status === 'rejected'}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                  Reject
                </Button>
                <Button 
                  onClick={() => handleApprove(selectedOwner.id, selectedOwner.firebase_uid)}
                  disabled={loading || selectedOwner.verification_status === 'approved'}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderOwnersList(tab: string) {
    if (loading && owners.length === 0) {
      return (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!loading && filteredOwners.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <p className="text-muted-foreground">No property owner applications found</p>
          </CardContent>
        </Card>
      );
    }

    return filteredOwners.map(owner => (
      <Card key={owner.id} className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{owner.business_name}</CardTitle>
              <CardDescription>{owner.user_details.name}</CardDescription>
            </div>
            <Badge 
              className={
                owner.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
                owner.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }
            >
              {owner.verification_status.charAt(0).toUpperCase() + owner.verification_status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">{owner.user_details.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">{owner.user_details.phone_number}</span>
            </div>
          </div>
          <div className="mt-3 flex items-start space-x-2">
            <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground line-clamp-2">
              {owner.business_address}
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t px-6 py-3">
          <div className="flex justify-between items-center w-full">
            <div className="text-xs text-muted-foreground">
              Registered {format(new Date(owner.created_at), 'PPP')}
            </div>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleViewDetails(owner)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
              {owner.verification_status === 'pending' && (
                <>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleReject(owner.id, owner.firebase_uid)}
                    disabled={loading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleApprove(owner.id, owner.firebase_uid)}
                    disabled={loading}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardFooter>
      </Card>
    ));
  }
};

export default PropertyOwnerApprovals; 
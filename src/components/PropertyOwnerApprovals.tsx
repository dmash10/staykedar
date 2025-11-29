import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building, User, Mail, Phone, Check, X, Eye, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

interface PropertyOwner {
  id: string;
  firebase_uid: string;
  role: string;
  is_approved: boolean;
  approval_notes?: string;
  created_at: string;
  updated_at: string;
  profile: {
    name: string;
    email: string;
    phone_number: string;
  };
  business_details: {
    business_name: string;
    business_address: string;
    business_description: string;
    has_existing_properties: boolean;
    existing_properties_details?: string;
  };
}

const PropertyOwnerApprovals = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [owners, setOwners] = useState<PropertyOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<PropertyOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwner | null>(null);
  const [showOwnerDetails, setShowOwnerDetails] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPropertyOwners();
  }, [activeTab]);

  useEffect(() => {
    filterOwners();
  }, [searchTerm, owners]);

  const fetchPropertyOwners = async () => {
    try {
      setLoading(true);
      
      // Define the filter based on the active tab
      const isApprovedFilter = activeTab === "approved" ? true : 
                              activeTab === "rejected" ? false : null;
      
      // Fetch all property owners with their profiles and business details
      let query = supabase
        .from('user_roles')
        .select(`
          *,
          profile:customer_details(name, email, phone_number),
          business_details:property_owner_details(
            business_name, 
            business_address, 
            business_description, 
            has_existing_properties, 
            existing_properties_details
          )
        `)
        .eq('role', 'property_owner');
      
      // Apply approval status filter based on tab
      if (activeTab !== "all") {
        if (activeTab === "pending") {
          query = query.is('is_approved', null);
        } else {
          query = query.eq('is_approved', isApprovedFilter);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      const formattedOwners = data.map(owner => ({
        id: owner.id,
        firebase_uid: owner.firebase_uid,
        role: owner.role,
        is_approved: owner.is_approved,
        approval_notes: owner.approval_notes,
        created_at: owner.created_at,
        updated_at: owner.updated_at,
        profile: owner.profile || { 
          name: "Unknown", 
          email: "Unknown", 
          phone_number: "Unknown" 
        },
        business_details: owner.business_details || {
          business_name: "Unknown",
          business_address: "Unknown",
          business_description: "Unknown",
          has_existing_properties: false
        }
      }));
      
      setOwners(formattedOwners);
      setFilteredOwners(formattedOwners);
      
    } catch (error) {
      console.error('Error fetching property owners:', error);
      toast({
        title: "Error",
        description: "Failed to load property owner applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOwners = () => {
    if (!searchTerm.trim()) {
      setFilteredOwners(owners);
      return;
    }
    
    const filtered = owners.filter(owner => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (owner.profile.name && owner.profile.name.toLowerCase().includes(searchLower)) ||
        (owner.profile.email && owner.profile.email.toLowerCase().includes(searchLower)) ||
        (owner.business_details.business_name && owner.business_details.business_name.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredOwners(filtered);
  };

  const handleViewDetails = (owner: PropertyOwner) => {
    setSelectedOwner(owner);
    setShowOwnerDetails(true);
  };

  const handleApproveOwner = async () => {
    if (!selectedOwner) return;
    
    try {
      setProcessingAction(true);
      
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          is_approved: true,
          approval_notes: approvalNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOwner.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Property Owner Approved",
        description: `${selectedOwner.profile.name}'s application has been approved`,
      });
      
      // Update local state
      setOwners(prev => 
        prev.map(o => 
          o.id === selectedOwner.id 
            ? { ...o, is_approved: true, approval_notes: approvalNotes || undefined } 
            : o
        )
      );
      
      // Update the filtered list as well
      setFilteredOwners(prev => 
        prev.filter(o => o.id !== selectedOwner.id)
      );
      
      setApproveDialogOpen(false);
      setShowOwnerDetails(false);
      setApprovalNotes("");
      
    } catch (error) {
      console.error('Error approving property owner:', error);
      toast({
        title: "Error",
        description: "Failed to approve property owner",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectOwner = async () => {
    if (!selectedOwner) return;
    
    try {
      setProcessingAction(true);
      
      const { error } = await supabase
        .from('user_roles')
        .update({ 
          is_approved: false,
          approval_notes: rejectionNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedOwner.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Property Owner Rejected",
        description: `${selectedOwner.profile.name}'s application has been rejected`,
      });
      
      // Update local state
      setOwners(prev => 
        prev.map(o => 
          o.id === selectedOwner.id 
            ? { ...o, is_approved: false, approval_notes: rejectionNotes || undefined } 
            : o
        )
      );
      
      // Update the filtered list as well
      setFilteredOwners(prev => 
        prev.filter(o => o.id !== selectedOwner.id)
      );
      
      setRejectDialogOpen(false);
      setShowOwnerDetails(false);
      setRejectionNotes("");
      
    } catch (error) {
      console.error('Error rejecting property owner:', error);
      toast({
        title: "Error",
        description: "Failed to reject property owner",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusBadge = (owner: PropertyOwner) => {
    if (owner.is_approved === null) {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    } else if (owner.is_approved) {
      return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
    }
  };

  const renderOwnersList = () => {
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
      <Card key={owner.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{owner.profile.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {owner.business_details.business_name}
              </CardDescription>
            </div>
            {getStatusBadge(owner)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">{owner.profile.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">{owner.profile.phone_number}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t px-6 py-3">
          <div className="w-full flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewDetails(owner)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            {owner.is_approved === null && (
              <>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    setSelectedOwner(owner);
                    setApproveDialogOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    setSelectedOwner(owner);
                    setRejectDialogOpen(true);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Property Owner Applications</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
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
              {owners.filter(o => o.is_approved === null).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="outline" className="ml-2">
              {owners.filter(o => o.is_approved === true).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            <Badge variant="outline" className="ml-2">
              {owners.filter(o => o.is_approved === false).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all">
            All
            <Badge variant="outline" className="ml-2">
              {owners.length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {renderOwnersList()}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {renderOwnersList()}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {renderOwnersList()}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {renderOwnersList()}
        </TabsContent>
      </Tabs>

      {/* Owner Details Dialog */}
      <Dialog open={showOwnerDetails} onOpenChange={setShowOwnerDetails}>
        <DialogContent className="max-w-3xl">
          {selectedOwner && (
            <>
              <DialogHeader>
                <DialogTitle>Property Owner Details</DialogTitle>
                <DialogDescription>
                  Review complete information for this property owner application
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-deep" />
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                      <p>{selectedOwner.profile.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p>{selectedOwner.profile.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p>{selectedOwner.profile.phone_number}</p>
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-primary-deep" />
                    Business Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                      <p>{selectedOwner.business_details.business_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Business Address</p>
                      <p>{selectedOwner.business_details.business_address}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Business Description</p>
                    <p className="whitespace-pre-wrap">{selectedOwner.business_details.business_description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Existing Properties</p>
                    <p>
                      {selectedOwner.business_details.has_existing_properties 
                        ? "Yes" 
                        : "No"}
                    </p>
                    {selectedOwner.business_details.has_existing_properties && 
                     selectedOwner.business_details.existing_properties_details && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-muted-foreground">Property Details</p>
                        <p className="whitespace-pre-wrap text-sm">
                          {selectedOwner.business_details.existing_properties_details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="rounded-md border p-4">
                  <h3 className="font-medium text-lg mb-3 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-primary-deep" />
                    Application Status
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedOwner)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Application Date</p>
                      <p>{format(new Date(selectedOwner.created_at), 'PPP')}</p>
                    </div>
                  </div>
                  
                  {selectedOwner.approval_notes && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-muted-foreground">Notes</p>
                      <p className="whitespace-pre-wrap">{selectedOwner.approval_notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowOwnerDetails(false)}
                >
                  Close
                </Button>
                
                {selectedOwner.is_approved === null && (
                  <>
                    <Button 
                      variant="default"
                      onClick={() => {
                        setApproveDialogOpen(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        setRejectDialogOpen(true);
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Owner Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Property Owner</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this property owner? They will be able to list and manage properties on the platform.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="approvalNotes" className="text-sm font-medium">
                Approval Notes (Optional)
              </label>
              <Textarea
                id="approvalNotes"
                placeholder="Add any notes about this approval..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleApproveOwner}
              disabled={processingAction}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve Owner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Owner Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Property Owner</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this property owner application?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="rejectionNotes" className="text-sm font-medium">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="rejectionNotes"
                placeholder="Please provide a reason for rejection..."
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                className="mt-1"
                required
              />
              {!rejectionNotes && (
                <p className="text-sm text-red-500 mt-1">
                  Please provide a reason for rejection
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectOwner}
              disabled={processingAction || !rejectionNotes}
            >
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Reject Owner
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyOwnerApprovals; 
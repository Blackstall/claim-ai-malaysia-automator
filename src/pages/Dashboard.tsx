
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Check, Clock, X, FileText, MessageSquare, ArrowRight, BarChart3, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { claimsService, Claim } from "@/services/claimsService";

const Dashboard = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const response = await claimsService.getAllClaims();
        setClaims(response.results);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching claims:", error);
        toast({
          title: "Error",
          description: "Failed to fetch claims data. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchClaims();
  }, [toast]);
  
  // Find the selected claim
  const selectedClaim = claims.find(claim => claim.id === selectedClaimId);
  
  // Count claims by status
  const approvedClaims = claims.filter(claim => claim.approval_flag).length;
  const notApprovedClaims = claims.filter(claim => !claim.approval_flag).length;
  
  const getStatusBadge = (isApproved: boolean) => {
    return isApproved 
      ? <Badge className="bg-green-500">Approved</Badge>
      : <Badge variant="destructive">Not Approved</Badge>;
  };
  
  const getStatusIcon = (isApproved: boolean) => {
    return isApproved 
      ? <Check className="h-5 w-5 text-green-500" />
      : <X className="h-5 w-5 text-destructive" />;
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12">Loading claims...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Claims Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage all your insurance claims.
          </p>
        </div>
        
        <Button asChild className="mt-4 md:mt-0 bg-gradient-to-r from-primary to-accent text-white hover:scale-105 transition-transform shadow-lg">
          <Link to="/submit-claim" className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Submit New Claim
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Approved Claims
            </CardTitle>
            <CardDescription>Claims that have been approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{approvedClaims}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Not Approved Claims
            </CardTitle>
            <CardDescription>Claims that were not approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{notApprovedClaims}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          My Claims
        </h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Claims</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="not-approved">Not Approved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {claims.length > 0 ? claims.map((claim) => (
              <Card 
                key={claim.id} 
                className={`cursor-pointer hover:border-primary transition ${
                  selectedClaimId === claim.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedClaimId(claim.id === selectedClaimId ? null : claim.id.toString())}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(claim.approval_flag)} Claim ID: {claim.id}
                      </CardTitle>
                      <CardDescription>
                        {new Date(claim.created_at || '').toLocaleDateString()} • Plate Number: {claim.plate_number}
                      </CardDescription>
                    </div>
                    {getStatusBadge(claim.approval_flag)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="mt-2">Vehicle: {claim.vehicle_make} ({claim.vehicle_age_years} years old)</p>
                    <p className="mt-2">Damage: {claim.claim_description.substring(0, 100)}...</p>
                  </div>
                </CardContent>
                
                {selectedClaimId === claim.id && (
                  <>
                    <div className="px-6 py-2 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Reported to Police</p>
                          <p className="font-medium">{claim.claim_reported_to_police_flag ? "Yes" : "No"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Claim Amount</p>
                          <p className="font-medium">RM {claim.repair_amount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Policy Expired</p>
                          <p className="font-medium">{claim.policy_expired_flag ? "Yes" : "No"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">At Fault</p>
                          <p className="font-medium">{claim.at_fault_flag ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline" size="sm" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" /> 
                        View Details
                      </Button>
                      
                      <Button size="sm" className="text-xs bg-primary" asChild>
                        <Link to={`/chat?claim=${claim.id}`}>
                          <MessageSquare className="h-3 w-3 mr-1" /> 
                          {claim.approval_flag ? "Ask About Claim" : "Ask Why Rejected"}
                        </Link>
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            )) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No claims found. Submit your first claim!</p>
                  <Button asChild className="mt-4">
                    <Link to="/submit-claim">Submit Claim</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            {claims
              .filter(claim => claim.approval_flag)
              .map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>Claim ID: {claim.id}</CardTitle>
                      {getStatusBadge(claim.approval_flag)}
                    </div>
                    <CardDescription>
                      {new Date(claim.created_at || '').toLocaleDateString()} • Plate Number: {claim.plate_number}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Vehicle: {claim.vehicle_make}</p>
                    <p className="mt-2">{claim.claim_description}</p>
                    <p className="mt-2 font-semibold">Approved amount: RM {claim.repair_amount}</p>
                    <div className="mt-4">
                      <Badge variant="outline" className="mb-3 text-green-500 border-green-300 bg-green-50">
                        Claim Approved
                      </Badge>
                      <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-300" asChild>
                        <Link to={`/chat?claim=${claim.id}`} className="flex items-center justify-center">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Ask About This Claim <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          
          <TabsContent value="not-approved" className="space-y-4">
            {claims
              .filter(claim => !claim.approval_flag)
              .map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>Claim ID: {claim.id}</CardTitle>
                      {getStatusBadge(claim.approval_flag)}
                    </div>
                    <CardDescription>
                      {new Date(claim.created_at || '').toLocaleDateString()} • Plate Number: {claim.plate_number}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Vehicle: {claim.vehicle_make}</p>
                    <p className="mt-2">{claim.claim_description}</p>
                    <div className="mt-4">
                      <Badge variant="outline" className="mb-3 text-red-500 border-red-300 bg-red-50">
                        {claim.policy_expired_flag ? "Policy Expired" : claim.at_fault_flag ? "At-Fault Claim" : "Claim Requires Review"}
                      </Badge>
                      <Button size="sm" className="w-full bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-300" asChild>
                        <Link to={`/chat?claim=${claim.id}`} className="flex items-center justify-center">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Ask Why This Was Not Approved <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

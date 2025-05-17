
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
import { 
  Check, 
  X, 
  FileText, 
  MessageSquare, 
  ArrowRight, 
  BarChart3, 
  FileCheck,
  Activity,
  Clock,
  Calendar,
  Car
} from "lucide-react";
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
  
  // Count claims by status
  const approvedClaims = claims.filter(claim => claim.approval_flag).length;
  const notApprovedClaims = claims.filter(claim => !claim.approval_flag).length;
  
  const getStatusBadge = (isApproved: boolean) => {
    return isApproved 
      ? <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 shadow-md shadow-green-100">Approved</Badge>
      : <Badge variant="outline" className="bg-gradient-to-r from-red-400 to-pink-500 border-0 text-white shadow-md shadow-red-100">Not Approved</Badge>;
  };
  
  const getStatusIcon = (isApproved: boolean) => {
    return isApproved 
      ? <div className="p-1.5 rounded-full bg-green-50 border border-green-200">
          <Check className="h-4 w-4 text-green-500" />
        </div>
      : <div className="p-1.5 rounded-full bg-red-50 border border-red-200">
          <X className="h-4 w-4 text-red-500" />
        </div>;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading your claims dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Claims Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your insurance claims in one place
          </p>
        </div>
        
        <Button 
          asChild 
          className="mt-4 md:mt-0 bg-gradient-to-r from-primary to-accent border-none text-white hover:opacity-90 hover:scale-105 transition-all duration-300 shadow-lg shadow-primary/20"
        >
          <Link to="/submit-claim" className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Submit New Claim
          </Link>
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              Approved Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{approvedClaims}</div>
            <Progress className="h-1.5 mt-2" value={(approvedClaims / claims.length) * 100} />
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100">
                <X className="h-4 w-4 text-red-600" />
              </div>
              Not Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{notApprovedClaims}</div>
            <Progress className="h-1.5 mt-2" value={(notApprovedClaims / claims.length) * 100} />
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              Claims Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{((approvedClaims / claims.length) * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground mt-1">Approval Rate</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Claims List */}
      <div className="mt-8 animate-fade-in">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">My Claims</span>
        </h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6 p-1 bg-muted/30 backdrop-blur-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
              All Claims
            </TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Approved
            </TabsTrigger>
            <TabsTrigger value="not-approved" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
              Not Approved
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {claims.length > 0 ? claims.map((claim) => (
              <Card 
                key={claim.id} 
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  selectedClaimId === claim.id 
                    ? 'border-primary/50 shadow-md shadow-primary/10' 
                    : 'border-transparent shadow'
                }`}
                onClick={() => setSelectedClaimId(claim.id === selectedClaimId ? null : claim.id)}
              >
                <div className={`h-1 w-full ${claim.approval_flag ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-pink-500'}`}></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-sm flex items-center gap-2">
                        {getStatusIcon(claim.approval_flag)} 
                        <span className="font-medium">{claim.id}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(claim.created_at || '').toLocaleDateString()} 
                        <span className="mx-1">•</span>
                        <Car className="h-3 w-3 text-muted-foreground" />
                        {claim.plate_number}
                      </CardDescription>
                    </div>
                    {getStatusBadge(claim.approval_flag)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{claim.vehicle_make} ({claim.vehicle_age_years} years old)</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{claim.claim_description}</p>
                  </div>
                </CardContent>
                
                {selectedClaimId === claim.id && (
                  <>
                    <div className="px-6 py-2 border-t border-muted/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-muted/20 p-2 rounded">
                          <p className="text-muted-foreground">Reported to Police</p>
                          <p className="font-medium">{claim.claim_reported_to_police_flag ? "Yes" : "No"}</p>
                        </div>
                        <div className="bg-muted/20 p-2 rounded">
                          <p className="text-muted-foreground">Claim Amount</p>
                          <p className="font-medium text-primary">RM {claim.repair_amount.toLocaleString()}</p>
                        </div>
                        <div className="bg-muted/20 p-2 rounded">
                          <p className="text-muted-foreground">Policy Expired</p>
                          <p className="font-medium">{claim.policy_expired_flag ? "Yes" : "No"}</p>
                        </div>
                        <div className="bg-muted/20 p-2 rounded">
                          <p className="text-muted-foreground">At Fault</p>
                          <p className="font-medium">{claim.at_fault_flag ? "Yes" : "No"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline" size="sm" className="text-xs hover:bg-muted/20 hover:text-foreground">
                        <FileText className="h-3 w-3 mr-1" /> 
                        View Details
                      </Button>
                      
                      <Button 
                        size="sm" 
                        className="text-xs bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white" 
                        asChild
                      >
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
              <Card className="border border-dashed">
                <CardContent className="py-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 rounded-full bg-muted">
                      <FileCheck className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">No claims found. Submit your first claim!</p>
                  <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Link to="/submit-claim" className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Submit Claim
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            {claims
              .filter(claim => claim.approval_flag)
              .map((claim) => (
                <Card 
                  key={claim.id} 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border-transparent shadow"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500"></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getStatusIcon(true)} 
                          <span className="font-medium">{claim.id}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(claim.created_at || '').toLocaleDateString()} 
                          <span className="mx-1">•</span>
                          <Car className="h-3 w-3 text-muted-foreground" />
                          {claim.plate_number}
                        </CardDescription>
                      </div>
                      {getStatusBadge(true)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{claim.vehicle_make}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{claim.claim_description}</p>
                      <p className="text-sm font-semibold text-green-600">Approved amount: RM {claim.repair_amount.toLocaleString()}</p>
                    </div>
                    <div className="mt-4 bg-green-50 rounded-md p-2 border border-green-100 flex items-center justify-between">
                      <Badge variant="outline" className="bg-white border-green-200 text-green-600">
                        Claim Approved
                      </Badge>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white text-xs hover:opacity-90" asChild>
                        <Link to={`/chat?claim=${claim.id}`} className="flex items-center">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Ask About Claim
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
                <Card 
                  key={claim.id} 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg border-transparent shadow"
                >
                  <div className="h-1 w-full bg-gradient-to-r from-red-400 to-pink-500"></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          {getStatusIcon(false)} 
                          <span className="font-medium">{claim.id}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(claim.created_at || '').toLocaleDateString()} 
                          <span className="mx-1">•</span>
                          <Car className="h-3 w-3 text-muted-foreground" />
                          {claim.plate_number}
                        </CardDescription>
                      </div>
                      {getStatusBadge(false)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{claim.vehicle_make}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{claim.claim_description}</p>
                    </div>
                    <div className="mt-4 bg-red-50 rounded-md p-2 border border-red-100 flex items-center justify-between">
                      <Badge variant="outline" className="bg-white border-red-200 text-red-600 truncate max-w-[170px]">
                        {claim.policy_expired_flag ? "Policy Expired" : 
                         claim.at_fault_flag ? "At-Fault Claim" : 
                         "Claim Requires Review"}
                      </Badge>
                      <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white text-xs hover:opacity-90" asChild>
                        <Link to={`/chat?claim=${claim.id}`} className="flex items-center">
                          <MessageSquare className="mr-1 h-3 w-3" />
                          Ask Why Rejected
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

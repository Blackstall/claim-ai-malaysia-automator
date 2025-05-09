
import { useState } from "react";
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
import { Check, Clock, X, FileText, MessageSquare, ArrowRight } from "lucide-react";

// Sample data for demonstration
const mockClaims = [
  { 
    id: "CL-2023-001", 
    date: "2023-12-15", 
    insuranceProvider: "Allianz Malaysia", 
    status: "approved", 
    progress: 100,
    amount: "RM 4,850",
    description: "Front bumper damage from rear-end collision",
    policeReport: "KL-89723-2023"
  },
  { 
    id: "CL-2024-002", 
    date: "2024-01-23", 
    insuranceProvider: "AXA Affin", 
    status: "processing", 
    progress: 70,
    amount: "RM 2,300 (estimated)",
    description: "Side mirror and door damage",
    policeReport: "KL-12489-2024" 
  },
  { 
    id: "CL-2024-003", 
    date: "2024-03-08", 
    insuranceProvider: "Etiqa Insurance", 
    status: "rejected", 
    progress: 100,
    amount: "RM 0",
    description: "Windshield replacement claim",
    policeReport: "PJ-34567-2024"
  },
  { 
    id: "CL-2024-004", 
    date: "2024-04-02", 
    insuranceProvider: "Kurnia Insurance", 
    status: "submitted", 
    progress: 30,
    amount: "RM 1,750 (estimated)",
    description: "Rear light damage from parking accident",
    policeReport: "PJ-45612-2024"
  },
];

const Dashboard = () => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  
  const selectedClaim = mockClaims.find(claim => claim.id === selectedClaimId);
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'submitted':
        return <Badge variant="outline">Submitted</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'rejected':
        return <X className="h-5 w-5 text-destructive" />;
      case 'submitted':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Claims Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage all your insurance claims.
          </p>
        </div>
        
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/submit-claim">
            Submit New Claim
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved Claims</CardTitle>
            <CardDescription>Claims that have been approved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">1</div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
            <CardDescription>Claims being processed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">2</div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rejected Claims</CardTitle>
            <CardDescription>Claims that were rejected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">1</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">My Claims</h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Claims</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {mockClaims.map((claim) => (
              <Card 
                key={claim.id} 
                className={`cursor-pointer hover:border-primary transition ${
                  selectedClaimId === claim.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedClaimId(claim.id === selectedClaimId ? null : claim.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {getStatusIcon(claim.status)} {claim.id}
                      </CardTitle>
                      <CardDescription>
                        Filed on {claim.date} • {claim.insuranceProvider}
                      </CardDescription>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{claim.progress}%</span>
                    </div>
                    <Progress value={claim.progress} className="h-2" />
                    <p className="mt-2">{claim.description}</p>
                  </div>
                </CardContent>
                
                {selectedClaimId === claim.id && (
                  <>
                    <div className="px-6 py-2 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Police Report</p>
                          <p className="font-medium">{claim.policeReport}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Claim Amount</p>
                          <p className="font-medium">{claim.amount}</p>
                        </div>
                      </div>
                    </div>
                    
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Button variant="outline" size="sm" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" /> 
                        View Documents
                      </Button>
                      
                      <Button size="sm" className="text-xs" asChild>
                        <Link to={`/chat?claim=${claim.id}`}>
                          <MessageSquare className="h-3 w-3 mr-1" /> 
                          Ask about this claim
                        </Link>
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            {mockClaims
              .filter(claim => claim.status === 'approved')
              .map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{claim.id}</CardTitle>
                      {getStatusBadge(claim.status)}
                    </div>
                    <CardDescription>
                      Filed on {claim.date} • {claim.insuranceProvider}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{claim.description}</p>
                    <p className="mt-2 font-semibold">Approved amount: {claim.amount}</p>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          
          <TabsContent value="processing" className="space-y-4">
            {mockClaims
              .filter(claim => claim.status === 'processing' || claim.status === 'submitted')
              .map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{claim.id}</CardTitle>
                      {getStatusBadge(claim.status)}
                    </div>
                    <CardDescription>
                      Filed on {claim.date} • {claim.insuranceProvider}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{claim.progress}%</span>
                      </div>
                      <Progress value={claim.progress} className="h-2" />
                      <p className="mt-2">{claim.description}</p>
                      <p className="font-semibold">Estimated amount: {claim.amount}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-4">
            {mockClaims
              .filter(claim => claim.status === 'rejected')
              .map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>{claim.id}</CardTitle>
                      {getStatusBadge(claim.status)}
                    </div>
                    <CardDescription>
                      Filed on {claim.date} • {claim.insuranceProvider}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{claim.description}</p>
                    <Button size="sm" className="mt-4" asChild>
                      <Link to={`/chat?claim=${claim.id}`}>
                        Ask Why This Was Rejected <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
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

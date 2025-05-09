
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(3, { message: "Full name is required" }),
  identificationNumber: z.string().min(6, { message: "Valid ID number required" }),
  contactNumber: z.string().min(8, { message: "Valid contact number required" }),
  email: z.string().email({ message: "Valid email required" }),
  accidentDate: z.string().min(1, { message: "Accident date is required" }),
  accidentLocation: z.string().min(5, { message: "Accident location is required" }),
  policeReportNumber: z.string().min(5, { message: "Police report number is required" }),
  insuranceProvider: z.string().min(1, { message: "Insurance provider is required" }),
  policyNumber: z.string().min(4, { message: "Policy number is required" }),
  claimDescription: z.string().min(20, { message: "Please provide at least 20 characters" }),
});

const SubmitClaim = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policeReportFile, setPoliceReportFile] = useState<File | null>(null);
  const [accidentPhotos, setAccidentPhotos] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      identificationNumber: "",
      contactNumber: "",
      email: "",
      accidentDate: "",
      accidentLocation: "",
      policeReportNumber: "",
      insuranceProvider: "",
      policyNumber: "",
      claimDescription: "",
    },
  });

  const handlePoliceReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPoliceReportFile(e.target.files[0]);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAccidentPhotos(Array.from(e.target.files));
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!policeReportFile) {
      toast({
        title: "Police report required",
        description: "Please upload the police report document",
        variant: "destructive",
      });
      return;
    }

    if (accidentPhotos.length === 0) {
      toast({
        title: "Accident photos required",
        description: "Please upload at least one accident photo",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Form Data:", values);
      console.log("Police Report:", policeReportFile);
      console.log("Accident Photos:", accidentPhotos);
      
      toast({
        title: "Claim submitted successfully",
        description: "Your claim has been received. You can track it in your dashboard.",
      });
      
      setIsSubmitting(false);
      // Reset form
      form.reset();
      setPoliceReportFile(null);
      setAccidentPhotos([]);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Submit a New Claim</h1>
        <p className="text-muted-foreground mb-8">
          Please provide all required information and documentation for your claim.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Enter your personal details for claim identification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name as per ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="identificationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identification Number</FormLabel>
                        <FormControl>
                          <Input placeholder="MyKad/Passport Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accident Details</CardTitle>
                <CardDescription>
                  Information about the accident and police report.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="accidentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accidentLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accident Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address, City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="policeReportNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Police Report Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Report Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Upload Police Report</FormLabel>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handlePoliceReportUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    Accepted formats: PDF, JPG, JPEG, PNG (max 5MB)
                  </p>
                  {policeReportFile && (
                    <p className="text-sm text-green-600">
                      File uploaded: {policeReportFile.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <FormLabel>Accident Photos</FormLabel>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    onChange={handlePhotoUpload}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload multiple accident photos. Accepted formats: JPG, JPEG, PNG (max 5MB each)
                  </p>
                  {accidentPhotos.length > 0 && (
                    <p className="text-sm text-green-600">
                      {accidentPhotos.length} photo(s) uploaded
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Insurance Information</CardTitle>
                <CardDescription>
                  Enter your insurance policy details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="insuranceProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Provider</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select insurance provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="allianz">Allianz Malaysia</SelectItem>
                            <SelectItem value="axa">AXA Affin</SelectItem>
                            <SelectItem value="etiqa">Etiqa Insurance</SelectItem>
                            <SelectItem value="greateastern">Great Eastern</SelectItem>
                            <SelectItem value="kurnia">Kurnia Insurance</SelectItem>
                            <SelectItem value="tokiomarine">Tokio Marine</SelectItem>
                            <SelectItem value="zurich">Zurich Insurance</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="policyNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Policy Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Claim Information</CardTitle>
                <CardDescription>
                  Provide additional details about your claim.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="claimDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide a detailed description of the accident and resulting damages."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="reset" onClick={() => form.reset()}>
                  Reset Form
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SubmitClaim;

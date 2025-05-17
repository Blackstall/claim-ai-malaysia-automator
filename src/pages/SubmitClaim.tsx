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
import { claimsService, Claim } from "@/services/claimsService";
import { useNavigate } from "react-router-dom";

// Helper function to validate data format for common issues
const validateDataFormat = (data: any): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for numeric fields that might be strings
  const numericFields = [
    'age', 'months_as_customer', 'vehicle_age_years', 
    'deductible_amount', 'market_value', 'damage_severity_score',
    'repair_amount', 'time_to_report_days', 'num_third_parties',
    'num_witnesses', 'coverage_amount'
  ];
  
  numericFields.forEach(field => {
    if (data[field] !== undefined && typeof data[field] !== 'number') {
      issues.push(`Field "${field}" should be a number but is ${typeof data[field]}`);
    }
  });
  
  // Check for boolean fields that might not be booleans
  const booleanFields = [
    'policy_expired_flag', 'at_fault_flag', 'claim_reported_to_police_flag',
    'license_type_missing_flag', 'approval_flag'
  ];
  
  booleanFields.forEach(field => {
    if (data[field] !== undefined && typeof data[field] !== 'boolean') {
      issues.push(`Field "${field}" should be a boolean but is ${typeof data[field]}`);
    }
  });
  
  // Check for empty required string fields
  const requiredStringFields = ['ic_number', 'vehicle_make', 'claim_description', 'customer_background'];
  
  requiredStringFields.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      issues.push(`Field "${field}" is required but is empty`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues
  };
};

// Helper function to convert form values to the format expected by the API
const convertFormValuesToApiFormat = (values: z.infer<typeof formSchema>): Claim => {
  // Process boolean values from select fields
  const processedBooleans = {
    policy_expired_flag: typeof values.policy_expired_flag === 'string' 
      ? values.policy_expired_flag === 'true' 
      : Boolean(values.policy_expired_flag),
    at_fault_flag: typeof values.at_fault_flag === 'string' 
      ? values.at_fault_flag === 'true' 
      : Boolean(values.at_fault_flag),
    claim_reported_to_police_flag: typeof values.claim_reported_to_police_flag === 'string'
      ? values.claim_reported_to_police_flag === 'true'
      : Boolean(values.claim_reported_to_police_flag),
    license_type_missing_flag: typeof values.license_type_missing_flag === 'string'
      ? values.license_type_missing_flag === 'true'
      : Boolean(values.license_type_missing_flag),
    approval_flag: typeof values.approval_flag === 'string'
      ? values.approval_flag === 'true'
      : Boolean(values.approval_flag),
  };

  // Ensure numeric values are proper numbers
  const processedNumerics = {
    age: Number(values.age),
    months_as_customer: Number(values.months_as_customer),
    vehicle_age_years: Number(values.vehicle_age_years),
    deductible_amount: Number(values.deductible_amount),
    market_value: Number(values.market_value),
    damage_severity_score: Number(values.damage_severity_score),
    repair_amount: Number(values.repair_amount),
    time_to_report_days: Number(values.time_to_report_days),
    num_third_parties: Number(values.num_third_parties),
    num_witnesses: Number(values.num_witnesses),
    coverage_amount: Number(values.coverage_amount),
  };

  // String fields remain the same
  const processedStrings = {
    ic_number: values.ic_number,
    vehicle_make: values.vehicle_make,
    claim_description: values.claim_description,
    customer_background: values.customer_background,
  };

  // Combine all processed values
  return {
    ...processedStrings,
    ...processedNumerics,
    ...processedBooleans,
  } as Claim;
};

const formSchema = z.object({
  ic_number: z.string().min(6, { message: "Valid IC number required" }),
  age: z.coerce.number().min(18, { message: "Age must be at least 18" }).transform(val => Number(val)),
  months_as_customer: z.coerce.number().min(1, { message: "Months as customer is required" }).transform(val => Number(val)),
  vehicle_age_years: z.coerce.number().min(0, { message: "Vehicle age is required" }).transform(val => Number(val)),
  vehicle_make: z.string().min(1, { message: "Vehicle make is required" }),
  policy_expired_flag: z.union([z.boolean(), z.enum(["true", "false"])]).transform(val => 
    typeof val === 'string' ? val === 'true' : Boolean(val)
  ),
  deductible_amount: z.coerce.number().min(0, { message: "Deductible amount is required" }).transform(val => Number(val)),
  market_value: z.coerce.number().min(0, { message: "Market value is required" }).transform(val => Number(val)),
  damage_severity_score: z.coerce.number().min(1).max(10, { message: "Score must be between 1-10" }).transform(val => Number(val)),
  repair_amount: z.coerce.number().min(0, { message: "Repair amount is required" }).transform(val => Number(val)),
  at_fault_flag: z.union([z.boolean(), z.enum(["true", "false"])]).transform(val => 
    typeof val === 'string' ? val === 'true' : Boolean(val)
  ),
  time_to_report_days: z.coerce.number().min(0, { message: "Time to report is required" }).transform(val => Number(val)),
  claim_reported_to_police_flag: z.union([z.boolean(), z.enum(["true", "false"])]).transform(val => 
    typeof val === 'string' ? val === 'true' : Boolean(val)
  ),
  license_type_missing_flag: z.union([z.boolean(), z.enum(["true", "false"])]).transform(val => 
    typeof val === 'string' ? val === 'true' : Boolean(val)
  ),
  num_third_parties: z.coerce.number().min(0, { message: "Number of third parties is required" }).transform(val => Number(val)),
  num_witnesses: z.coerce.number().min(0, { message: "Number of witnesses is required" }).transform(val => Number(val)),
  approval_flag: z.union([z.boolean(), z.enum(["true", "false"])]).transform(val => 
    typeof val === 'string' ? val === 'true' : Boolean(val)
  ),
  coverage_amount: z.coerce.number().min(0, { message: "Coverage amount is required" }).transform(val => Number(val)),
  claim_description: z.string().min(20, { message: "Please provide at least 20 characters" }),
  customer_background: z.string().min(20, { message: "Please provide at least 20 characters" }),
});

const SubmitClaim = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [policeReportFile, setPoliceReportFile] = useState<File | null>(null);
  const [accidentPhotos, setAccidentPhotos] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ic_number: "",
      age: 18,
      months_as_customer: 0,
      vehicle_age_years: 0,
      vehicle_make: "",
      policy_expired_flag: false,
      deductible_amount: 0,
      market_value: 0,
      damage_severity_score: 5,
      repair_amount: 0,
      at_fault_flag: false,
      time_to_report_days: 0,
      claim_reported_to_police_flag: false,
      license_type_missing_flag: false,
      num_third_parties: 0,
      num_witnesses: 0,
      approval_flag: false,
      coverage_amount: 0,
      claim_description: "",
      customer_background: "",
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
    setIsSubmitting(true);
    
    try {
      // Convert form values to the format expected by the API
      const apiData = convertFormValuesToApiFormat(values);

      // Validate data format before submission
      const validation = validateDataFormat(apiData);
      if (!validation.valid) {
        console.error('Data format validation failed:', validation.issues);
        toast({
          title: "Form Data Error",
          description: `Please fix the following issues: ${validation.issues.join('; ')}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting data to API:', apiData);
      
      // Submit claim to API
      const response = await claimsService.createClaim(apiData);
      
      toast({
        title: "Claim submitted successfully",
        description: "Your claim has been received. You can track it in your dashboard.",
      });
      
      // Reset form
      form.reset();
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Error submitting claim:", error);
      
      // Log detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        
        let errorMessage = "Failed to submit claim. ";
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage += error.response.data;
          } else if (typeof error.response.data === 'object') {
            // Try to extract field errors from Django REST Framework response format
            const fieldErrors = Object.entries(error.response.data)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('; ');
            
            if (fieldErrors) {
              errorMessage += `Validation errors: ${fieldErrors}`;
            }
          }
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        toast({
          title: "Error",
          description: "Failed to submit claim. No response received from server.",
          variant: "destructive",
        });
      } else {
        // Something happened in setting up the request that triggered an Error
      toast({
        title: "Error",
          description: `Failed to submit claim: ${error.message}`,
        variant: "destructive",
      });
      }
    } finally {
      setIsSubmitting(false);
    }
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
                    name="ic_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IC Number</FormLabel>
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
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
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
                    name="months_as_customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Months as Customer</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicle_age_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Age (Years)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="vehicle_make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Make</FormLabel>
                      <FormControl>
                        <Input placeholder="Vehicle Make" {...field} />
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
                    name="policy_expired_flag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Policy Expired</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ? "true" : "false"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select policy status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deductible_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deductible Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="market_value"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Market Value</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="coverage_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coverage Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="damage_severity_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Damage Severity Score (1-10)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="repair_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Repair Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="at_fault_flag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>At Fault</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ? "true" : "false"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Is the claimant at fault?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="time_to_report_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Days to Report</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="claim_reported_to_police_flag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reported to Police</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ? "true" : "false"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Was the incident reported to police?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="license_type_missing_flag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Information Missing</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ? "true" : "false"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Is license information missing?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Yes</SelectItem>
                              <SelectItem value="false">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="num_third_parties"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Third Parties</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="num_witnesses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Witnesses</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="claim_description"
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
                
                <FormField
                  control={form.control}
                  name="customer_background"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Background</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide relevant background information."
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

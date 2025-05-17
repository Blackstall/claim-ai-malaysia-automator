import React, { useState } from "react";
// You may need to install @heroicons/react for the icons below
import { IdentificationIcon, DocumentTextIcon, ShieldCheckIcon, CameraIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

const fileFields = [
  {
    key: "licenseId",
    label: "License and Identity Card",
    icon: <IdentificationIcon className="h-5 w-5 text-blue-500 inline mr-2" />,
    accept: "image/*",
    endpoint: "http://localhost:8000/analyze-documents",
  },
  {
    key: "policeReport",
    label: "Police Report",
    icon: <DocumentTextIcon className="h-5 w-5 text-blue-500 inline mr-2" />,
    accept: "image/*,.pdf",
    endpoint: "http://localhost:8000/analyze-police-report",
  },
  {
    key: "insurancePolicy",
    label: "Insurance Policy",
    icon: <ShieldCheckIcon className="h-5 w-5 text-blue-500 inline mr-2" />,
    accept: "image/*,.pdf",
    endpoint: "http://localhost:8000/analyze-insurance-policy",
  },
  {
    key: "accidentPicture",
    label: "Accident Picture",
    icon: <CameraIcon className="h-5 w-5 text-blue-500 inline mr-2" />,
    accept: "image/*",
    endpoint: "http://localhost:8000/analyze-damage",
  },
  {
    key: "claim",
    label: "Claim",
    icon: <ClipboardDocumentIcon className="h-5 w-5 text-blue-500 inline mr-2" />,
    accept: "image/*,.pdf",
    endpoint: "http://localhost:8000/analyze-claim-report",
  },
];

const SubmitClaim = () => {
  const [files, setFiles] = useState({
    licenseId: null,
    policeReport: null,
    insurancePolicy: null,
    accidentPicture: null,
    claim: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    setFiles({ ...files, [key]: e.target.files ? e.target.files[0] : null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const newResults: Record<string, any> = {};

    for (const field of fileFields) {
      const file = files[field.key as keyof typeof files];
      if (!file) continue;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(field.endpoint, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`Error uploading ${field.label}: ${response.statusText}`);
        }
        const data = await response.json();
        newResults[field.key] = data;
      } catch (err) {
        setError(`Failed to upload ${field.label}: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
        return;
      }
    }

    // Flatten all results into a single object
    let flatResult = {};
    Object.values(newResults).forEach(res => {
      if (res && typeof res === 'object') {
        flatResult = { ...flatResult, ...res };
      }
    });
    const combinedResponse = { ...flatResult, plate_number: "0000" };

    // Convert all values to strings (except objects/arrays)
    Object.keys(combinedResponse).forEach(key => {
      const value = combinedResponse[key];
      if (value !== null && value !== undefined && typeof value !== 'object') {
        combinedResponse[key] = String(value);
      }
    });

    // Convert boolean-like string fields to integers for backend compatibility
    const booleanIntFields = [
      "policy_expired_flag",
      "at_fault_flag",
      "claim_reported_to_police_flag",
      "license_type_missing_flag",
      "approval_flag"
    ];
    booleanIntFields.forEach(key => {
      if (combinedResponse[key] === "true") {
        combinedResponse[key] = 1;
      } else if (combinedResponse[key] === "false") {
        combinedResponse[key] = 0;
      }
    });

    // @ts-ignore
    combinedResponse.vehicle_make = 'Perodua Myvi';

    try {
      const predictResponse = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(combinedResponse),
      });
      if (!predictResponse.ok) {
        throw new Error(`Prediction failed: ${predictResponse.statusText}`);
      }
      const predictResult = await predictResponse.json();
      setResults(predictResult);
      setLoading(false);
      alert("Prediction successful! Result: " + JSON.stringify(predictResult, null, 2));
    } catch (err) {
      setLoading(false);
      setError("Prediction error: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Submit Your Claim Documents</h2>
        <div className="space-y-5">
          {fileFields.map(({ key, label, icon, accept }) => (
            <div key={key} className="flex flex-col">
              <label className="mb-2 font-medium text-gray-700 flex items-center" htmlFor={key}>
                {icon}
                {label}
              </label>
              <input
                id={key}
                type="file"
                accept={accept}
                onChange={e => handleFileChange(e, key)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition duration-150"
              />
              {files[key as keyof typeof files] && (
                <span className="text-xs text-green-600 mt-1">
                  File selected: {(files[key as keyof typeof files] as File).name}
                </span>
              )}
            </div>
          ))}
        </div>
        {error && <div className="mt-4 text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-md transition duration-150"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default SubmitClaim;

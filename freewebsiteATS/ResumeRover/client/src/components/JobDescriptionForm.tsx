
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";

interface JobDescriptionFormProps {
  onAnalyze: (jobTitle: string, jobDescription: string) => void;
  isAnalyzing: boolean;
  disabled: boolean;
}

export function JobDescriptionForm({ onAnalyze, isAnalyzing, disabled }: JobDescriptionFormProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobTitle.trim() && jobDescription.trim()) {
      onAnalyze(jobTitle.trim(), jobDescription.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
          Job Title
        </Label>
        <Input
          id="jobTitle"
          type="text"
          placeholder="e.g., Software Engineer"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="mt-1"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="jobDescription" className="text-sm font-medium text-gray-700">
          Job Description
        </Label>
        <Textarea
          id="jobDescription"
          placeholder="Paste the complete job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={8}
          className="mt-1 resize-none"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={disabled || !jobTitle.trim() || !jobDescription.trim() || isAnalyzing}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Resume...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 mr-2" />
            Analyze Resume Match
          </>
        )}
      </Button>
    </form>
  );
}

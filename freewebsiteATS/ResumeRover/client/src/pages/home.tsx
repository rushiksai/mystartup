
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileText, Target, BarChart3, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { JobDescriptionForm } from "@/components/JobDescriptionForm";
import { AnalysisResults } from "@/components/AnalysisResults";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AnalysisResult {
  atsScore: number;
  keywordScore: number;
  skillsScore: number;
  matchedKeywords: Array<{ keyword: string; count: number }>;
  missingKeywords: Array<{ keyword: string; priority: string }>;
  recommendations: string[];
  skillsAnalysis: Array<{ category: string; score: number }>;
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeResume = useMutation({
    mutationFn: async ({ file, jobTitle, jobDescription }: { file: File; jobTitle: string; jobDescription: string }) => {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobTitle', jobTitle);
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
    },
  });

  const handleAnalyze = (jobTitle: string, jobDescription: string) => {
    if (!selectedFile) return;
    analyzeResume.mutate({ file: selectedFile, jobTitle, jobDescription });
  };

  const renderCircularProgress = (score: number, label: string) => (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#10b981"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{score}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-700">{label}</span>
    </div>
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            ResumeRover
          </h1>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg text-blue-700">
              <BarChart3 className="w-5 h-5 mr-3" />
              <span className="font-medium">Resume Analysis</span>
            </div>
            <div className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
              <FileText className="w-5 h-5 mr-3" />
              <span>My Resumes</span>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {!analysisResult ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis</h2>
              <p className="text-gray-600">Upload your resume and job description to get instant ATS compatibility feedback</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-blue-600" />
                    Upload Resume
                  </CardTitle>
                  <CardDescription>
                    Upload your resume in PDF, DOC, or DOCX format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload 
                    onFileSelect={setSelectedFile} 
                    selectedFile={selectedFile}
                  />
                </CardContent>
              </Card>

              {/* Job Description Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Job Description
                  </CardTitle>
                  <CardDescription>
                    Enter the job details you want to match against
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <JobDescriptionForm
                    onAnalyze={handleAnalyze}
                    isAnalyzing={analyzeResume.isPending}
                    disabled={!selectedFile}
                  />
                </CardContent>
              </Card>
            </div>

            {analyzeResume.isPending && (
              <div className="mt-8 flex justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Resume Analysis Results</h2>
                <p className="text-gray-600">Company - Job Title</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">Track</Button>
                <Button variant="outline">Print</Button>
              </div>
            </div>

            {/* Main Results Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Match Rate */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Match Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    {renderCircularProgress(analysisResult.atsScore, "Overall Match")}
                    
                    <div className="w-full mt-6 space-y-4">
                      <Button className="w-full" variant="default">
                        Upload & rescan
                      </Button>
                      <Button className="w-full" variant="outline">
                        <span className="text-yellow-600 mr-2">⚡</span>
                        Power Edit
                      </Button>
                    </div>

                    {/* Detailed Scores */}
                    <div className="w-full mt-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Searchability</span>
                        <span className="text-sm font-medium">{analysisResult.keywordScore}%</span>
                      </div>
                      <Progress value={analysisResult.keywordScore} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hard Skills</span>
                        <span className="text-sm font-medium">{analysisResult.skillsScore}%</span>
                      </div>
                      <Progress value={analysisResult.skillsScore} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Soft Skills</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Searchability Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Searchability
                      <Badge className="ml-2 bg-blue-100 text-blue-800">IMPORTANT</Badge>
                    </CardTitle>
                    <CardDescription>
                      An ATS (Applicant Tracking System) is a software used by 90% of companies and recruiters to search for resumes and manage the hiring process. Below is how well your resume appears in an ATS and a recruiter search.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Fix the red Xs to ensure your resume is easily searchable by recruiters and parsed correctly by the ATS.
                      </p>
                    </div>

                    {/* ATS Categories */}
                    <div className="space-y-6">
                      {/* ATS Tip */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          ATS Tip
                        </h5>
                        <div className="space-y-3 ml-7">
                          <div className="flex items-start">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-700">Adding this job's company name and web address can help us provide you ATS-specific tips.</p>
                              <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">Update scan information</Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          Contact Information
                        </h5>
                        <div className="space-y-3 ml-7">
                          <div className="flex items-start">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">We did not find an address in your resume. Recruiters use your address to validate your location for job matches.</p>
                          </div>
                          
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">You provided your email. Recruiters use your email to contact you for job matches.</p>
                          </div>
                          
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">You provided your phone number.</p>
                          </div>
                        </div>
                      </div>

                      {/* Summary */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          Summary
                        </h5>
                        <div className="ml-7">
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position.</p>
                          </div>
                        </div>
                      </div>

                      {/* Section Headings */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          Section Headings
                        </h5>
                        <div className="space-y-3 ml-7">
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">We found the education section in your resume.</p>
                          </div>
                          
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">We found the work experience section in your resume.</p>
                          </div>
                          
                          <div className="flex items-start">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">Your Work Experience section appears empty. We recommend that this section should showcase at least one listing, even if it's just an internship or a personal project.</p>
                          </div>
                        </div>
                      </div>

                      {/* Job Title Match */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                          Job Title Match
                        </h5>
                        <div className="ml-7">
                          <div className="flex items-start">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-700">No job title was found in the job description. Please make sure your job description includes a job title.</p>
                              <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">Update scan information</Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Date Formatting */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          Date Formatting
                        </h5>
                        <div className="ml-7">
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">The dates in your work experience section are properly formatted.</p>
                          </div>
                        </div>
                      </div>

                      {/* Education Match */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                          Education Match
                        </h5>
                        <div className="ml-7">
                          <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-700">The job description does not list required or preferred education, and your education information is missing.</p>
                              <Button variant="link" className="p-0 h-auto text-blue-600 text-sm">Update required education level</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-l-4 border-green-400 pl-4">
                      <div className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-sm text-gray-700">We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Headings */}
                <Card>
                  <CardHeader>
                    <CardTitle>Section Headings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-green-400 pl-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-700">We found the education section in your resume.</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-l-4 border-green-400 pl-4">
                        <div className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
                          <div>
                            <p className="text-sm text-gray-700">We found the work experience section in your resume.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Skills Comparison</CardTitle>
                    <CardDescription>
                      <strong>Tip:</strong> Match the skills in your resume to the exact spelling in the job description. Prioritize skills that appear most frequently in the job description.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Skills Comparison Table */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900">Skills Comparison</h4>
                          <Button variant="outline" size="sm" className="text-xs">
                            📋 Copy All
                          </Button>
                        </div>
                        
                        <div className="bg-white border rounded-lg overflow-hidden">
                          <div className="grid grid-cols-3 bg-gray-50 border-b text-sm font-medium text-gray-700">
                            <div className="p-3">Skill</div>
                            <div className="p-3 text-center">Resume</div>
                            <div className="p-3 text-center">Job Description</div>
                          </div>
                          
                          {/* Sample skills data - in real app this would come from analysis */}
                          {[
                            { skill: "computer vision", resume: 3, job: 2 },
                            { skill: "linux operating systems", resume: 1, job: 1 },
                            { skill: "Software Development", resume: 1, job: 1 },
                            { skill: "Computer Science", resume: 0, job: 1, missing: true },
                            { skill: "image processing", resume: 3, job: 1 },
                            { skill: "vision software", resume: 1, job: 1 },
                            { skill: "experiments", resume: 1, job: 1 },
                            { skill: "github", resume: 5, job: 1 },
                            { skill: "Python", resume: 7, job: 1 }
                          ].map((item, index) => (
                            <div key={index} className="grid grid-cols-3 border-b last:border-b-0 text-sm">
                              <div className="p-3 text-gray-700">{item.skill}</div>
                              <div className="p-3 text-center">
                                {item.missing ? (
                                  <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                                ) : (
                                  <span className="text-gray-900">{item.resume}</span>
                                )}
                              </div>
                              <div className="p-3 text-center text-gray-900">{item.job}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Highlighted Skills */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Highlighted Skills</h4>
                        <div className="bg-gray-100 rounded-lg p-6 text-center">
                          <div className="text-gray-500 mb-2">📝</div>
                          <p className="text-sm text-gray-600">
                            Skills that appear frequently in the job description will be highlighted here
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Soft Skills */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Soft Skills
                      <Badge className="ml-2 bg-orange-100 text-orange-800">MEDIUM SCORE IMPACT</Badge>
                    </CardTitle>
                    <CardDescription>
                      Soft skills are your traits and abilities that are not unique to any job. Your soft skills are part of your personality, and can be learned also. These skills are the traits that typically make you a good employee for any company such as time management and communication. Soft skills have a medium impact on your match score.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>Tip:</strong> Prioritize hard skills in your resume to get interviews, and then showcase your soft skills in the interview to get job offers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Skills Comparison */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Skills Comparison</h4>
                        <div className="bg-white border rounded-lg">
                          <div className="p-4 border-b bg-red-50">
                            <div className="flex items-center">
                              <XCircle className="w-5 h-5 text-red-500 mr-3" />
                              <span className="text-sm font-medium text-red-700">No matching soft skills</span>
                            </div>
                            <p className="text-xs text-red-600 mt-1">
                              We did not find any matching soft skills in your resume that's included in the job description. We recommend that you update your resume and rescan.
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <span>Don't see skills from the job description?</span>
                            <Button variant="link" className="p-0 ml-2 h-auto text-blue-600 text-sm">
                              + Add Skill
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Highlighted Skills */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">Highlighted Skills</h4>
                        <div className="bg-gray-100 rounded-lg p-6 text-center">
                          <div className="text-gray-500 mb-2">📝</div>
                          <p className="text-sm text-gray-600">
                            Soft skills that appear frequently in the job description will be highlighted here
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recruiter Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Recruiter tips
                      <Badge className="ml-2 bg-purple-100 text-purple-800">IMPORTANT</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="w-4 h-4 bg-blue-600 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Job Level Match</h5>
                          <p className="text-sm text-gray-600">No specific years of experience were found in this job description. Focus on matching your skills and qualifications to the role's requirements. Consider how your experience, regardless of duration, aligns with the job's key responsibilities before applying.</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Measurable Results</h5>
                          <p className="text-sm text-gray-600">We found 0 mentions of measurable results in your resume. Consider adding at least 3 specific achievements or impact you had in your job (e.g. time saved, increase in sales, etc).</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-4 h-4 bg-red-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Resume Tone</h5>
                          <p className="text-sm text-gray-600">The tone of your resume is generally positive and not common clichés and buzzwords were found. Good job!</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-4 h-4 bg-green-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Web Presence</h5>
                          <p className="text-sm text-gray-600">Nice - You've linked to a website that builds your web credibility. Recruiters appreciate the convenience and credibility associated with a professional website.</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-4 h-4 bg-green-500 rounded-full mt-1 mr-4 flex-shrink-0"></div>
                        <div>
                          <h5 className="font-medium text-gray-900 mb-1">Word Count</h5>
                          <p className="text-sm text-gray-600">There are 506 words in your resume, which is under the suggested 1000 word count for relevance and ease of reading reasons.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Formatting */}
                <Card>
                  <CardHeader>
                    <CardTitle>Formatting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Layout */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Layout</h5>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">We found that your resume has appropriate white space. Good job!</p>
                          </div>
                          
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">We found that your resume has appropriate margins. Good job!</p>
                          </div>
                          
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">We found that your resume uses proper text alignment. Good job!</p>
                          </div>
                          
                          <div className="flex items-start">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">Your resume may be formatted in columns. Consider using a single-column layout for better ATS compatibility.</p>
                          </div>
                        </div>
                      </div>

                      {/* Font Check */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Font Check</h5>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">Your resume appears to use a non-standard font. Consider using common fonts like Arial, Helvetica, or Times New Roman for better ATS readability.</p>
                          </div>
                          
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">Your font size appears to be appropriate (10-12 point). Good job!</p>
                          </div>
                          
                          <div className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <p className="text-sm text-gray-700">Your resume has good contrast between text and background. Good job!</p>
                          </div>
                        </div>
                      </div>

                      
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <Button 
                onClick={() => setAnalysisResult(null)}
                variant="outline"
                size="lg"
              >
                Analyze Another Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

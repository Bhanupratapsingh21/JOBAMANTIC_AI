"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/ui/file-upload";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { database } from "@/lib/appwrite";
import { ID } from "appwrite";
import axios from "axios";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";


interface StructuredFeedback {
  overallScore: number;
  ats: string;
  toneAndStyle: string;
  content: string;
  structure: string;
  skills: string;
}

const loadingStates = [
  { text: "Initializing ATS scanner..." },
  { text: "Uploading your resume..." },
  { text: "Extracting text content..." },
  { text: "Analyzing ATS compatibility..." },
  { text: "Checking keyword optimization..." },
  { text: "Evaluating content structure..." },
  { text: "Assessing skills alignment..." },
  { text: "Generating detailed feedback..." },
  { text: "Finalizing your report..." },
];

interface AnalysisResponse {
  success: boolean;
  cloudinaryUrl: string;
  imageUrl: string;
  feedback: StructuredFeedback;
  jobTitle: string;
  textLength: number;
  message: string;
}

export default function UploadPage() {
  const { user } = useUserStore();
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // Progress simulation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          return prev + (100 - prev) * 0.1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loading]);

  // Step simulation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev + 1) % loadingStates.length);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setCurrentStep(0);
    }
  }, [loading]);

  const handleUpload = async () => {
    if (!file || !user) {
      toast.error("Please select a PDF file and ensure you're logged in");
      return;
    }

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    if (!jobTitle.trim() || !jobDescription.trim()) {
      toast.error("Job title and description are required");
      return;
    }

    setLoading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobTitle", jobTitle.trim());
      formData.append("jobDescription", jobDescription.trim());
      formData.append("companyName", companyName.trim());

      setProgress(30);
      const { data } = await axios.post<AnalysisResponse>("/api/analyzeResume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(30 + percentCompleted * 0.3); // 30-60% for upload
          }
        },
      });

      setProgress(70);

      if (!data.success) {
        throw new Error(data.message || "Analysis failed");
      }

      const { cloudinaryUrl, imageUrl, feedback, textLength } = data;

      // ✅ STEP 1: Save Resume document first
      setProgress(80);
      const resumeDoc = await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_RESUME_COLLECTION_ID!,
        ID.unique(),
        {
          userId: user.id,
          companyName: companyName.trim() || "Not specified",
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          resumePath: cloudinaryUrl,
          imagePath: imageUrl,
        }
      );

      // ✅ STEP 2: Save Feedback document
      setProgress(90);
      const feedbackdoc = await database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_FEEDBACK_COLLECTION_ID!,
        ID.unique(),
        {
          resumeId: resumeDoc.$id,
          overallScore: feedback.overallScore,
          ats: feedback.ats.substring(0, 1000),
          toneAndStyle: feedback.toneAndStyle.substring(0, 1000),
          content: feedback.content.substring(0, 1000),
          structure: feedback.structure.substring(0, 1000),
          skills: feedback.skills.substring(0, 1000),
          userId: user.id,
        }
      );

      setProgress(100);

      // Success toast with score
      toast.success(
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Analysis Complete!</span>
            <Badge variant={feedback.overallScore >= 70 ? "default" : feedback.overallScore >= 50 ? "secondary" : "destructive"}>
              Score: {feedback.overallScore}/100
            </Badge>
          </div>
        </div>,
        { duration: 3000 }
      );

      // Wait a moment for user to see success message, then redirect
      setTimeout(() => {
        router.push(`/dashboard/result/${feedbackdoc.$id}`);
      }, 2000);

    } catch (err: any) {
      console.error("Upload error:", err);
      setProgress(0);

      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else if (err.code === 'ECONNABORTED') {
        toast.error("Request timeout - please try again with a smaller file");
      } else if (err.message?.includes("structure")) {
        toast.error("Database structure error. Please check your AppWrite collection schema.");
      } else {
        toast.error(err.message || "Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleUpload();
  };

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        toast.success(`Selected: ${selectedFile.name}`);
      } else {
        toast.error("Please select a PDF file");
      }
    } else {
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">

      {/* Enhanced Loading Overlay */}
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={loading}
        duration={2000}
        currentState={currentStep}
      />

      <main className="flex flex-col items-center justify-center px-4 py-8 md:py-16 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-gray-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-600">AI-Powered Resume Analysis</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Smart Resume Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get detailed ATS compatibility feedback and optimize your resume for your dream job
          </p>
        </div>

        {/* Main Form Card */}
        <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
              Analyze Your Resume
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Upload your resume and job details for comprehensive ATS analysis
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Company Input */}
              <div className="space-y-3">
                <Label htmlFor="company" className="text-base font-semibold">
                  Company Name <span className="text-gray-400 text-sm">(Optional)</span>
                </Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g., Google, Microsoft, Amazon"
                  className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Job Title Input */}
              <div className="space-y-3">
                <Label htmlFor="jobTitle" className="text-base font-semibold">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="jobTitle"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Developer, Product Manager"
                  className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              {/* Job Description Input */}
              <div className="space-y-3">
                <Label htmlFor="jobDescription" className="text-base font-semibold">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the complete job description here to get personalized feedback..."
                  rows={6}
                  className="text-base border-2 border-gray-200 focus:border-blue-500 transition-colors resize-vertical min-h-[120px]"
                  required
                />
              </div>

              {/* File Upload Section */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Upload Resume <span className="text-red-500">*</span>
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-blue-400">
                  <FileUpload
                    accept=".pdf,application/pdf"
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024}
                    onChange={handleFileChange}
                  />
                </div>
                {file && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-800">{file.name}</p>
                      <p className="text-sm text-green-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {loading && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Processing your resume...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-center text-gray-500 animate-pulse">
                    {loadingStates[currentStep]?.text || "Processing..."}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || !file || !jobTitle.trim() || !jobDescription.trim()}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing Resume...</span>
                  </div>
                ) : (
                  "🚀 Start Analysis"
                )}
              </Button>

              {/* Help Text */}
              {!loading && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-500">
                    📊 Get detailed ATS score and improvement suggestions
                  </p>
                  <p className="text-xs text-gray-400">
                    Analysis typically takes 30-60 seconds
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">ATS Compatibility</h3>
              <p className="text-sm text-gray-600">Check how well your resume passes through applicant tracking systems</p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Keyword Optimization</h3>
              <p className="text-sm text-gray-600">Identify missing keywords and skills from the job description</p>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/60 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-xl">📈</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Actionable Feedback</h3>
              <p className="text-sm text-gray-600">Get specific recommendations to improve your resume</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
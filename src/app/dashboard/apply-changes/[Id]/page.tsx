"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { database } from "@/lib/appwrite";
import { ID, Query } from "appwrite";
import { useUserStore } from "@/store/userStore";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resumeService } from "@/lib/resumeService";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  TrendingUp,
  MessageSquare,
  Layout,
  Code,
  Download,
  Eye,
  Sparkles,
  RefreshCw
} from "lucide-react";

interface Feedback {
  $id: string;
  resumeId: string;
  overallScore: number;
  ats: string;
  toneAndStyle: string;
  content: string;
  structure: string;
  skills: string;
  userId: string;
  $createdAt: string;
  $updatedAt: string;
}

interface Resume {
  $id: string;
  userId: string;
  companyName: string;
  jobTitle: string;
  imagePath: string;
  resumePath: string;
  jobDescription: string;
  resumetext: string;
  $createdAt: string;
  $updatedAt: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  education: Array<{
    id: number;
    institution: string;
    location: string;
    degree: string;
    minor?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  experience: Array<{
    id: number;
    company: string;
    location: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  projects: Array<{
    id: number;
    name: string;
    technologies: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    libraries: string[];
  };
  template: string;
}

export default function ApplyChangesPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useUserStore();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);
  const [previewMode, setPreviewMode] = useState<'changes' | 'new-resume'>('changes');

  const id = params.Id as string;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/Signin");
        return;
      }
      fetchData();
    }
  }, [id, user, loading]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(id)
      const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID! || "";
      const RESUMES_COLLECTION_ID = process.env.NEXT_PUBLIC_RESUME_COLLECTION_ID! || "";
      const FEEDBACK_COLLECTION_ID = process.env.NEXT_PUBLIC_FEEDBACK_COLLECTION_ID! || "";

      // Try to find feedback first
      const feedbackResponse = await database.listDocuments(
        DATABASE_ID,
        FEEDBACK_COLLECTION_ID,
        [Query.equal("resumeId", id)]
      );

      if (feedbackResponse.documents.length > 0) {
        const feedbackDoc = feedbackResponse.documents[0];
        const typedFeedback: Feedback = {
          $id: feedbackDoc.$id,
          resumeId: feedbackDoc.resumeId,
          overallScore: Number(feedbackDoc.overallScore),
          ats: feedbackDoc.ats,
          toneAndStyle: feedbackDoc.toneAndStyle,
          content: feedbackDoc.content,
          structure: feedbackDoc.structure,
          skills: feedbackDoc.skills,
          userId: feedbackDoc.userId,
          $createdAt: feedbackDoc.$createdAt,
          $updatedAt: feedbackDoc.$updatedAt
        };
        setFeedback(typedFeedback);

        // Get the resume
        const resumeData = await database.getDocument(
          DATABASE_ID,
          RESUMES_COLLECTION_ID,
          id
        );

        const typedResume: Resume = {
          $id: resumeData.$id,
          userId: resumeData.userId,
          companyName: resumeData.companyName,
          jobTitle: resumeData.jobTitle,
          imagePath: resumeData.imagePath,
          resumePath: resumeData.resumePath,
          jobDescription: resumeData.jobDescription,
          resumetext: resumeData.resumetext,
          $createdAt: resumeData.$createdAt,
          $updatedAt: resumeData.$updatedAt
        };
        setResume(typedResume);
      } else {
        // If no feedback found, try to get resume directly
        const resumeData = await database.getDocument(
          DATABASE_ID,
          RESUMES_COLLECTION_ID,
          id
        );

        const typedResume: Resume = {
          $id: resumeData.$id,
          userId: resumeData.userId,
          companyName: resumeData.companyName,
          jobTitle: resumeData.jobTitle,
          imagePath: resumeData.imagePath,
          resumePath: resumeData.resumePath,
          jobDescription: resumeData.jobDescription,
          resumetext: resumeData.resumetext,
          $createdAt: resumeData.$createdAt,
          $updatedAt: resumeData.$updatedAt
        };
        setResume(typedResume);

        // Look for feedback by resumeId
        const feedbackResponse = await database.listDocuments(
          DATABASE_ID,
          FEEDBACK_COLLECTION_ID,
          [Query.equal("resumeId", id)]
        );

        if (feedbackResponse.documents.length > 0) {
          const feedbackDoc = feedbackResponse.documents[0];
          const typedFeedback: Feedback = {
            $id: feedbackDoc.$id,
            resumeId: feedbackDoc.resumeId,
            overallScore: Number(feedbackDoc.overallScore),
            ats: feedbackDoc.ats,
            toneAndStyle: feedbackDoc.toneAndStyle,
            content: feedbackDoc.content,
            structure: feedbackDoc.structure,
            skills: feedbackDoc.skills,
            userId: feedbackDoc.userId,
            $createdAt: feedbackDoc.$createdAt,
            $updatedAt: feedbackDoc.$updatedAt
          };
          setFeedback(typedFeedback);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateResume = async () => {
    if (!resume || !feedback) {
      setError("Missing resume or feedback data");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setSuccess(null);

      // Call the API to generate improved resume
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: resume.resumetext,
          feedback: {
            overallScore: feedback.overallScore,
            ats: feedback.ats,
            toneAndStyle: feedback.toneAndStyle,
            content: feedback.content,
            structure: feedback.structure,
            skills: feedback.skills
          },
          jobTitle: resume.jobTitle,
          companyName: resume.companyName,
          jobDescription: resume.jobDescription
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate resume");
      }

      setGeneratedResume(data.resumeData);
      setPreviewMode('new-resume');
      setSuccess("Improved resume generated successfully!");

    } catch (err: any) {
      console.error("Error generating resume:", err);
      setError(err.message || "Failed to generate improved resume");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveResume = async () => {
    if (!generatedResume || !user) {
      setError("No generated resume to save");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // Save the generated resume using resumeService
      const savedResume = await resumeService.saveResume(
        user.id,
        generatedResume,
        `${resume?.jobTitle} - Improved Resume`,
        false
      );

      setSuccess("Resume saved successfully! Redirecting to editor...");

      // Redirect to the resume editor
      setTimeout(() => {
        router.push(`/resume/builder/${savedResume.$id}`);
      }, 1500);

    } catch (err: any) {
      console.error("Error saving resume:", err);
      setError("Failed to save resume: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderMarkdownContent = (text: string) => {
    const hasMarkdown = /(\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`|\[.*?\]\(.*?\)|^- |^#+ )/m.test(text);

    if (hasMarkdown) {
      return (
        <div className="prose prose-sm max-w-none text-gray-600">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {text}
          </ReactMarkdown>
        </div>
      );
    } else {
      return (
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {text}
        </p>
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      ats: TrendingUp,
      toneAndStyle: MessageSquare,
      content: FileText,
      structure: Layout,
      skills: Code
    };
    return icons[category as keyof typeof icons] || FileText;
  };

  const getCategoryTitle = (category: string) => {
    const titles: { [key: string]: string } = {
      ats: "ATS Compatibility",
      toneAndStyle: "Tone & Style",
      content: "Content Quality",
      structure: "Structure",
      skills: "Skills Analysis"
    };
    return titles[category] || category;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (error && !isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
            <button
              onClick={fetchData}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Resume Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the resume data.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const feedbackCategories = feedback ? [
    { key: 'ats', content: feedback.ats },
    { key: 'toneAndStyle', content: feedback.toneAndStyle },
    { key: 'content', content: feedback.content },
    { key: 'structure', content: feedback.structure },
    { key: 'skills', content: feedback.skills }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-gray-800">Apply All Changes</h1>
            <p className="text-sm text-gray-500">Generate improved resume based on feedback</p>
          </div>
        </motion.div>

        {/* Success/Error Messages */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Feedback Analysis */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Analysis Feedback</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewMode('changes')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${previewMode === 'changes' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    View Feedback
                  </button>
                  <button
                    onClick={() => setPreviewMode('new-resume')}
                    disabled={!generatedResume}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${previewMode === 'new-resume' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${!generatedResume ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Preview Resume
                  </button>
                </div>
              </div>

              {previewMode === 'changes' ? (
                <div className="space-y-6">
                  {feedback ? (
                    <>
                      {feedbackCategories.map((category, index) => {
                        const IconComponent = getCategoryIcon(category.key);
                        return (
                          <motion.div
                            key={category.key}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className="border-l-4 border-blue-500 pl-4"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <IconComponent className="w-5 h-5 text-blue-600" />
                              </div>
                              <h3 className="font-semibold text-gray-800">
                                {getCategoryTitle(category.key)}
                              </h3>
                            </div>
                            <div className="text-gray-600 leading-relaxed">
                              {renderMarkdownContent(category.content)}
                            </div>
                          </motion.div>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No feedback analysis available for this resume.</p>
                      <p className="text-sm text-gray-500 mt-2">You can still generate an improved resume.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedResume ? (
                    <>
                      {/* Preview of Generated Resume */}
                      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-800 mb-3">Preview - Improved Resume</h3>

                        {/* Personal Info */}
                        <div className="mb-4">
                          <h4 className="text-lg font-bold text-gray-900">{generatedResume.personalInfo.fullName}</h4>
                          <p className="text-gray-600">{generatedResume.personalInfo.headline}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            <span>{generatedResume.personalInfo.email}</span>
                            <span>•</span>
                            <span>{generatedResume.personalInfo.phone}</span>
                            <span>•</span>
                            <span>{generatedResume.personalInfo.location}</span>
                          </div>
                        </div>

                        {/* Summary */}
                        {generatedResume.summary && (
                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-800 mb-2">Professional Summary</h5>
                            <p className="text-gray-600 text-sm">{generatedResume.summary}</p>
                          </div>
                        )}

                        {/* Experience Preview */}
                        {generatedResume.experience.length > 0 && (
                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-800 mb-2">Experience</h5>
                            <div className="space-y-3">
                              {generatedResume.experience.slice(0, 2).map((exp, idx) => (
                                <div key={idx}>
                                  <div className="flex justify-between">
                                    <span className="font-medium text-gray-800">{exp.position}</span>
                                    <span className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{exp.company}, {exp.location}</p>
                                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
                                    {exp.description.slice(0, 2).map((desc, i) => (
                                      <li key={i}>{desc}</li>
                                    ))}
                                    {exp.description.length > 2 && (
                                      <li className="text-gray-400">+{exp.description.length - 2} more bullet points</li>
                                    )}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills Preview */}
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-2">Skills</h5>
                          <div className="flex flex-wrap gap-2">
                            {generatedResume.skills.languages.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {generatedResume.skills.languages.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{generatedResume.skills.languages.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Generate an improved resume to see preview</p>
                      <p className="text-sm text-gray-500 mt-2">Click "Generate Improved Resume" button</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-4 mt-6"
            >
              {!generatedResume ? (
                <button
                  onClick={handleGenerateResume}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold text-center flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Improved Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Improved Resume
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveResume}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold text-center flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving Resume...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Save to Resume Builder
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setGeneratedResume(null)}
                    className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-center"
                  >
                    Generate Different Version
                  </button>
                </>
              )}

              <button
                onClick={() => router.push(`/dashboard/results/${id}`)}
                className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-center"
              >
                Back to Results
              </button>
            </motion.div>
          </div>

          {/* Right Column - Job Info & Original Resume */}
          <div className="space-y-6">
            {/* Job Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Job Application Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Position</p>
                  <p className="font-medium text-gray-800">{resume.jobTitle}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Company</p>
                  <p className="font-medium text-gray-800">{resume.companyName}</p>
                </div>

                {resume.jobDescription && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Job Description</p>
                    <div className="max-h-60 overflow-y-auto p-3 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm whitespace-pre-line">
                        {resume.jobDescription.length > 500
                          ? resume.jobDescription.substring(0, 500) + '...'
                          : resume.jobDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Original Resume Text Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Original Resume Text
              </h3>

              <div className="max-h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                <pre className="text-gray-600 text-sm whitespace-pre-wrap font-sans">
                  {resume.resumetext.length > 1000
                    ? resume.resumetext.substring(0, 1000) + '...'
                    : resume.resumetext}
                </pre>
              </div>

              <div className="mt-4 text-xs text-gray-500 flex justify-between">
                <span>{resume.resumetext.length} characters</span>
                <span>{resume.resumetext.split(/\s+/).length} words</span>
              </div>
            </motion.div>

            {/* AI Insights */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6"
              >
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Insights
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Overall Score</span>
                      <span className={`text-lg font-bold ${feedback.overallScore >= 80 ? 'text-green-600' :
                        feedback.overallScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                        {feedback.overallScore}/100
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${feedback.overallScore >= 80 ? 'bg-green-500' :
                          feedback.overallScore >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                        style={{ width: `${feedback.overallScore}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Based on the analysis, your resume will be improved with:
                  </p>

                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Better ATS optimization and keyword matching</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Improved structure and readability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Stronger achievement-focused bullet points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Tailored content for the target position</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
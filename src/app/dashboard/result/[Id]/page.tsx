"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { database } from "@/lib/appwrite";
import { Query } from "appwrite";
import { useUserStore } from "@/store/userStore";
import { motion } from "framer-motion";
import { 
  Star, 
  TrendingUp, 
  FileText, 
  Layout, 
  Code, 
  MessageSquare,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Download,
  Eye
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
  $createdAt: string;
  $updatedAt: string;
}

interface AppwriteDocument {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  [key: string]: any;
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useUserStore();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

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
      setPdfError(null);

        const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID! || "";
            const RESUMES_COLLECTION_ID = process.env.NEXT_PUBLIC_RESUME_COLLECTION_ID! || "";
            const FEEDBACK_COLLECTION_ID = process.env.NEXT_PUBLIC_FEEDBACK_COLLECTION_ID! || "";

      // First, try to get feedback by ID
      try {
        const feedbackData = await database.getDocument(
          DATABASE_ID,
          FEEDBACK_COLLECTION_ID,
          id
        );
        
        const typedFeedback: Feedback = {
          $id: feedbackData.$id,
          resumeId: feedbackData.resumeId,
          overallScore: Number(feedbackData.overallScore),
          ats: feedbackData.ats,
          toneAndStyle: feedbackData.toneAndStyle,
          content: feedbackData.content,
          structure: feedbackData.structure,
          skills: feedbackData.skills,
          userId: feedbackData.userId,
          $createdAt: feedbackData.$createdAt,
          $updatedAt: feedbackData.$updatedAt
        };
        setFeedback(typedFeedback);

        // Then get the resume using resumeId from feedback
        if (typedFeedback.resumeId) {
          const resumeData = await database.getDocument(
            DATABASE_ID,
            RESUMES_COLLECTION_ID,
            typedFeedback.resumeId
          );
          
          const typedResume: Resume = {
            $id: resumeData.$id,
            userId: resumeData.userId,
            companyName: resumeData.companyName,
            jobTitle: resumeData.jobTitle,
            imagePath: resumeData.imagePath,
            resumePath: resumeData.resumePath,
            jobDescription: resumeData.jobDescription,
            $createdAt: resumeData.$createdAt,
            $updatedAt: resumeData.$updatedAt
          };
          setResume(typedResume);
          handlePdfUrl(typedResume.resumePath);
        }
      } catch (feedbackError) {
        // If feedback not found by ID, try to find by resumeId
        console.log("Not found as feedback ID, trying as resume ID...");
        
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
          $createdAt: resumeData.$createdAt,
          $updatedAt: resumeData.$updatedAt
        };
        setResume(typedResume);
        handlePdfUrl(typedResume.resumePath);

        // Then find feedback by resumeId
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
      setError("Failed to load results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfUrl = (resumePath: string) => {
    try {
      // Clean up the Cloudinary URL and ensure it's accessible
      let cleanUrl = resumePath;
      
      // If it's a Cloudinary URL, you might need to transform it
      if (resumePath.includes('cloudinary')) {
        // Remove any existing transformations and get the base URL
        const baseUrl = resumePath.split('/upload/')[0] + '/upload/';
        const publicId = resumePath.split('/upload/')[1];
        
        // Create a secure URL with proper format
        cleanUrl = `${baseUrl}fl_attachment/${publicId}`;
        
        // Alternative: Use the original URL but ensure it's accessible
        // cleanUrl = resumePath.replace('/upload/', '/upload/fl_attachment/');
      }
      
      setPdfUrl(cleanUrl);
    } catch (err) {
      console.error("Error processing PDF URL:", err);
      setPdfError("Could not load PDF preview");
    }
  };

  const handleDownloadPdf = () => {
    if (resume?.imagePath) {
      const link = document.createElement('a');
      link.href = resume?.imagePath || "";
      link.download = `resume_${resume?.jobTitle || 'document'}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewPdf = () => {
    if (resume?.imagePath) {
      window.open(resume.imagePath, '_blank');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "ring-green-200";
    if (score >= 60) return "ring-yellow-200";
    return "ring-red-200";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { text: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 60) return { text: "Good", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { text: "Needs Work", color: "text-red-600", bg: "bg-red-50" };
  };

  const formatFeedbackText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*:/g, '').trim();
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      ats: TrendingUp,
      toneAndStyle: MessageSquare,
      content: FileText,
      structure: Layout,
      skills: Code
    };
    return icons[category as keyof typeof icons] || Lightbulb;
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
          <p className="text-gray-600">Analyzing your resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (!feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Results Not Found</h1>
          <p className="text-gray-600 mb-6">We couldn't find the analysis results for this resume.</p>
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

  const scoreStatus = getScoreStatus(feedback.overallScore);
  const feedbackCategories = [
    { key: 'ats', content: feedback.ats },
    { key: 'toneAndStyle', content: feedback.toneAndStyle },
    { key: 'content', content: feedback.content },
    { key: 'structure', content: feedback.structure },
    { key: 'skills', content: feedback.skills }
  ];

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
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-500">Analyzed on</p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(feedback.$createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Score & PDF Preview */}
          <div className="space-y-6">
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Overall Score</h2>
              
              <div className="relative inline-block mb-4">
                <div className={`relative w-40 h-40 rounded-full ring-8 ${getScoreRingColor(feedback.overallScore)} bg-white`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                        {feedback.overallScore}
                      </div>
                      <div className="text-gray-500 text-sm">out of 100</div>
                    </div>
                  </div>
                  <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(feedback.overallScore / 100) * 283} 283`}
                      className={getScoreColor(feedback.overallScore)}
                    />
                  </svg>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${scoreStatus.bg} ${scoreStatus.color} font-semibold`}>
                <CheckCircle className="w-4 h-4" />
                {scoreStatus.text}
              </div>

              <div className="mt-4 text-sm text-gray-600">
                {feedback.overallScore >= 80 && "Your resume is well-optimized and ready for applications!"}
                {feedback.overallScore >= 60 && feedback.overallScore < 80 && "Good foundation with room for improvement."}
                {feedback.overallScore < 60 && "Significant improvements needed for better results."}
              </div>
            </motion.div>

            {/* PDF Preview */}
            {resume && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    Your Resume
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleViewPdf}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={handleDownloadPdf}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {pdfError ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
                    <p className="text-gray-600">Unable to load PDF preview</p>
                    <p className="text-sm text-gray-500 mt-1">You can still download the file</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="aspect-[3/4] bg-gray-50 rounded-lg flex items-center justify-center">
                      {resume.imagePath ? (
                        <img
                          src={resume.imagePath}
                          alt="IMG Preview N/A"
                          className="w-full h-full rounded-lg"
                          title="Resume Preview"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-2" />
                          <p>Loading PDF preview...</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Job Info */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Job Application Details</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Position:</span> {resume.jobTitle}</p>
                    <p><span className="text-gray-600">Company:</span> {resume.companyName}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Detailed Feedback */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">Detailed Analysis</h2>
              
              <div className="space-y-6">
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
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {formatFeedbackText(category.content)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mt-6"
            >
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold text-center"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push("/dashboard/upload")}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold text-center"
              >
                Analyze Another Resume
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
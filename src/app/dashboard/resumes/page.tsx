"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/userStore"
import { resumeService, type SavedResume } from "@/lib/resumeService"
import { database } from "@/lib/appwrite"
import { Query } from "appwrite"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileText,
  Eye,
  Download,
  Edit,
  Trash2,
  Calendar,
  Share2,
  Copy,
  Loader2,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Shield,
  Zap,
  TrendingUp,
  Users
} from "lucide-react"
import Link from "next/link"

interface ATSResume {
  $id: string
  userId: string
  companyName: string
  jobTitle: string
  imagePath: string
  resumePath: string
  jobDescription: string
  $createdAt: string
  $updatedAt: string
  feedback?: {
    $id: string
    resumeId: string
    overallScore: number
    ats: string
    toneAndStyle: string
    content: string
    structure: string
    skills: string
    userId: string
    $createdAt: string
    $updatedAt: string
  }
}

export default function CombinedResumesPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [atsResumes, setAtsResumes] = useState<ATSResume[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (user) {
      loadAllResumes()
    } else {
      router.push("/auth/Signin")
    }
  }, [user, router])

  const loadAllResumes = async () => {
    try {
      setLoading(true)

      // Load saved resumes
      const userResumes = await resumeService.getUserResumes(user!.id)
      setSavedResumes(userResumes)

      // Load ATS scanned resumes
      await loadAtsResumes()
    } catch (error) {
      console.error("Error loading resumes:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadAtsResumes = async () => {
    if (!user) return

    try {
      const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
      const RESUMES_COLLECTION_ID = process.env.NEXT_PUBLIC_RESUME_COLLECTION_ID!
      const FEEDBACK_COLLECTION_ID = process.env.NEXT_PUBLIC_FEEDBACK_COLLECTION_ID!

      const resumesResponse = await database.listDocuments(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        [Query.equal("userId", user.id), Query.orderDesc("$createdAt")]
      )

      const resumesData = resumesResponse.documents as unknown as ATSResume[]

      const resumesWithFeedback = await Promise.all(
        resumesData.map(async (resume) => {
          try {
            const feedbackResponse = await database.listDocuments(
              DATABASE_ID,
              FEEDBACK_COLLECTION_ID,
              [Query.equal("resumeId", resume.$id)]
            )

            const feedback = feedbackResponse.documents.length > 0
              ? (feedbackResponse.documents[0] as any)
              : undefined

            return { ...resume, feedback }
          } catch (error) {
            return { ...resume, feedback: undefined }
          }
        })
      )

      const atsScannedResumes = resumesWithFeedback.filter(resume => resume.feedback)
      setAtsResumes(atsScannedResumes)
    } catch (error) {
      console.error("Error loading ATS resumes:", error)
    }
  }

  const handleToggleVisibility = async (resumeId: string, currentStatus: boolean) => {
    try {
      setUpdating(resumeId)
      const updatedResume = await resumeService.toggleResumeVisibility(resumeId, !currentStatus)
      setSavedResumes(savedResumes.map(r => r.$id === resumeId ? updatedResume : r))
    } catch (error) {
      console.error("Error updating resume visibility:", error)
      alert("Failed to update resume visibility")
    } finally {
      setUpdating(null)
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await resumeService.deleteResume(resumeId)
        setSavedResumes(savedResumes.filter(r => r.$id !== resumeId))
        setAtsResumes(atsResumes.filter(r => r.$id !== resumeId))
      } catch (error) {
        console.error("Error deleting resume:", error)
        alert("Failed to delete resume")
      }
    }
  }

  const copyShareableLink = (shareableUrl: string) => {
    const link = `${window.location.origin}/resume/${shareableUrl}`
    navigator.clipboard.writeText(link)
    alert("Shareable link copied to clipboard!")
  }

  const handleResumeClick = (resume: ATSResume) => {
    if (resume.feedback) {
      router.push(`/dashboard/result/${resume.feedback.$id}`)
    }
  }

  const getStatusConfig = (score: number) => {
    if (score >= 80) {
      return {
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircle,
        label: "Excellent"
      }
    } else if (score >= 60) {
      return {
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        icon: CheckCircle,
        label: "Optimized"
      }
    } else {
      return {
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        icon: AlertCircle,
        label: "Needs Work"
      }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200"
    return "text-amber-600 bg-amber-50 border-amber-200"
  }

  // Calculate stats
  const totalResumes = savedResumes.length
  const totalATSResumes = atsResumes.length
  const publicResumes = savedResumes.filter(r => r.isPublic).length
  const averageScore = totalATSResumes > 0
    ? Math.round(atsResumes.reduce((acc, curr) => acc + (curr.feedback?.overallScore || 0), 0) / totalATSResumes)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <Link href="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-600">Manage and track all your resumes in one place</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/dashboard/upload")}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Smart Resume Analyzer.
            </Button>
            <Button
              onClick={() => router.push("/resume/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Resume
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalResumes}</div>
              <div className="text-sm text-gray-600">Total Resumes</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{publicResumes}</div>
              <div className="text-sm text-gray-600">Public</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{totalATSResumes}</div>
              <div className="text-sm text-gray-600">ATS Scanned</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{averageScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              All Resumes ({totalResumes})
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Saved Resumes
            </TabsTrigger>
            <TabsTrigger value="ats" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              ATS Scanned ({totalATSResumes})
            </TabsTrigger>
          </TabsList>

          {/* All Resumes Tab */}
          <TabsContent value="all" className="space-y-6">
            {/* Saved Resumes Section */}
            {savedResumes.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Resumes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedResumes.map((resume) => (
                    <ResumeCard
                      key={resume.$id}
                      resume={resume}
                      onToggleVisibility={handleToggleVisibility}
                      onDelete={handleDeleteResume}
                      onCopyLink={copyShareableLink}
                      updating={updating}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ATS Resumes Section */}
            {atsResumes.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">ATS Scanned Resumes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {atsResumes.map((resume) => (
                    <ATSResumeCard
                      key={resume.$id}
                      resume={resume}
                      onClick={handleResumeClick}
                      getStatusConfig={getStatusConfig}
                      getScoreColor={getScoreColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {savedResumes.length === 0 && atsResumes.length === 0 && (
              <EmptyState onCreateResume={() => router.push("/resume/create")} />
            )}
          </TabsContent>

          {/* Saved Resumes Tab */}
          <TabsContent value="saved">
            {savedResumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedResumes.map((resume) => (
                  <ResumeCard
                    key={resume.$id}
                    resume={resume}
                    onToggleVisibility={handleToggleVisibility}
                    onDelete={handleDeleteResume}
                    onCopyLink={copyShareableLink}
                    updating={updating}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onCreateResume={() => router.push("/resume/create")} />
            )}
          </TabsContent>

          {/* ATS Resumes Tab */}
          <TabsContent value="ats">
            {atsResumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {atsResumes.map((resume) => (
                  <ATSResumeCard
                    key={resume.$id}
                    resume={resume}
                    onClick={handleResumeClick}
                    getStatusConfig={getStatusConfig}
                    getScoreColor={getScoreColor}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No ATS Scans Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Scan your resume to get ATS optimization recommendations and improve your job application success rate.
                </p>
                <Button
                  onClick={() => router.push("/dashboard/upload")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Scan Your First Resume
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Resume Card Component
function ResumeCard({
  resume,
  onToggleVisibility,
  onDelete,
  onCopyLink,
  updating
}: {
  resume: SavedResume
  onToggleVisibility: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  onCopyLink: (url: string) => void
  updating: string | null
}) {
  const router = useRouter()

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 text-gray-900">{resume.title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {new Date(resume.$createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize shrink-0 bg-blue-50 text-blue-700 border-blue-200">
            {resume.template}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium text-gray-900">{resume.resumeData.personalInfo.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Headline:</span>
            <span className="font-medium text-gray-900 line-clamp-1">{resume.resumeData.personalInfo.headline}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Experience:</span>
            <span className="font-medium text-gray-900">{resume.resumeData.experience.length} positions</span>
          </div>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-gray-700">Public Sharing</label>
            <p className="text-xs text-gray-500">
              {resume.isPublic ? "Anyone with link can view" : "Only you can view"}
            </p>
          </div>
          <Switch
            checked={resume.isPublic}
            onCheckedChange={() => onToggleVisibility(resume.$id, resume.isPublic)}
            disabled={updating === resume.$id}
          />
        </div>

        {/* Shareable Link */}
        {resume.isPublic && resume.shareableUrl && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700 font-medium">Shareable Link</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopyLink(resume.shareableUrl!)}
                className="h-8 w-8 p-0 hover:bg-blue-100"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t border-gray-100">
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/resume/${resume.shareableUrl}`)}
          disabled={!resume.isPublic}
        >
          <Eye className="w-4 h-4 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/resume/create?edit=${resume.$id}`)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(resume.$id)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}

// ATS Resume Card Component
function ATSResumeCard({
  resume,
  onClick,
  getStatusConfig,
  getScoreColor
}: {
  resume: ATSResume
  onClick: (resume: ATSResume) => void
  getStatusConfig: (score: number) => any
  getScoreColor: (score: number) => string
}) {
  const score = resume.feedback?.overallScore || 0
  const statusConfig = getStatusConfig(score)
  const StatusIcon = statusConfig.icon

  return (
    <Card
      className="group cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      onClick={() => onClick(resume)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{resume.jobTitle}</CardTitle>
                {new Date(resume.$createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                  <Badge variant="default" className="bg-green-500 text-white border-0 text-xs">
                    New
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">{resume.companyName}</div>
            </div>
          </div>

          {/* ATS Score Badge */}
          <Badge
            variant="outline"
            className={`${getScoreColor(score)} font-semibold border`}
          >
            {score}%
          </Badge>
        </div>

        {/* Status */}
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
          <StatusIcon className="w-4 h-4" />
          {statusConfig.label}
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        {/* Scan Date */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Scanned on</span>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-4 h-4" />
            {new Date(resume.$createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* Job Description Preview */}
        <div className="text-sm">
          <div className="text-gray-600 mb-1">Job Description</div>
          <div className="text-gray-900 line-clamp-2">
            {resume.jobDescription || "No description provided"}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>ATS Compatibility</span>
            <span>{score}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' :
                  score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t border-gray-100">
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onClick(resume)
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Report
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

// Empty State Component
function EmptyState({ onCreateResume }: { onCreateResume: () => void }) {
  return (
    <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">No resumes yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Create your first resume to get started with your job search journey.
      </p>
      <Button
        onClick={onCreateResume}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Create Your First Resume
      </Button>
    </div>
  )
}
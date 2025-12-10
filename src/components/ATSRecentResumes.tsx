"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/userStore"
import { database } from "@/lib/appwrite"
import { Query } from "appwrite"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    FileText,
    CheckCircle,
    AlertCircle,
    Clock,
    Download,
    Eye,
    BarChart3,
    Shield,
    Zap,
    TrendingUp,
    Users,
    Loader2
} from "lucide-react"

interface Resume {
    $id: string
    userId: string
    companyName: string
    jobTitle: string
    imagePath: string
    resumePath: string
    jobDescription: string
    $createdAt: string
    $updatedAt: string
}

interface Feedback {
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

interface ResumeWithFeedback extends Resume {
    feedback?: Feedback
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

export function ATSRecentResumes() {
    const router = useRouter()
    const { user } = useUserStore()
    const [resumes, setResumes] = useState<ResumeWithFeedback[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            fetchUserResumes()
        }
    }, [user])

    const fetchUserResumes = async () => {
        if (!user) return

        try {
            setLoading(true)
            setError(null)

            const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
            const RESUMES_COLLECTION_ID = process.env.NEXT_PUBLIC_RESUME_COLLECTION_ID!
            const FEEDBACK_COLLECTION_ID = process.env.NEXT_PUBLIC_FEEDBACK_COLLECTION_ID!

            // Fetch resumes for the current user
            const resumesResponse = await database.listDocuments(
                DATABASE_ID,
                RESUMES_COLLECTION_ID,
                [Query.equal("userId", user.id), Query.orderDesc("$createdAt")]
            )

            const resumesData = resumesResponse.documents as unknown as Resume[]

            // Fetch feedback for each resume
            const resumesWithFeedback = await Promise.all(
                resumesData.map(async (resume) => {
                    try {
                        const feedbackResponse = await database.listDocuments(
                            DATABASE_ID,
                            FEEDBACK_COLLECTION_ID,
                            [Query.equal("resumeId", resume.$id)]
                        )

                        const feedback = feedbackResponse.documents.length > 0
                            ? (feedbackResponse.documents[0] as unknown as Feedback)
                            : undefined

                        return { ...resume, feedback }
                    } catch (error) {
                        console.error(`Error fetching feedback for resume ${resume.$id}:`, error)
                        return { ...resume, feedback: undefined }
                    }
                })
            )

            // Filter only resumes that have feedback (ATS scanned)
            const atsScannedResumes = resumesWithFeedback.filter(resume => resume.feedback)

            setResumes(atsScannedResumes)
        } catch (err) {
            console.error("Error fetching resumes:", err)
            setError("Failed to load your ATS scanned resumes. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleResumeClick = (resume: ResumeWithFeedback) => {
        if (resume.feedback) {
            router.push(`/dashboard/result/${resume.feedback.$id}`)
        }
    }

    const handleNewScan = () => {
        router.push("/dashboard/upload")
    }

    // Calculate overall stats
    const totalScans = resumes.length
    const averageScore = totalScans > 0
        ? Math.round(resumes.reduce((acc, curr) => acc + (curr.feedback?.overallScore || 0), 0) / totalScans)
        : 0
    const excellentResumes = resumes.filter(r => (r.feedback?.overallScore || 0) >= 80).length

    if (!user) {
        return (
            <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Sign In Required</h3>
                <p className="text-gray-600 mb-8">
                    Please sign in to view your ATS scanned resumes.
                </p>
                <Button
                    onClick={() => router.push("/auth/Signin")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Sign In
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                        <Shield className="w-4 h-4" />
                        ATS Scanner Results
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Recent <span className="text-blue-600">ATS Scanned Resumes</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl">
                        Track your resume performance with our ATS scanner. Optimize your resumes for better job application success.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="flex gap-4">
                    <div className="text-center p-4 bg-white rounded-2xl border border-gray-200 min-w-32">
                        <div className="text-2xl font-bold text-gray-900">{totalScans}</div>
                        <div className="text-sm text-gray-600">Total Scans</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-2xl border border-gray-200 min-w-32">
                        <div className="text-2xl font-bold text-gray-900">{averageScore}%</div>
                        <div className="text-sm text-gray-600">Avg Score</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-2xl border border-gray-200 min-w-32">
                        <div className="text-2xl font-bold text-gray-900">{excellentResumes}</div>
                        <div className="text-sm text-gray-600">Excellent</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to optimize your resume?</h3>
                        <p className="text-gray-600">Scan your resume with our ATS analyzer to improve your job application success rate.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={handleNewScan}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        >
                            <Zap className="w-4 h-4 mr-2" />
                            New ATS Scan
                        </Button>
                        <Button variant="outline" onClick={fetchUserResumes}>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-16">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your ATS scanned resumes...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-red-200">
                    <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Oops! Something went wrong</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
                    <Button
                        onClick={fetchUserResumes}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Try Again
                    </Button>
                </div>
            )}

            {/* Resumes Grid */}
            {!loading && !error && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {resumes.map((resume) => {
                            const score = resume.feedback?.overallScore || 0
                            const statusConfig = getStatusConfig(score)
                            const StatusIcon = statusConfig.icon

                            return (
                                <Card
                                    key={resume.$id}
                                    className="group cursor-pointer bg-white/80 backdrop-blur-sm border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                    onClick={() => handleResumeClick(resume)}
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
                                                    handleResumeClick(resume)
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
                        })}
                    </div>

                    {/* Empty State */}
                    {resumes.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <BarChart3 className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No ATS Scans Yet</h3>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Start by scanning your first resume to get ATS optimization recommendations.
                            </p>
                            <Button
                                onClick={handleNewScan}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                Scan Your First Resume
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Bottom CTA */}
            {!loading && resumes.length > 0 && (
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-3">Improve Your Resume Success Rate</h3>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        Our ATS scanner analyzes your resume against 50+ applicant tracking systems to ensure maximum compatibility.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            variant="secondary"
                            onClick={handleNewScan}
                            className="bg-white text-blue-600 hover:bg-gray-100"
                        >
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Scan New Resume
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-white hover:bg-white/10"
                        >
                            <Users className="w-5 h-5 mr-2" />
                            Learn About ATS
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
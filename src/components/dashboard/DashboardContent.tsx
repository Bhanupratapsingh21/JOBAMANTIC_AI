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
    CheckCircle,
    AlertCircle,
    Clock,
    BarChart3,
    Shield,
    Zap,
    TrendingUp,
    Users,
    Sparkles,
    Target,
    Award,
    Briefcase,
    Code
} from "lucide-react"

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

interface DashboardStats {
    totalResumes: number
    publicResumes: number
    atsScanned: number
    averageScore: number
    totalExperience: number
    uniqueSkills: number
    excellentResumes: number
    needsImprovement: number
}

export default function DashboardPage() {
    const router = useRouter()
    const { user } = useUserStore()
    const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
    const [atsResumes, setAtsResumes] = useState<ATSResume[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")
    const [stats, setStats] = useState<DashboardStats>({
        totalResumes: 0,
        publicResumes: 0,
        atsScanned: 0,
        averageScore: 0,
        totalExperience: 0,
        uniqueSkills: 0,
        excellentResumes: 0,
        needsImprovement: 0
    })

    useEffect(() => {
        if (user) {
            loadDashboardData()
        } else {
            router.push("/auth/Signin")
        }
    }, [user, router])

    const loadDashboardData = async () => {
        try {
            setLoading(true)

            // Load both saved resumes and ATS resumes in parallel
            const [userResumes, atsScannedResumes] = await Promise.all([
                resumeService.getUserResumes(user!.id),
                loadAtsResumes()
            ])

            setSavedResumes(userResumes)
            setAtsResumes(atsScannedResumes)

            // Calculate stats with both datasets
            calculateStats(userResumes, atsScannedResumes)
        } catch (error) {
            console.error("Error loading dashboard data:", error)
        } finally {
            setLoading(false)
        }
    }

    const loadAtsResumes = async (): Promise<ATSResume[]> => {
        if (!user) return []

        try {
            const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
            const RESUMES_COLLECTION_ID = process.env.NEXT_PUBLIC_RESUME_COLLECTION_ID!
            const FEEDBACK_COLLECTION_ID = process.env.NEXT_PUBLIC_FEEDBACK_COLLECTION_ID!

            console.log("Loading ATS resumes for user:", user.id)

            // First, get all resumes for the user
            const resumesResponse = await database.listDocuments(
                DATABASE_ID,
                RESUMES_COLLECTION_ID,
                [Query.equal("userId", user.id), Query.orderDesc("$createdAt")]
            )

            console.log("Raw resumes response:", resumesResponse.documents.length)

            const resumesData = resumesResponse.documents as unknown as ATSResume[]

            // Then, get feedback for each resume
            const resumesWithFeedback = await Promise.all(
                resumesData.map(async (resume) => {
                    try {
                        const feedbackResponse = await database.listDocuments(
                            DATABASE_ID,
                            FEEDBACK_COLLECTION_ID,
                            [Query.equal("resumeId", resume.$id)]
                        )

                        console.log(`Feedback for resume ${resume.$id}:`, feedbackResponse.documents.length)

                        const feedback = feedbackResponse.documents.length > 0
                            ? {
                                $id: feedbackResponse.documents[0].$id,
                                resumeId: feedbackResponse.documents[0].resumeId,
                                overallScore: feedbackResponse.documents[0].overallScore || 0,
                                ats: feedbackResponse.documents[0].ats || "",
                                toneAndStyle: feedbackResponse.documents[0].toneAndStyle || "",
                                content: feedbackResponse.documents[0].content || "",
                                structure: feedbackResponse.documents[0].structure || "",
                                skills: feedbackResponse.documents[0].skills || "",
                                userId: feedbackResponse.documents[0].userId,
                                $createdAt: feedbackResponse.documents[0].$createdAt,
                                $updatedAt: feedbackResponse.documents[0].$updatedAt
                            }
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

            console.log("ATS scanned resumes found:", atsScannedResumes.length)
            console.log("ATS resumes data:", atsScannedResumes)

            return atsScannedResumes
        } catch (error) {
            console.error("Error loading ATS resumes:", error)
            return []
        }
    }

    const calculateStats = (saved: SavedResume[], ats: ATSResume[]) => {
        console.log("Calculating stats with:", { saved: saved.length, ats: ats.length })

        const totalResumes = saved.length
        const publicResumes = saved.filter(r => r.isPublic).length
        const atsScanned = ats.length

        // Calculate average score only from resumes that have feedback with scores
        const scores = ats
            .map(r => r.feedback?.overallScore)
            .filter(score => typeof score === 'number' && score > 0) as number[]

        const averageScore = scores.length > 0
            ? Math.round(scores.reduce((acc, curr) => acc + curr, 0) / scores.length)
            : 0

        const totalExperience = saved.reduce((acc, curr) => acc + curr.resumeData.experience.length, 0)
        const uniqueSkills = new Set(saved.flatMap(r => r.resumeData.skills.languages)).size

        const excellentResumes = ats.filter(r => (r.feedback?.overallScore || 0) >= 80).length
        const needsImprovement = ats.filter(r => (r.feedback?.overallScore || 0) < 60 && (r.feedback?.overallScore || 0) > 0).length

        console.log("Calculated stats:", {
            totalResumes,
            publicResumes,
            atsScanned,
            averageScore,
            totalExperience,
            uniqueSkills,
            excellentResumes,
            needsImprovement
        })

        setStats({
            totalResumes,
            publicResumes,
            atsScanned,
            averageScore,
            totalExperience,
            uniqueSkills,
            excellentResumes,
            needsImprovement
        })
    }

    const handleToggleVisibility = async (resumeId: string, currentStatus: boolean) => {
        try {
            const updatedResume = await resumeService.toggleResumeVisibility(resumeId, !currentStatus)
            setSavedResumes(savedResumes.map(r => r.$id === resumeId ? updatedResume : r))
            loadDashboardData() // Refresh stats
        } catch (error) {
            console.error("Error updating resume visibility:", error)
            alert("Failed to update resume visibility")
        }
    }

    const handleDeleteResume = async (resumeId: string) => {
        if (confirm("Are you sure you want to delete this resume?")) {
            try {
                await resumeService.deleteResume(resumeId)
                setSavedResumes(savedResumes.filter(r => r.$id !== resumeId))
                setAtsResumes(atsResumes.filter(r => r.$id !== resumeId))
                loadDashboardData() // Refresh stats
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

    const recentResumes = [...savedResumes].sort((a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    ).slice(0, 6)

    const recentATSResumes = [...atsResumes].sort((a, b) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    ).slice(0, 6)

    console.log("Rendering with data:", {
        savedResumes: savedResumes.length,
        atsResumes: atsResumes.length,
        recentResumes: recentResumes.length,
        recentATSResumes: recentATSResumes.length,
        stats
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your dashboard...</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, {user?.name || "there"}! 👋
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Here's your resume dashboard and performance overview
                        </p>
                    </div>
                    <div className="flex gap-3 flex-wrap">
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

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={FileText}
                        title="Total Resumes"
                        value={stats.totalResumes}
                        description="Created resumes"
                        color="blue"
                    />
                    <StatCard
                        icon={Shield}
                        title="ATS Scanned"
                        value={stats.atsScanned}
                        description="Optimized resumes"
                        color="green"
                    />
                    <StatCard
                        icon={Target}
                        title="Avg Score"
                        value={stats.averageScore > 0 ? `${stats.averageScore}%` : "N/A"}
                        description="ATS compatibility"
                        color="purple"
                    />
                    <StatCard
                        icon={Award}
                        title="Excellent"
                        value={stats.excellentResumes}
                        description="High scoring resumes"
                        color="amber"
                    />
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="resumes" className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            My Resumes ({stats.totalResumes})
                        </TabsTrigger>
                        <TabsTrigger value="ats" className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            ATS Scans ({stats.atsScanned})
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Resumes */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            Recent Resumes
                                        </CardTitle>
                                        <CardDescription>Your most recently created resumes</CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveTab("resumes")}
                                    >
                                        View All
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recentResumes.length > 0 ? (
                                        recentResumes.map((resume) => (
                                            <RecentItem
                                                key={resume.$id}
                                                title={resume.title}
                                                description={resume.resumeData.personalInfo.headline}
                                                date={resume.$createdAt}
                                                badge={resume.template}
                                                onView={() => router.push(`/resume/${resume.shareableUrl}`)}
                                                onEdit={() => router.push(`/resume/create?edit=${resume.$id}`)}
                                                isPublic={resume.isPublic}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No resumes yet</p>
                                            <Button
                                                variant="link"
                                                onClick={() => router.push("/resume/create")}
                                                className="mt-2"
                                            >
                                                Create your first resume
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recent ATS Scans */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-green-600" />
                                            Recent ATS Scans
                                        </CardTitle>
                                        <CardDescription>Your most recent resume analyses</CardDescription>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setActiveTab("ats")}
                                    >
                                        View All
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {recentATSResumes.length > 0 ? (
                                        recentATSResumes.map((resume) => (
                                            <ATSRecentItem
                                                key={resume.$id}
                                                resume={resume}
                                                getStatusConfig={getStatusConfig}
                                                onClick={handleResumeClick}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No ATS scans yet</p>
                                            <Button
                                                variant="link"
                                                onClick={() => router.push("/dashboard/upload")}
                                                className="mt-2"
                                            >
                                                Scan your first resume
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-600" />
                                    Quick Actions
                                </CardTitle>
                                <CardDescription>Get started with these quick actions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <QuickAction
                                        icon={Plus}
                                        title="Create Resume"
                                        description="Build a new resume from scratch"
                                        onClick={() => router.push("/resume/create")}
                                        color="blue"
                                    />
                                    <QuickAction
                                        icon={BarChart3}
                                        title="ATS Scan"
                                        description="Analyze resume compatibility"
                                        onClick={() => router.push("/dashboard/upload")}
                                        color="green"
                                    />
                                    <QuickAction
                                        icon={Users}
                                        title="View Templates"
                                        description="Browse professional templates"
                                        onClick={() => router.push("/dashboard/templates")}
                                        color="purple"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Resumes Tab */}
                    <TabsContent value="resumes">
                        {savedResumes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedResumes.map((resume) => (
                                    <ResumeCard
                                        key={resume.$id}
                                        resume={resume}
                                        onToggleVisibility={handleToggleVisibility}
                                        onDelete={handleDeleteResume}
                                        onCopyLink={copyShareableLink}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={FileText}
                                title="No Resumes Yet"
                                description="Create your first resume to get started with your job search journey."
                                buttonText="Create Resume"
                                onAction={() => router.push("/resume/create")}
                            />
                        )}
                    </TabsContent>

                    {/* ATS Scans Tab */}
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
                            <EmptyState
                                icon={BarChart3}
                                title="No ATS Scans Yet"
                                description="Scan your resume to get ATS optimization recommendations and improve your job application success rate."
                                buttonText="Scan Resume"
                                onAction={() => router.push("/dashboard/upload")}
                            />
                        )}
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                        Performance Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <MetricItem
                                        icon={Briefcase}
                                        label="Total Experience Entries"
                                        value={stats.totalExperience}
                                    />
                                    <MetricItem
                                        icon={Code}
                                        label="Unique Skills"
                                        value={stats.uniqueSkills}
                                    />
                                    <MetricItem
                                        icon={Share2}
                                        label="Public Resumes"
                                        value={stats.publicResumes}
                                    />
                                    <MetricItem
                                        icon={AlertCircle}
                                        label="Need Improvement"
                                        value={stats.needsImprovement}
                                        color="amber"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-600" />
                                        Improvement Tips
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <TipItem
                                        title="Improve ATS Score"
                                        description="Add more relevant keywords and optimize formatting"
                                        action="Scan Resume"
                                        onAction={() => router.push("/dashboard/upload")}
                                    />
                                    <TipItem
                                        title="Create More Resumes"
                                        description="Tailor resumes for different job applications"
                                        action="Create Resume"
                                        onAction={() => router.push("/resume/create")}
                                    />
                                    <TipItem
                                        title="Share Your Resume"
                                        description="Make resumes public to share with employers"
                                        action="View Resumes"
                                        onAction={() => setActiveTab("resumes")}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

// Component: Stat Card
function StatCard({ icon: Icon, title, value, description, color }: {
    icon: any,
    title: string,
    value: string | number,
    description: string,
    color: "blue" | "green" | "purple" | "amber"
}) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
        amber: "bg-amber-50 text-amber-600 border-amber-200"
    }

    return (
        <Card className={`border-0 ${colorClasses[color]} backdrop-blur-sm`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-80">{title}</p>
                        <p className="text-2xl font-bold mt-1">{value}</p>
                        <p className="text-xs opacity-70 mt-1">{description}</p>
                    </div>
                    <div className={`p-3 rounded-full ${colorClasses[color]} bg-white/50`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Component: Recent Item
function RecentItem({ title, description, date, badge, onView, onEdit, isPublic }: {
    title: string
    description: string
    date: string
    badge: string
    onView: () => void
    onEdit: () => void
    isPublic: boolean
}) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{title}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                        {badge}
                    </Badge>
                    {isPublic && (
                        <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">
                            Public
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-gray-600 truncate">{description}</p>
                <p className="text-xs text-gray-500 mt-1">
                    {new Date(date).toLocaleDateString()}
                </p>
            </div>
            <div className="flex gap-1 ml-2">
                <Button size="sm" variant="ghost" onClick={onView} disabled={!isPublic}>
                    <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

// Component: ATS Recent Item
function ATSRecentItem({ resume, getStatusConfig, onClick }: {
    resume: ATSResume
    getStatusConfig: (score: number) => any
    onClick: (resume: ATSResume) => void
}) {
    const score = resume.feedback?.overallScore || 0
    const statusConfig = getStatusConfig(score)
    const StatusIcon = statusConfig.icon

    return (
        <div
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => onClick(resume)}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">{resume.jobTitle}</p>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}`}>
                        {score}%
                    </div>
                </div>
                <p className="text-xs text-gray-600 truncate">{resume.companyName}</p>
                <div className="flex items-center gap-2 mt-1">
                    <StatusIcon className="w-3 h-3" />
                    <p className="text-xs text-gray-500">{statusConfig.label}</p>
                </div>
            </div>
            <Button size="sm" variant="ghost">
                <Eye className="w-4 h-4" />
            </Button>
        </div>
    )
}

// Component: Quick Action
function QuickAction({ icon: Icon, title, description, onClick, color }: {
    icon: any
    title: string
    description: string
    onClick: () => void
    color: "blue" | "green" | "purple"
}) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
        green: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100",
        purple: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
    }

    return (
        <Button
            variant="outline"
            className={`h-auto p-4 flex flex-col items-center justify-center text-center border-2 ${colorClasses[color]} transition-all hover:scale-105`}
            onClick={onClick}
        >
            <Icon className="w-8 h-8 mb-2" />
            <span className="font-semibold">{title}</span>
            <span className="text-sm opacity-70 mt-1">{description}</span>
        </Button>
    )
}

// Component: Resume Card
function ResumeCard({ resume, onToggleVisibility, onDelete, onCopyLink }: {
    resume: SavedResume
    onToggleVisibility: (id: string, current: boolean) => void
    onDelete: (id: string) => void
    onCopyLink: (url: string) => void
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

// Component: ATS Resume Card
function ATSResumeCard({ resume, onClick, getStatusConfig, getScoreColor }: {
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

// Component: Metric Item
function MetricItem({ icon: Icon, label, value, color = "blue" }: {
    icon: any
    label: string
    value: number
    color?: "blue" | "green" | "amber"
}) {
    const colorClasses = {
        blue: "text-blue-600 bg-blue-50",
        green: "text-green-600 bg-green-50",
        amber: "text-amber-600 bg-amber-50"
    }

    return (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">{label}</span>
            </div>
            <span className="font-bold text-lg">{value}</span>
        </div>
    )
}

// Component: Tip Item
function TipItem({ title, description, action, onAction }: {
    title: string
    description: string
    action: string
    onAction: () => void
}) {
    return (
        <div className="flex items-start justify-between p-3 border rounded-lg">
            <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{title}</h4>
                <p className="text-xs text-gray-600">{description}</p>
            </div>
            <Button size="sm" variant="outline" onClick={onAction}>
                {action}
            </Button>
        </div>
    )
}

// Component: Empty State
function EmptyState({ icon: Icon, title, description, buttonText, onAction }: {
    icon: any
    title: string
    description: string
    buttonText: string
    onAction: () => void
}) {
    return (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
            <Button
                onClick={onAction}
                className="bg-blue-600 hover:bg-blue-700 text-white"
            >
                {buttonText}
            </Button>
        </div>
    )
}
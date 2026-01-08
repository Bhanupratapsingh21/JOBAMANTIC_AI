"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Permission, Query, Role } from "appwrite"
import { toast } from "sonner"
import { useUserStore } from "@/store/userStore"
import { resumeService, type SavedResume } from "@/lib/resumeService"
import { database } from "@/lib/appwrite"
import { ResumePreview } from "@/components/ResumePreview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CheckCircle, FileText, Loader2 } from "lucide-react"

interface AutofillSelection {
  $id: string
  resumeData: string
  $createdAt: string
  $updatedAt: string
}

export default function AutofillSelectPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [selectionDocId, setSelectionDocId] = useState<string | null>(null)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID
  const SELECTED_RESUME_COLLECTION_ID = process.env.NEXT_PUBLIC_SELECTED_RESUME_COLLECTION_ID

  useEffect(() => {
    if (!user) {
      router.push("/auth/Signin")
      return
    }
    loadResumes()
  }, [user, router])

  const loadResumes = async () => {
    try {
      setLoading(true)
      setError(null)

      const userResumes = await resumeService.getUserResumes(user!.id)
      setSavedResumes(userResumes)

      if (!DATABASE_ID || !SELECTED_RESUME_COLLECTION_ID) {
        setError("Selected resume collection is not configured. Listing resumes only.")
        return
      }

      const selection = await fetchSelection(DATABASE_ID, SELECTED_RESUME_COLLECTION_ID)
      if (selection) {
        const ownsSelection = userResumes.some((resume) => resume.$id === selection.$id)
        if (ownsSelection) {
          setSelectionDocId(selection.$id)
          setSelectedResumeId(selection.$id)
        } else {
          setSelectionDocId(null)
          setSelectedResumeId(null)
        }
      }
    } catch (err) {
      console.error("Error loading resumes:", err)
      setError("Failed to load resumes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchSelection = async (
    databaseId: string,
    collectionId: string
  ): Promise<AutofillSelection | null> => {
    const response = await database.listDocuments(
      databaseId,
      collectionId,
      [Query.orderDesc("$createdAt"), Query.limit(1)]
    )

    if (response.documents.length === 0) return null
    return response.documents[0] as unknown as AutofillSelection
  }

  const handleSelectResume = async (resume: SavedResume) => {
    if (!user) return
    if (!DATABASE_ID || !SELECTED_RESUME_COLLECTION_ID) {
      toast.error("Selected resume collection is not configured.")
      return
    }

    try {
      setSavingId(resume.$id)

      let resumeDataToStore = resume.resumeData

      try {
        const latestResume = await resumeService.getResume(resume.$id)
        resumeDataToStore = latestResume.resumeData
      } catch (error) {
        console.warn("Falling back to cached resume data:", error)
      }

      const payload = {
        resumeData: JSON.stringify(resumeDataToStore)
      }

      if (selectionDocId && selectionDocId !== resume.$id) {
        try {
          await database.deleteDocument(DATABASE_ID, SELECTED_RESUME_COLLECTION_ID, selectionDocId)
        } catch (error) {
          console.warn("Failed to delete previous selection:", error)
        }
      }

      if (selectionDocId === resume.$id) {
        await database.updateDocument(DATABASE_ID, SELECTED_RESUME_COLLECTION_ID, resume.$id, payload)
      } else {
        try {
          await database.createDocument(
            DATABASE_ID,
            SELECTED_RESUME_COLLECTION_ID,
            resume.$id,
            payload,
            [
              Permission.read(Role.user(user.id)),
              Permission.update(Role.user(user.id)),
              Permission.delete(Role.user(user.id))
            ]
          )
        } catch (error: any) {
          if (error?.code === 409) {
            await database.updateDocument(DATABASE_ID, SELECTED_RESUME_COLLECTION_ID, resume.$id, payload)
          } else {
            throw error
          }
        }
      }

      setSelectionDocId(resume.$id)
      setSelectedResumeId(resume.$id)
      toast.success("Autofill resume selected.")
    } catch (err) {
      console.error("Error selecting resume:", err)
      toast.error("Failed to save autofill selection.")
    } finally {
      setSavingId(null)
    }
  }

  const selectedResume = savedResumes.find((resume) => resume.$id === selectedResumeId)

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
            <h1 className="text-3xl font-bold text-gray-900">Autofill Select</h1>
            <p className="text-gray-600">
              Choose a resume to store for quick autofill in future flows.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => router.push("/resume/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Resume
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4 text-red-700">{error}</CardContent>
          </Card>
        )}

        {/* Selected Resume Summary */}
        <Card className="mb-8 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              Current Autofill Selection
            </CardTitle>
          <CardDescription>
              This resume will be stored in the selected resume collection for your user.
          </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedResume ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedResume.title}</h3>
                    <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                      {selectedResume.template}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedResume.resumeData.personalInfo.fullName} •{" "}
                    {selectedResume.resumeData.personalInfo.headline}
                  </p>
                </div>
                <Badge className="w-fit bg-green-600 text-white">Selected</Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No resume selected yet. Pick one below to enable autofill.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resume List */}
        {savedResumes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResumes.map((resume) => (
              <ResumeSelectCard
                key={resume.$id}
                resume={resume}
                selected={resume.$id === selectedResumeId}
                saving={savingId === resume.$id}
                onSelect={() => handleSelectResume(resume)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No resumes found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create a resume first so you can select it for autofill.
            </p>
            <Button
              onClick={() => router.push("/resume/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Your First Resume
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function ResumeSelectCard({
  resume,
  selected,
  saving,
  onSelect
}: {
  resume: SavedResume
  selected: boolean
  saving: boolean
  onSelect: () => void
}) {
  return (
    <Card className={`group border-2 transition-all duration-300 ${selected ? "border-blue-500 shadow-lg" : "border-gray-100 hover:-translate-y-1 hover:shadow-xl"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 text-gray-900">{resume.title}</CardTitle>
            <CardDescription className="mt-1 text-sm text-gray-500">
              {new Date(resume.$createdAt).toLocaleDateString()}
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize shrink-0 bg-blue-50 text-blue-700 border-blue-200">
            {resume.template}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="relative h-56 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="pointer-events-none origin-top-left scale-[0.35] w-[800px]">
            <ResumePreview data={resume.resumeData} template={resume.template as any} />
          </div>
        </div>
        <div className="text-sm text-gray-700">
          <p className="font-medium">{resume.resumeData.personalInfo.fullName}</p>
          <p className="text-gray-500 line-clamp-1">{resume.resumeData.personalInfo.headline}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{resume.resumeData.experience.length} positions</span>
          {selected && (
            <span className="inline-flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle className="w-4 h-4" />
              Selected
            </span>
          )}
        </div>
        <Button
          onClick={onSelect}
          disabled={saving || selected}
          className={`w-full ${selected ? "bg-green-600 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"} text-white`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : selected ? (
            "Selected"
          ) : (
            "Select"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

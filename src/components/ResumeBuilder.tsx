"use client"

import { useSearchParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/userStore"
import Header from "./Resume_Section/Header"
import { PersonalInfoForm } from "./PersonalInfoForm"
import { EducationForm } from "./EducationForm"
import { ExperienceForm } from "./ExperienceForm"
import { ProjectsForm } from "./ProjectsForm"
import { SkillsForm } from "./SkillsForm"
import { TemplatePanel } from "./TemplatePanel"
import { PreviewPanel } from "./PreviewPanel"
import { BottomToolbar } from "./BottomToolbar"
import { useResumeData } from "@/hooks/useResumeData"
import { templateThumbnails } from "@/data/templateData"
import { ResumeData, TemplateName } from "@/types/resume"
import { templates } from "./templates"
import { resumeService } from "@/lib/resumeService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Save,
  Download,
  FileText,
  Loader2
} from "lucide-react"

export default function ResumeBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUserStore();

  const resumeRef = useRef<HTMLDivElement>({} as HTMLDivElement)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("jake")
  const { resumeData, handlers } = useResumeData()

  // Save dialog state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [resumeTitle, setResumeTitle] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Get template from URL parameter
  useEffect(() => {
    const templateParam = searchParams.get('template') as TemplateName
    if (templateParam && (templateParam in templates)) {
      setSelectedTemplate(templateParam)
    }
  }, [searchParams])

  // Generate default resume title
  const generateDefaultTitle = () => {
    const name = resumeData.personalInfo.fullName || "My";
    const title = resumeData.personalInfo.headline || "Resume";
    const template = selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1);
    return `${name} - ${title} (${template})`;
  };

  // Function to handle saving resume
  const handleSaveResume = async () => {
    if (!user) {
      router.push("/auth/Signin")
      return
    }

    const title = resumeTitle.trim() || generateDefaultTitle();

    try {
      setIsSaving(true)

      // Prepare resume data for saving
      const resumeDataToSave: ResumeData = {
        ...resumeData,
        template: selectedTemplate
      }

      // Save to Appwrite
      const savedResume = await resumeService.saveResume(
        user.id,
        resumeDataToSave,
        title,
        isPublic
      )

      console.log("Resume saved successfully:", savedResume)

      // Close dialog and reset
      setSaveDialogOpen(false)
      setResumeTitle("")
      setIsPublic(false)

      // Show success message with options
      if (isPublic && savedResume.shareableUrl) {
        alert(`Resume saved and shared! Shareable URL: ${window.location.origin}/resume/${savedResume.shareableUrl}`)
      } else {
        alert("Resume saved successfully! You can view it in your dashboard.")
      }

    } catch (error) {
      console.error("Error saving resume:", error)
      alert("Failed to save resume. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // Open save dialog with pre-filled title
  const handleOpenSaveDialog = () => {
    setResumeTitle(generateDefaultTitle())
    setSaveDialogOpen(true)
  }

  // Handle PDF download
  const handleDownloadPDF = () => {
    if (resumeRef.current) {
      handlers.downloadPDF(resumeRef)
    }
  }

  // Add save button to your toolbar
  const renderToolbar = () => (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
      <div className="bg-card border border-border rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg">
        <Button
          size="sm"
          variant="ghost"
          className="p-2"
          onClick={handleOpenSaveDialog}
        >
          <Save className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="p-2"
          onClick={handleDownloadPDF}
        >
          <Download className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  // Add save dialog
  const renderSaveDialog = () => (
    <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            Save Resume
          </DialogTitle>
          <DialogDescription>
            Save your resume to access it later and share with employers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="resume-title">Resume Title</Label>
            <Input
              id="resume-title"
              placeholder="e.g., Senior Developer Resume 2024"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && resumeTitle.trim()) {
                  handleSaveResume()
                }
              }}
            />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="public-switch" className="text-sm font-medium">
                Make Public
              </Label>
              <p className="text-xs text-gray-500">
                Generate a shareable link for this resume
              </p>
            </div>
            <Switch
              id="public-switch"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <FileText className="w-4 h-4" />
              <span>Template: <strong>{selectedTemplate}</strong></span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSaveDialogOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveResume}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Resume
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Main Content */}
      <div className="pt-16 flex">
        {/* Left Panel - Form */}
        <div className="w-96 bg-card border-r border-border p-6 space-y-6 overflow-y-auto h-screen">
          <PersonalInfoForm
            data={resumeData.personalInfo}
            onChange={handlers.handleInputChange}
          />

          <EducationForm
            education={resumeData.education}
            onAdd={handlers.addItem}
            onRemove={handlers.removeItem}
            onChange={handlers.handleArrayChange}
          />

          <ExperienceForm
            experience={resumeData.experience}
            onAdd={handlers.addItem}
            onRemove={handlers.removeItem}
            onChange={handlers.handleArrayChange}
            onDescriptionChange={handlers.handleNestedArrayChange}
            onAddDescription={handlers.addDescription}
            onRemoveDescription={handlers.removeDescription}
          />

          <ProjectsForm
            projects={resumeData.projects}
            onAdd={handlers.addItem}
            onRemove={handlers.removeItem}
            onChange={handlers.handleArrayChange}
            onDescriptionChange={handlers.handleNestedArrayChange}
            onAddDescription={handlers.addDescription}
            onRemoveDescription={handlers.removeDescription}
          />

          <SkillsForm
            skills={resumeData.skills}
            onSkillsChange={handlers.handleSkillsChange}
            onAddSkill={handlers.addSkill}
            onRemoveSkill={handlers.removeSkill}
          />
        </div>

        {/* Center Panel - Preview */}
        <PreviewPanel
          resumeRef={resumeRef}
          data={resumeData}
          template={selectedTemplate}
        />

        {/* Right Panel - Templates */}
        <TemplatePanel
          templates={templateThumbnails}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
        />
      </div>

      {/* Toolbar and Dialogs */}
      {renderToolbar()}
      {renderSaveDialog()}
    </div>
  )
}

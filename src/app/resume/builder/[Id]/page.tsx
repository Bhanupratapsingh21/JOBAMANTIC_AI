// src/app/resume/builder/[Id]/page.tsx
"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { useUserStore } from "@/store/userStore"
import Header from "@/components/Resume_Section/Header"
import { PersonalInfoForm } from "@/components/PersonalInfoForm"
import { EducationForm } from "@/components/EducationForm"
import { ExperienceForm } from "@/components/ExperienceForm"
import { SkillsForm } from "@/components/SkillsForm"
import { TemplatePanel } from "@/components/TemplatePanel"
import { PreviewPanel } from "@/components/PreviewPanel"
import { useResumeData } from "@/hooks/useResumeData"
import { templateThumbnails } from "@/data/templateData"
import { TemplateName, ResumeData } from "@/types/resume"
import { templates } from "@/components/templates"
import { resumeService, type SavedResume } from "@/lib/resumeService"
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
    Loader2,
    Edit,
    Trash2,
    Copy,
    ArrowLeft
} from "lucide-react"

export default function EditResumePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUserStore();

    const resumeRef = useRef<HTMLDivElement>({} as HTMLDivElement)

    // States for editing
    const [resumeId, setResumeId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [originalResume, setOriginalResume] = useState<SavedResume | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>("jake")

    // Initialize useResumeData with null - we'll update it after loading
    const { resumeData, handlers } = useResumeData()

    // Save dialog state
    const [saveDialogOpen, setSaveDialogOpen] = useState(false)
    const [saveMode, setSaveMode] = useState<'update' | 'saveAs'>('update')
    const [resumeTitle, setResumeTitle] = useState("")
    const [isPublic, setIsPublic] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Get resume ID from URL parameter
    const resumeIdParam = params.Id as string

    // Load existing resume
    useEffect(() => {
        const loadResume = async () => {
            if (!resumeIdParam || !user) {
                alert("Invalid resume ID or user not logged in");
                router.push("/dashboard");
                return;
            }

            try {
                setIsLoading(true);
                const savedResume = await resumeService.getResume(resumeIdParam);

                // Check if user owns this resume
                if (savedResume.userId !== user.id) {
                    alert("You don't have permission to edit this resume");
                    router.push("/dashboard");
                    return;
                }

                setResumeId(savedResume.$id);
                setOriginalResume(savedResume);

                // Load resume data into the form
                if (savedResume.resumeData) {
                    console.log("Loaded resume data:", savedResume.resumeData);

                    // Use resetResumeData to completely replace the data
                    handlers.resetResumeData(savedResume.resumeData);

                    // Set template if available
                    if (savedResume.template) {
                        setSelectedTemplate(savedResume.template as TemplateName);
                    }

                    // Set title and public status
                    setResumeTitle(savedResume.title);
                    setIsPublic(savedResume.isPublic);
                }

            } catch (error) {
                console.error("Error loading resume:", error);
                alert("Failed to load resume. It may have been deleted or you don't have access.");
                router.push("/dashboard");
            } finally {
                setIsLoading(false);
            }
        };

        loadResume();
    }, [resumeIdParam, user, router, handlers.resetResumeData]);

    // Open save dialog in different modes
    const handleOpenSaveDialog = (mode: 'update' | 'saveAs' = 'update') => {
        if (!user) {
            router.push("/auth/Signin")
            return
        }

        setSaveMode(mode);

        if (mode === 'update' && originalResume) {
            // Keep original title for update
            setResumeTitle(originalResume.title);
            setIsPublic(originalResume.isPublic);
        } else if (mode === 'saveAs') {
            // Add "Copy" to title for save as
            const baseTitle = originalResume?.title || "My Resume";
            setResumeTitle(`${baseTitle} - Copy`);
        }

        setSaveDialogOpen(true);
    };

    // In handleSaveResume function, check if public status actually changed
    const handleSaveResume = async () => {
        if (!user) {
            router.push("/auth/Signin")
            return
        }

        const title = resumeTitle.trim() || (originalResume?.title || "My Resume");

        try {
            setIsSaving(true)

            // Prepare resume data for saving
            const resumeDataToSave: ResumeData = {
                ...resumeData,
                template: selectedTemplate
            }

            let savedResume: SavedResume;

            if (saveMode === 'update' && resumeId) {
                // Check if isPublic actually changed
                const isPublicChanged = isPublic !== originalResume?.isPublic;

                // Only include isPublic in update if it changed
                const updateData: any = {
                    title,
                    resumeData: resumeDataToSave
                };

                if (isPublicChanged) {
                    updateData.isPublic = isPublic;
                }

                // Update existing resume
                savedResume = await resumeService.updateResume(resumeId, updateData);
                console.log("Resume updated successfully:", savedResume);

                // Update original resume state
                setOriginalResume(savedResume);
            } else {
                // Save as new resume
                savedResume = await resumeService.saveResume(
                    user.id,
                    resumeDataToSave,
                    title,
                    isPublic
                );
                console.log("Resume saved as new copy:", savedResume);

                // Redirect to edit the new copy
                router.push(`/dashboard/builder/${savedResume.$id}`);
                return;
            }

            // Close dialog
            setSaveDialogOpen(false);

            // Show success message
            let message = "Resume updated successfully!";

            if (isPublic && savedResume.shareableUrl) {
                message += `\n\nShareable URL: ${window.location.origin}/resume/${savedResume.shareableUrl}`;
            }

            alert(message);

        } catch (error) {
            console.error("Error saving resume:", error)
            alert(`Failed to ${saveMode === 'update' ? 'update' : 'save'} resume. Please try again.`)
        } finally {
            setIsSaving(false)
        }
    }

    // Handle delete resume
    const handleDeleteResume = async () => {
        if (!resumeId || !user) return;

        try {
            setIsDeleting(true);
            await resumeService.deleteResume(resumeId);

            alert("Resume deleted successfully!");
            router.push("/dashboard"); // Redirect to dashboard after delete

        } catch (error) {
            console.error("Error deleting resume:", error);
            alert("Failed to delete resume. Please try again.");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    // Handle PDF download
    const handleDownloadPDF = () => {
        if (resumeRef.current) {
            handlers.downloadPDF(resumeRef)
        }
    }

    // Duplicate resume
    const handleDuplicateResume = () => {
        handleOpenSaveDialog('saveAs');
    }

    // Render toolbar with edit mode options
    const renderToolbar = () => (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-card border border-border rounded-full px-4 py-2 flex items-center space-x-2 shadow-lg">
                <Button
                    size="sm"
                    variant="ghost"
                    className="p-2"
                    onClick={() => handleOpenSaveDialog('update')}
                    title="Update Resume"
                >
                    <Save className="w-4 h-4" />
                </Button>

                <Button
                    size="sm"
                    variant="ghost"
                    className="p-2"
                    onClick={handleDuplicateResume}
                    title="Duplicate Resume"
                >
                    <Copy className="w-4 h-4" />
                </Button>

                <div className="h-6 w-px bg-border" />

                <Button
                    size="sm"
                    variant="ghost"
                    className="p-2 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                    title="Delete Resume"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>

                <Button
                    size="sm"
                    variant="ghost"
                    className="p-2"
                    onClick={handleDownloadPDF}
                    title="Download PDF"
                >
                    <Download className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )

    // Render save/update dialog
    const renderSaveDialog = () => {
        const dialogTitle = saveMode === 'update' ? 'Update Resume' : 'Save as New Resume';

        const dialogDescription = saveMode === 'update'
            ? 'Update your resume with the latest changes.'
            : 'Create a new copy of this resume with a different name.';

        const buttonText = saveMode === 'update' ? 'Update Resume' : 'Save as New';

        return (
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {saveMode === 'update' ? <Save className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                            {dialogTitle}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogDescription}
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
                            disabled={isSaving || !resumeTitle.trim()}
                            className={saveMode === 'update'
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-blue-600 hover:bg-blue-700"}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {saveMode === 'update' ? 'Updating...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    {saveMode === 'update' ? <Save className="w-4 h-4 mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                                    {buttonText}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    // Render delete confirmation dialog
    const renderDeleteDialog = () => (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <Trash2 className="w-5 h-5" />
                        Delete Resume
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{originalResume?.title}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive">
                        <strong>Warning:</strong> All data associated with this resume will be permanently deleted.
                    </p>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteResume}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Resume
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Loading resume...</p>
                </div>
            </div>
        );
    }

    // If no resume found
    if (!originalResume) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md mx-4">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Resume Not Found</h1>
                    <p className="text-gray-600 mb-6">We couldn't find the resume you're looking for.</p>
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />

            {/* Edit mode header */}
            <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 fixed top-16 left-0 right-0 z-40">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Edit className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-800">
                            Editing: <strong>{originalResume?.title}</strong>
                        </span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/dashboard")}
                        className="text-xs"
                    >
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        Back to Dashboard
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-32 flex">
                {/* Left Panel - Form */}
                <div className="w-96 bg-card border-r border-border p-6 space-y-6 overflow-y-auto h-[calc(100vh-8rem)]">
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
            {renderDeleteDialog()}
        </div>
    )
}
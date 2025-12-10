"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { resumeService, type SavedResume } from "@/lib/resumeService"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Share2, Eye, User, ArrowLeft, Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react"
import { ResumePreview } from "@/components/ResumePreview"
import Link from "next/link"

export default function PublicResumePage() {
    const params = useParams()
    const shareableUrl = params.shareableUrl as string
    const resumeRef = useRef<HTMLDivElement>(null)

    const [resume, setResume] = useState<SavedResume | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [generatingPDF, setGeneratingPDF] = useState(false)

    useEffect(() => {
        loadPublicResume()
    }, [shareableUrl])

    const loadPublicResume = async () => {
        try {
            setLoading(true)
            const publicResume = await resumeService.getPublicResume(shareableUrl)
            setResume(publicResume)
        } catch (err) {
            setError("Resume not found or is no longer available")
        } finally {
            setLoading(false)
        }
    }

    const downloadPDF = async () => {
        if (!resumeRef.current) return
        try {
            setGeneratingPDF(true)

            // Get all stylesheets
            const styles = Array.from(document.styleSheets)
                .map(styleSheet => {
                    try {
                        return Array.from(styleSheet.cssRules)
                            .map(rule => rule.cssText)
                            .join('\n')
                    } catch (e) {
                        console.warn('Cannot access stylesheet:', e)
                        return ''
                    }
                })
                .join('\n')

            // Get the resume HTML
            const resumeHTML = resumeRef.current.innerHTML

            // Create a new window for printing
            const printWindow = window.open('', '_blank')
            if (!printWindow) {
                alert('Please allow popups for this site to download PDF')
                return
            }

            // Write complete HTML with all styles
            printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${resume?.title || 'Resume'}</title>
            <meta charset="utf-8">
            <style>
                ${styles}
                
                @page {
                    size: A4;
                    margin: 0;
                }
                
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                }
                
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: white;
                }
            </style>
        </head>
        <body>
            <div class="max-w-4xl mx-auto">
                ${resumeHTML}
            </div>
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    }, 500);
                }
            </script>
        </body>
        </html>
    `)

            printWindow.document.close()

        } catch (error) {
            console.error("Error generating PDF:", error)
            alert("Failed to generate PDF. Please try again.")
        } finally {
            setGeneratingPDF(false)
        }
    }


    const shareResume = async () => {
        const shareableLink = `${window.location.origin}/resume/${shareableUrl}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: resume?.title || 'Resume',
                    text: `Check out ${resume?.resumeData.personalInfo.fullName}'s resume`,
                    url: shareableLink,
                })
            } catch (err) {
                // User cancelled share
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareableLink)
            alert("Shareable link copied to clipboard!")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading resume...</p>
                </div>
            </div>
        )
    }

    if (error || !resume) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume Not Found</h1>
                    <p className="text-gray-600 mb-6">{error || "The resume you're looking for doesn't exist or is no longer public."}</p>
                    <Link href="/">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Home
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                    <div className="flex-1">
                        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Home
                        </Link>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{resume.title}</h1>
                                <p className="text-lg text-gray-600 mt-1">
                                    {resume.resumeData.personalInfo.headline}
                                </p>
                            </div>
                            <Badge variant="outline" className="w-fit bg-blue-50 text-blue-700 border-blue-200 capitalize">
                                {resume.template} Template
                            </Badge>
                        </div>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                            {resume.resumeData.personalInfo.email && (
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {resume.resumeData.personalInfo.email}
                                </div>
                            )}
                            {resume.resumeData.personalInfo.phone && (
                                <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {resume.resumeData.personalInfo.phone}
                                </div>
                            )}
                            {resume.resumeData.personalInfo.location && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {resume.resumeData.personalInfo.location}
                                </div>
                            )}
                            {resume.resumeData.personalInfo.linkedin && (
                                <div className="flex items-center gap-1">
                                    <Linkedin className="w-4 h-4" />
                                    LinkedIn
                                </div>
                            )}
                            {resume.resumeData.personalInfo.github && (
                                <div className="flex items-center gap-1">
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <Button
                            onClick={downloadPDF}
                            variant="outline"
                            disabled={generatingPDF}
                            className="flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            {generatingPDF ? "Generating..." : "Download PDF"}
                        </Button>
                        <Button
                            onClick={shareResume}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Resume Preview */}
                <div className="relative">
                    <Card ref={resumeRef} className="w-full max-w-4xl mx-auto bg-white shadow-2xl border-0">
                        <ResumePreview
                            data={resume.resumeData}
                            template={resume.template as any}
                        />
                    </Card>

                    {/* Watermark */}
                    <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                        Created with Trainingbasket Resume Builder
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Like this resume format?
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Create your own professional resume in minutes with our easy-to-use builder.
                        </p>
                        <Link href="/resume/create">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Create Your Resume
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
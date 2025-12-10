"use client"

import { Card } from "@/components/ui/card"
import { ResumePreview } from "./ResumePreview"
import { ResumeData, TemplateName } from "../types/resume"

interface PreviewPanelProps {
    resumeRef: React.RefObject<HTMLDivElement> // Fix: Use proper type
    data: ResumeData
    template: TemplateName
}

export const PreviewPanel = ({ resumeRef, data, template }: PreviewPanelProps) => {
    return (
        <div className="flex-1 bg-muted/20 p-8 flex items-center justify-center">
            <Card ref={resumeRef} className="w-full max-w-2xl h-[800px] bg-white shadow-lg overflow-auto">
                <ResumePreview data={data} template={template} />
            </Card>
        </div>
    )
}
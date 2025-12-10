"use client"

import { TemplateName } from "../types/resume"

interface TemplateThumbnail {
    name: string
    color: string
    id: TemplateName
}

interface TemplatePanelProps {
    templates: TemplateThumbnail[]
    selectedTemplate: TemplateName
    onTemplateSelect: (template: TemplateName) => void
}

export const TemplatePanel = ({ templates, selectedTemplate, onTemplateSelect }: TemplatePanelProps) => {
    return (
        <div className="w-80 bg-card border-l border-border">
            <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Templates</h3>
                <div className="grid grid-cols-2 gap-4">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="space-y-2 cursor-pointer"
                            onClick={() => onTemplateSelect(template.id)}
                        >
                            <div
                                className={`aspect-[3/4] ${template.color} rounded-lg border-2 ${selectedTemplate === template.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-border'
                                    } relative overflow-hidden flex items-center justify-center`}
                            >
                                <div className="text-center p-2">
                                    <div className="font-semibold text-sm mb-1">{template.name}</div>
                                    <div className="text-xs text-gray-600">Template</div>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-center block">{template.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
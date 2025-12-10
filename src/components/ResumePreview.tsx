"use client"

import { ResumePreviewProps } from '../types/resume'
import { getTemplateComponent } from './templates'

export const ResumePreview = ({ data, template }: ResumePreviewProps) => {
    const TemplateComponent = getTemplateComponent(template)

    return <TemplateComponent data={data} />
}
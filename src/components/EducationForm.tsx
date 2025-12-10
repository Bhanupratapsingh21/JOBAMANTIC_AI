"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Book, Plus, Trash2 } from "lucide-react"
import { Education } from "../types/resume"

interface EducationFormProps {
  education: Education[]
  onAdd: (section: "education", template: Partial<Education>) => void
  onRemove: (section: "education", id: number) => void
  onChange: (section: "education", index: number, field: string, value: string) => void
}

export const EducationForm = ({ education, onAdd, onRemove, onChange }: EducationFormProps) => {
  const educationTemplate: Partial<Education> = {
    institution: "",
    location: "",
    degree: "",
    minor: "",
    startDate: "",
    endDate: "",
    gpa: ""
  }

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Book className="w-5 h-5" />
          Education
        </h2>
        <Button
          onClick={() => onAdd('education', educationTemplate)}
          size="sm"
          variant="ghost"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {education.map((edu, index) => (
        <div key={edu.id} className="border-l-2 border-blue-500 pl-3 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Education #{index + 1}</h3>
            <Button
              onClick={() => onRemove('education', edu.id)}
              size="sm"
              variant="ghost"
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <Input
            placeholder="Institution"
            value={edu.institution}
            onChange={(e) => onChange('education', index, 'institution', e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <Input
            placeholder="Location"
            value={edu.location}
            onChange={(e) => onChange('education', index, 'location', e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <Input
            placeholder="Degree"
            value={edu.degree}
            onChange={(e) => onChange('education', index, 'degree', e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <Input
            placeholder="Minor (Optional)"
            value={edu.minor || ""}
            onChange={(e) => onChange('education', index, 'minor', e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Start Date"
              value={edu.startDate}
              onChange={(e) => onChange('education', index, 'startDate', e.target.value)}
              className="bg-muted border-0 text-sm"
            />
            <Input
              placeholder="End Date"
              value={edu.endDate}
              onChange={(e) => onChange('education', index, 'endDate', e.target.value)}
              className="bg-muted border-0 text-sm"
            />
          </div>
          <Input
            placeholder="GPA"
            value={edu.gpa || ""}
            onChange={(e) => onChange('education', index, 'gpa', e.target.value)}
            className="bg-muted border-0 text-sm"
          />
        </div>
      ))}
    </div>
  )
}
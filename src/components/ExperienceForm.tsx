"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Bookmark, Plus, Trash2 } from "lucide-react"
import { Experience } from "../types/resume"

interface ExperienceFormProps {
  experience: Experience[]
  onAdd: (section: "experience", template: Partial<Experience>) => void
  onRemove: (section: "experience", id: number) => void
  onChange: (section: "experience", index: number, field: string, value: string) => void
  onDescriptionChange: (section: "experience", index: number, subField: string, subIndex: number, value: string) => void
  onAddDescription: (section: "experience", index: number) => void
  onRemoveDescription: (section: "experience", index: number, descIndex: number) => void
}

export const ExperienceForm = ({ 
  experience, 
  onAdd, 
  onRemove, 
  onChange, 
  onDescriptionChange, 
  onAddDescription, 
  onRemoveDescription 
}: ExperienceFormProps) => {
  const experienceTemplate: Partial<Experience> = {
    company: "",
    location: "",
    position: "",
    startDate: "",
    endDate: "",
    description: [""]
  }

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Bookmark className="w-5 h-5" />
          Experience
        </h2>
        <Button
          onClick={() => onAdd('experience', experienceTemplate)}
          size="sm"
          variant="ghost"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {experience.map((exp, index) => (
        <div key={exp.id} className="border-l-2 border-green-500 pl-3 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Experience #{index + 1}</h3>
            <Button
              onClick={() => onRemove('experience', exp.id)}
              size="sm"
              variant="ghost"
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <Input
            placeholder="Company"
            value={exp.company}
            onChange={(e) => onChange('experience', index, 'company', e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <Input
            placeholder="Location"
            value={exp.location}
            onChange={(e) => onChange('experience', index, 'location', e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <Input
            placeholder="Position"
            value={exp.position}
            onChange={(e) => onChange('experience', index, 'position', e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Start Date"
              value={exp.startDate}
              onChange={(e) => onChange('experience', index, 'startDate', e.target.value)}
              className="bg-muted border-0 text-sm"
            />
            <Input
              placeholder="End Date"
              value={exp.endDate}
              onChange={(e) => onChange('experience', index, 'endDate', e.target.value)}
              className="bg-muted border-0 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Description Points</Label>
            {exp.description.map((desc, descIndex) => (
              <div key={descIndex} className="flex gap-1">
                <Input
                  placeholder={`Point ${descIndex + 1}`}
                  value={desc}
                  onChange={(e) => onDescriptionChange('experience', index, 'description', descIndex, e.target.value)}
                  className="bg-muted border-0 text-sm"
                />
                <Button
                  onClick={() => onRemoveDescription('experience', index, descIndex)}
                  size="sm"
                  variant="ghost"
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => onAddDescription('experience', index)}
              size="sm"
              variant="outline"
              className="w-full text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Point
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
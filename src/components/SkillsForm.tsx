"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { Skills } from "../types/resume"

interface SkillsFormProps {
  skills: Skills
  onSkillsChange: (category: keyof Skills, newSkills: string[]) => void
  onAddSkill: (category: keyof Skills, newSkill: string) => void
  onRemoveSkill: (category: keyof Skills, skillToRemove: string) => void
}

interface SkillsInputProps {
  category: keyof Skills
  title: string
  skills: string[]
  onAddSkill: (category: keyof Skills, newSkill: string) => void
  onRemoveSkill: (category: keyof Skills, skillToRemove: string) => void
}

const SkillsInput = ({ category, title, skills, onAddSkill, onRemoveSkill }: SkillsInputProps) => {
  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      onAddSkill(category, newSkill.trim())
      setNewSkill('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSkill()
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Add ${title.toLowerCase()}`}
          className="flex-1 bg-muted border-0 text-sm"
        />
        <Button onClick={handleAddSkill} size="sm">
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-1">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
          >
            {skill}
            <button
              onClick={() => onRemoveSkill(category, skill)}
              className="text-blue-600 hover:text-blue-800 ml-1 text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export const SkillsForm = ({ skills, onAddSkill, onRemoveSkill }: SkillsFormProps) => {
  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Skills
      </h2>
      <div className="space-y-4">
        <SkillsInput 
          category="languages" 
          title="Languages" 
          skills={skills.languages}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
        />
        <SkillsInput 
          category="frameworks" 
          title="Frameworks" 
          skills={skills.frameworks}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
        />
        <SkillsInput 
          category="tools" 
          title="Tools" 
          skills={skills.tools}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
        />
        <SkillsInput 
          category="libraries" 
          title="Libraries" 
          skills={skills.libraries}
          onAddSkill={onAddSkill}
          onRemoveSkill={onRemoveSkill}
        />
      </div>
    </div>
  )
}
"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Folder, Plus, Trash2 } from "lucide-react"
import { Project } from "../types/resume"

interface ProjectsFormProps {
  projects: Project[]
  onAdd: (section: "projects", template: Partial<Project>) => void
  onRemove: (section: "projects", id: number) => void
  onChange: (section: "projects", index: number, field: string, value: string) => void
  onDescriptionChange: (section: "projects", index: number, subField: string, subIndex: number, value: string) => void
  onAddDescription: (section: "projects", index: number) => void
  onRemoveDescription: (section: "projects", index: number, descIndex: number) => void
}

export const ProjectsForm = ({
  projects,
  onAdd,
  onRemove,
  onChange,
  onDescriptionChange,
  onAddDescription,
  onRemoveDescription
}: ProjectsFormProps) => {
  const projectTemplate: Partial<Project> = {
    name: "",
    technologies: "",
    startDate: "",
    endDate: "",
    description: [""]
  }

  return (
    <div className="space-y-4 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Projects
        </h2>
        <Button
          onClick={() => onAdd("projects", projectTemplate)}
          size="sm"
          variant="ghost"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {projects.map((project, index) => (
        <div key={project.id} className="border-l-2 border-green-500 pl-3 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">Project #{index + 1}</h3>
            <Button
              onClick={() => onRemove("projects", project.id)}
              size="sm"
              variant="ghost"
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <Input
            placeholder="Project Name"
            value={project.name}
            onChange={(e) => onChange("projects", index, "name", e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <Input
            placeholder="Technologies"
            value={project.technologies}
            onChange={(e) => onChange("projects", index, "technologies", e.target.value)}
            className="bg-muted border-0 text-sm"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Start Date"
              value={project.startDate}
              onChange={(e) => onChange("projects", index, "startDate", e.target.value)}
              className="bg-muted border-0 text-sm"
            />
            <Input
              placeholder="End Date"
              value={project.endDate}
              onChange={(e) => onChange("projects", index, "endDate", e.target.value)}
              className="bg-muted border-0 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Description Points</Label>
            {project.description.map((desc, descIndex) => (
              <div key={descIndex} className="flex gap-1">
                <Input
                  placeholder={`Point ${descIndex + 1}`}
                  value={desc}
                  onChange={(e) =>
                    onDescriptionChange("projects", index, "description", descIndex, e.target.value)
                  }
                  className="bg-muted border-0 text-sm"
                />
                <Button
                  onClick={() => onRemoveDescription("projects", index, descIndex)}
                  size="sm"
                  variant="ghost"
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => onAddDescription("projects", index)}
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

"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { PersonalInfo } from "../types/resume"

interface PersonalInfoFormProps {
    data: PersonalInfo
    onChange: (section: "personalInfo", field: string, value: string) => void
}

export const PersonalInfoForm = ({ data, onChange }: PersonalInfoFormProps) => {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
            </h2>

            <div className="space-y-3">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <Input
                        value={data.fullName}
                        onChange={(e) => onChange("personalInfo", "fullName", e.target.value)}
                        className="bg-muted border-0"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Headline</Label>
                    <Input
                        value={data.headline}
                        onChange={(e) => onChange("personalInfo", "headline", e.target.value)}
                        className="bg-muted border-0"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <Input
                            value={data.email}
                            onChange={(e) => onChange("personalInfo", "email", e.target.value)}
                            className="bg-muted border-0 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input
                            value={data.phone}
                            onChange={(e) => onChange("personalInfo", "phone", e.target.value)}
                            className="bg-muted border-0 text-sm"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Location</Label>
                    <Input
                        value={data.location}
                        onChange={(e) => onChange("personalInfo", "location", e.target.value)}
                        className="bg-muted border-0"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">LinkedIn</Label>
                        <Input
                            value={data.linkedin}
                            onChange={(e) => onChange("personalInfo", "linkedin", e.target.value)}
                            className="bg-muted border-0 text-sm"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">GitHub</Label>
                        <Input
                            value={data.github}
                            onChange={(e) => onChange("personalInfo", "github", e.target.value)}
                            className="bg-muted border-0 text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
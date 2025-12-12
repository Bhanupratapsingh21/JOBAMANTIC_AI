// src/hooks/useResumeData.ts
import { useState, useCallback } from "react"
import { ResumeData, PersonalInfo, Education, Experience, Skills } from "../types/resume"
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const initialResumeData: ResumeData = {
    personalInfo: {
        fullName: "Jake Ryan",
        headline: "Computer Science Student",
        email: "jake@su.edu",
        phone: "123-456-7890",
        location: "Georgetown, TX",
        website: "jakeryan.dev",
        linkedin: "linkedin.com/in/jake",
        github: "github.com/jake"
    },
    summary: "Computer Science student with research experience in software development and artificial intelligence. Passionate about creating efficient software solutions and exploring new technologies.",
    education: [
        {
            id: 1,
            institution: "Southwestern University",
            location: "Georgetown, TX",
            degree: "Bachelor of Arts in Computer Science",
            minor: "Minor in Business",
            startDate: "Aug 2018",
            endDate: "May 2021",
            gpa: "3.8"
        }
    ],
    experience: [
        {
            id: 1,
            company: "Texas A&M University",
            location: "College Station, TX",
            position: "Undergraduate Research Assistant",
            startDate: "June 2020",
            endDate: "Present",
            description: [
                "Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems",
                "Developed a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data",
                "Explored ways to visualize GitHub collaboration in a classroom setting"
            ]
        }
    ],
    projects: [
        {
            id: 1,
            name: "Gitlytics",
            technologies: "Python, Flask, React, PostgreSQL, Docker",
            startDate: "June 2020",
            endDate: "Present",
            description: [
                "Developed a full-stack web application using with Flask serving a REST API with React as the frontend",
                "Implemented GitHub OAuth to get data from user's repositories",
                "Visualized GitHub data to show collaboration",
                "Used Celery and Redis for asynchronous tasks"
            ]
        }
    ],
    skills: {
        languages: ["Java", "Python", "C/C++", "SQL (Postgres)", "JavaScript", "HTML/CSS", "R"],
        frameworks: ["React", "Node.js", "Flask", "JUnit", "WordPress", "Material-UI", "FastAPI"],
        tools: ["Git", "Docker", "TravisCI", "Google Cloud Platform", "VS Code", "Visual Studio", "PyCharm"],
        libraries: ["pandas", "NumPy", "Matplotlib"]
    },
    template: "modern" // Add this
}

export const useResumeData = (initialData?: ResumeData) => {
    const [resumeData, setResumeData] = useState<ResumeData>(initialData || initialResumeData)

    // Reset function to load new data
    const resetResumeData = useCallback((newData: ResumeData) => {
        setResumeData(newData)
    }, [])

    const clearSection = useCallback((section: keyof ResumeData) => {
        setResumeData(prev => ({
            ...prev,
            [section]: []
        }));
    }, []);

    const setResumeDataDirectly = useCallback((newData: ResumeData) => {
        setResumeData(newData);
    }, []);

    const handleInputChange = useCallback((section: keyof ResumeData, field: string, value: string) => {
        setResumeData(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] as any),
                [field]: value
            }
        }))
    }, [])

    const handleArrayChange = useCallback((section: keyof ResumeData, index: number, field: string, value: string) => {
        setResumeData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }))
    }, [])

    const handleNestedArrayChange = useCallback((section: keyof ResumeData, index: number, subField: string, subIndex: number, value: string) => {
        setResumeData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).map((item, i) =>
                i === index ? {
                    ...item,
                    [subField]: (item[subField] as string[]).map((desc, j) => j === subIndex ? value : desc)
                } : item
            )
        }))
    }, [])

    const addItem = useCallback((section: keyof ResumeData, template: any) => {
        setResumeData(prev => ({
            ...prev,
            [section]: [...(prev[section] as any[]), { ...template, id: Date.now() }]
        }))
    }, [])

    const removeItem = useCallback((section: keyof ResumeData, id: number) => {
        setResumeData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).filter(item => item.id !== id)
        }))
    }, [])

    const addDescription = useCallback((section: keyof ResumeData, index: number) => {
        setResumeData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).map((item, i) =>
                i === index ? {
                    ...item,
                    description: [...item.description, ""]
                } : item
            )
        }))
    }, [])

    const removeDescription = useCallback((section: keyof ResumeData, index: number, descIndex: number) => {
        setResumeData(prev => ({
            ...prev,
            [section]: (prev[section] as any[]).map((item, i) =>
                i === index ? {
                    ...item,
                    description: item.description.filter((_: string, j: number) => j !== descIndex)
                } : item
            )
        }))
    }, [])

    const handleSkillsChange = useCallback((category: keyof Skills, newSkills: string[]) => {
        setResumeData(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [category]: Array.isArray(newSkills) ? newSkills : []
            }
        }))
    }, [])

    const addSkill = useCallback((category: keyof Skills, newSkill: string) => {
        if (newSkill.trim() && !resumeData.skills[category].includes(newSkill.trim())) {
            const updatedSkills = [...resumeData.skills[category], newSkill.trim()]
            handleSkillsChange(category, updatedSkills)
        }
    }, [resumeData.skills, handleSkillsChange])

    const removeSkill = useCallback((category: keyof Skills, skillToRemove: string) => {
        const updatedSkills = resumeData.skills[category].filter(skill => skill !== skillToRemove)
        handleSkillsChange(category, updatedSkills)
    }, [resumeData.skills, handleSkillsChange])

    const downloadPDF = useCallback(async (resumeRef: React.RefObject<HTMLDivElement>) => {
        if (!resumeRef.current) {
            console.error("Resume ref is not available")
            return
        }

        try {
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
                <title>${resumeData.personalInfo.fullName}-Resume</title>
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
        }
    }, [resumeData.personalInfo.fullName])


    return {
        resumeData,
        handlers: {
            handleInputChange,
            handleArrayChange,
            handleNestedArrayChange,
            addItem,
            removeItem,
            addDescription,
            removeDescription,
            handleSkillsChange,
            addSkill,
            removeSkill,
            downloadPDF,
            clearSection,
            setResumeDataDirectly,
            resetResumeData
        }
    }
}
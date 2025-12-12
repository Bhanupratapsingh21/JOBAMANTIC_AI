import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface ResumeData {
  personalInfo: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  education: Array<{
    id: number;
    institution: string;
    location: string;
    degree: string;
    minor?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  experience: Array<{
    id: number;
    company: string;
    location: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  projects: Array<{
    id: number;
    name: string;
    technologies: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    libraries: string[];
  };
  template: string;
}

interface GenerateResumeRequest {
  resumeText: string;
  feedback: {
    overallScore: number;
    ats: string;
    toneAndStyle: string;
    content: string;
    structure: string;
    skills: string;
  };
  jobTitle: string;
  companyName: string;
  jobDescription: string;
}

function parseResumeTextToStructured(resumeText: string): Partial<ResumeData> {
  try {
    // Initialize with default values
    const structured: Partial<ResumeData> = {
      personalInfo: {
        fullName: "",
        headline: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: ""
      },
      summary: "",
      education: [],
      experience: [],
      projects: [],
      skills: {
        languages: [],
        frameworks: [],
        tools: [],
        libraries: []
      },
      template: "modern"
    };

    // Basic extraction patterns
    const lines = resumeText.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Extract name (usually first line or has "Name:" prefix)
      if (!structured.personalInfo?.fullName && (trimmed.includes('Name:') || trimmed.includes('Full Name:'))) {
        if (structured.personalInfo) {
          structured.personalInfo.fullName = trimmed.replace(/^(Name:|Full Name:)\s*/i, '');
        }
      } else if (!structured.personalInfo?.fullName && /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(trimmed)) {
        if (structured.personalInfo) {
          structured.personalInfo.fullName = trimmed;
        }
      }

      // Extract email
      if (!structured.personalInfo?.email && trimmed.includes('@')) {
        if (structured.personalInfo) {
          structured.personalInfo.email = trimmed.replace(/^(Email:|E-mail:)\s*/i, '');
        }
      }

      // Extract phone
      if (!structured.personalInfo?.phone && /(\d{3}[-.]?\d{3}[-.]?\d{4})/.test(trimmed)) {
        if (structured.personalInfo) {
          structured.personalInfo.phone = trimmed.replace(/^(Phone:|Tel:|Mobile:)\s*/i, '');
        }
      }

      // Extract location
      if (!structured.personalInfo?.location && /^(Location:|Address:)/i.test(trimmed)) {
        if (structured.personalInfo) {
          structured.personalInfo.location = trimmed.replace(/^(Location:|Address:)\s*/i, '');
        }
      }

      // Extract summary
      if (trimmed.toLowerCase().includes('summary') || trimmed.toLowerCase().includes('objective')) {
        currentSection = 'summary';
      } else if (currentSection === 'summary') {
        structured.summary += trimmed + ' ';
      }

      // Extract LinkedIn
      if (trimmed.includes('linkedin.com') && structured.personalInfo) {
        structured.personalInfo.linkedin = trimmed;
      }

      // Extract GitHub
      if (trimmed.includes('github.com') && structured.personalInfo) {
        structured.personalInfo.github = trimmed;
      }
    }

    return structured;
  } catch (error) {
    console.error("Error parsing resume text:", error);
    return {
      personalInfo: {
        fullName: "",
        headline: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: ""
      },
      summary: "",
      education: [],
      experience: [],
      projects: [],
      skills: {
        languages: [],
        frameworks: [],
        tools: [],
        libraries: []
      },
      template: "modern"
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateResumeRequest = await req.json();

    // Validate required fields
    if (!body.resumeText || !body.feedback) {
      return NextResponse.json({
        success: false,
        error: "Resume text and feedback are required"
      }, { status: 400 });
    }

    console.log("Generating improved resume for job:", body.jobTitle);

    // Parse the original resume text to get some structure
    const parsedResume = parseResumeTextToStructured(body.resumeText);

    // Prepare the prompt for Claude
    const analysisPrompt = `You are an expert resume writer and ATS optimization specialist. I need you to create an improved resume based on the original resume and the feedback provided.

ORIGINAL RESUME CONTENT:
${body.resumeText.substring(0, 8000)}

JOB TITLE: ${body.jobTitle}
COMPANY: ${body.companyName}
JOB DESCRIPTION: ${body.jobDescription?.substring(0, 2000) || 'Not specified'}

ANALYSIS FEEDBACK:
Overall Score: ${body.feedback.overallScore}/100

ATS Feedback: ${body.feedback.ats}
Tone & Style Feedback: ${body.feedback.toneAndStyle}
Content Feedback: ${body.feedback.content}
Structure Feedback: ${body.feedback.structure}
Skills Feedback: ${body.feedback.skills}

---

INSTRUCTIONS:
1. Create an improved resume that addresses all the feedback points
2. Focus on ATS optimization, better structure, and stronger content
3. Extract and organize information into these structured sections:
   - Personal Info (Name, Contact, Location, LinkedIn, GitHub)
   - Professional Summary (3-4 lines tailored for the target job)
   - Education
   - Experience (with strong, achievement-focused bullet points)
   - Projects
   - Skills (categorized as Languages, Frameworks, Tools, Libraries)
4. For experience bullet points:
   - Start with strong action verbs
   - Quantify achievements where possible
   - Keep to 1-2 lines maximum
   - Focus on results and impact
5. For skills:
   - Extract all technical skills from the resume
   - Categorize them logically
   - Include both hard and soft skills
6. Return the resume in this EXACT JSON format:
{
  "personalInfo": {
    "fullName": "Full Name",
    "headline": "Professional Headline (e.g., 'Software Developer')",
    "email": "email@example.com",
    "phone": "123-456-7890",
    "location": "City, State",
    "website": "portfolio.com (if available)",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username"
  },
  "summary": "3-4 line professional summary focused on the target job",
  "education": [
    {
      "id": 1,
      "institution": "University Name",
      "location": "City, State",
      "degree": "Degree Name",
      "minor": "Minor (if any)",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "gpa": "GPA (if good)"
    }
  ],
  "experience": [
    {
      "id": 1,
      "company": "Company Name",
      "location": "City, State",
      "position": "Job Title",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "description": [
        "Achievement-focused bullet point 1",
        "Achievement-focused bullet point 2",
        "Achievement-focused bullet point 3"
      ]
    }
  ],
  "projects": [
    {
      "id": 1,
      "name": "Project Name",
      "technologies": "Tech Stack",
      "startDate": "Month Year",
      "endDate": "Month Year",
      "description": [
        "Project achievement 1",
        "Project achievement 2"
      ]
    }
  ],
  "skills": {
    "languages": ["JavaScript", "Python", "etc"],
    "frameworks": ["React", "Node.js", "etc"],
    "tools": ["Git", "Docker", "etc"],
    "libraries": ["pandas", "NumPy", "etc"]
  },
  "template": "modern"
}

IMPORTANT: Return ONLY the JSON object, no additional text or explanations.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4000,
      temperature: 0.2,
      system: "You are an expert resume writer. Always respond with valid JSON in the exact format specified. Do not include any markdown formatting or explanations.",
      messages: [
        {
          role: "user",
          content: analysisPrompt
        }
      ]
    });

    // Extract the JSON response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
    
    // Try to extract JSON from the response
    let jsonMatch = responseText.match(/\{[\s\S]*\}/);
    let resumeData: ResumeData;
    
    if (jsonMatch) {
      try {
        resumeData = JSON.parse(jsonMatch[0]);
        
        // Merge with parsed resume data for any missing fields
        if (!resumeData.personalInfo.fullName && parsedResume.personalInfo?.fullName) {
          resumeData.personalInfo.fullName = parsedResume.personalInfo.fullName;
        }
        if (!resumeData.personalInfo.email && parsedResume.personalInfo?.email) {
          resumeData.personalInfo.email = parsedResume.personalInfo.email;
        }
        if (!resumeData.personalInfo.phone && parsedResume.personalInfo?.phone) {
          resumeData.personalInfo.phone = parsedResume.personalInfo.phone;
        }
        if (!resumeData.personalInfo.location && parsedResume.personalInfo?.location) {
          resumeData.personalInfo.location = parsedResume.personalInfo.location;
        }
        
        // Ensure all required fields have values
        resumeData.personalInfo = {
          fullName: resumeData.personalInfo.fullName || "John Doe",
          headline: resumeData.personalInfo.headline || "Professional",
          email: resumeData.personalInfo.email || "email@example.com",
          phone: resumeData.personalInfo.phone || "123-456-7890",
          location: resumeData.personalInfo.location || "City, State",
          website: resumeData.personalInfo.website || "",
          linkedin: resumeData.personalInfo.linkedin || "linkedin.com/in/username",
          github: resumeData.personalInfo.github || "github.com/username"
        };
        
      } catch (parseError) {
        console.error("Error parsing Claude response:", parseError);
        throw new Error("Failed to parse AI response");
      }
    } else {
      throw new Error("No valid JSON found in AI response");
    }

    console.log("✅ Improved resume generated successfully");

    return NextResponse.json({
      success: true,
      resumeData,
      message: "Resume improved and generated successfully"
    });

  } catch (err: any) {
    console.error("❌ API Error:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate improved resume",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Resume Generation API is running",
    endpoint: "POST /api/generate-resume - Generate improved resume from feedback"
  });
}
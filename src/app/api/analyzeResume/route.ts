import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import OpenAI from "openai";
import PdfParse from "pdf-parse";

// Configure Cloudinary (moved outside function for better performance)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize OpenAI once (better performance)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface StructuredFeedback {
  overallScore: number;
  ats: string;
  toneAndStyle: string;
  content: string;
  structure: string;
  skills: string;
}

// Pre-compiled regex patterns for better performance
const SCORE_REGEX = /(\d{1,3})\s*(?:out of 100|score|%|rating)/i;
const NUMBER_REGEX = /\b([0-9]{1,3})\b/;
const SECTION_HEADER_REGEX = /^(?:[0-9]+\.\s+)?\*\*([^*]+)\*\*|^###?\s+([^:]+)|^[A-Z][A-Z\s]+[:\-]/;

// Function to parse AI feedback into structured format
function parseAIFeedbackToStructured(feedbackText: string): StructuredFeedback {
  const defaultFeedback: StructuredFeedback = {
    overallScore: 50,
    ats: "ATS compatibility analysis based on keyword matching and formatting.",
    toneAndStyle: "Professional tone and style assessment.",
    content: "Content relevance and impact analysis.",
    structure: "Document structure and organization evaluation.",
    skills: "Skills alignment and gap analysis."
  };

  try {
    const lines = feedbackText.split('\n');
    let currentSection = '';
    const sections: Record<string, string> = {};
    let overallScore = 50;

    // Extract overall score with pre-compiled regex
    const scoreMatch = feedbackText.match(SCORE_REGEX);
    if (scoreMatch) {
      overallScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1])));
    } else {
      const numberMatch = feedbackText.match(NUMBER_REGEX);
      if (numberMatch) {
        const potentialScore = parseInt(numberMatch[1]);
        if (potentialScore >= 0 && potentialScore <= 100) {
          overallScore = potentialScore;
        }
      }
    }

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue; // Skip empty lines

      // Detect section headers with pre-compiled regex
      if (SECTION_HEADER_REGEX.test(trimmedLine)) {
        const sectionMatch = trimmedLine.toLowerCase();

        // Use switch for better performance with multiple conditions
        if (sectionMatch.includes('ats') || sectionMatch.includes('compatibility')) {
          currentSection = 'ats';
        } else if (sectionMatch.includes('tone') || sectionMatch.includes('style')) {
          currentSection = 'toneAndStyle';
        } else if (sectionMatch.includes('content') || sectionMatch.includes('keyword')) {
          currentSection = 'content';
        } else if (sectionMatch.includes('struct')) {
          currentSection = 'structure';
        } else if (sectionMatch.includes('skill')) {
          currentSection = 'skills';
        } else if (sectionMatch.includes('recommend') || sectionMatch.includes('action')) {
          currentSection = 'ats';
        }

        if (currentSection) {
          sections[currentSection] = trimmedLine + '\n';
        }
      } else if (currentSection && !trimmedLine.match(/^[0-9]+\./)) {
        sections[currentSection] += trimmedLine + '\n';
      }
    }

    // Helper function to get section content safely
    const getSectionContent = (section: string, defaultValue: string) =>
      sections[section]?.substring(0, 1000) || defaultValue;

    return {
      overallScore,
      ats: getSectionContent('ats', "Analysis of ATS compatibility, keyword matching, and formatting recommendations."),
      toneAndStyle: getSectionContent('toneAndStyle', "Evaluation of professional tone, language style, and communication effectiveness."),
      content: getSectionContent('content', "Assessment of content relevance, achievement highlighting, and impact statements."),
      structure: getSectionContent('structure', "Review of document layout, organization, and readability."),
      skills: getSectionContent('skills', "Analysis of technical and soft skills alignment with job requirements.")
    };
  } catch (error) {
    console.error("Error parsing AI feedback:", error);
    return defaultFeedback;
  }
}

// Helper function for text extraction fallback
function extractTextFallback(buffer: Buffer): string {
  try {
    const bufferString = buffer.toString('binary');
    const textMatches = bufferString.match(/\(([^)]+)\)/g);

    if (textMatches) {
      return textMatches
        .map(match =>
          match.slice(1, -1)
            .replace(/\\(.)/g, '$1')
            .replace(/\\n/g, '\n')
        )
        .filter(text => text.length > 3)
        .join(' ');
    }

    return "Text extraction limited. This PDF may be image-based or encrypted. Please ensure your PDF contains selectable text.";
  } catch (error) {
    console.error("Fallback extraction failed:", error);
    return "Unable to extract text from this PDF. The file may be corrupted, encrypted, or image-based.";
  }
}

// Helper function for Cloudinary upload - returns both PDF and image URLs
async function uploadToCloudinary(buffer: Buffer): Promise<{ pdfUrl: string, imageUrl: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto", // Let Cloudinary detect it's a PDF
        folder: "resumes",
        public_id: `resume_${Date.now()}`,
        access_mode: "public",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result && result.secure_url && result.public_id) {
          // Generate image preview URL from the PDF
          const imageUrl = cloudinary.url(result.public_id, {
            format: 'png',
            page: 1, // First page of PDF
            height: 800,
            quality: 'auto',
            flags: 'attachment' // Optional: can remove this for cleaner preview
          });

          resolve({
            pdfUrl: result.secure_url, // Original PDF URL
            imageUrl: imageUrl // Image preview URL
          });
        } else {
          reject(new Error("Cloudinary upload failed: No result returned"));
        }
      }
    );
    uploadStream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now(); // Performance tracking

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jobTitle = formData.get("jobTitle") as string;
    const jobDescription = formData.get("jobDescription") as string;
    const companyName = formData.get("companyName") as string;

    // Validate inputs - optimized validation order
    if (!file) {
      return NextResponse.json({
        success: false,
        error: "No PDF file provided"
      }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({
        success: false,
        error: "Only PDF files are supported"
      }, { status: 400 });
    }

    if (!jobTitle?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({
        success: false,
        error: "Job title and description are required"
      }, { status: 400 });
    }

    console.log("Processing file:", file.name, "Size:", file.size, "bytes");

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let cloudinaryUrl = "";
    let extractedText = "";
    let imageUrl = "";
    // ✅ STEP 1: Extract text and upload to Cloudinary in optimized way
    try {
      // Try pdf-parse first (most reliable)
      const pdfData = await PdfParse(buffer);
      extractedText = pdfData.text;
      console.log("✅ Text extracted via pdf-parse. Length:", extractedText.length, "Pages:", pdfData.numpages);

      // Upload to Cloudinary (non-blocking for text extraction)

      const cloudinaryPromise = uploadToCloudinary(buffer)
        .then(url => {
          cloudinaryUrl = url.pdfUrl;
          imageUrl = url.imageUrl
          console.log("✅ File uploaded to Cloudinary");
        })
        .catch(error => {
          console.error("⚠️ Cloudinary upload failed (non-critical):", error.message);
          // Don't fail the entire request if Cloudinary fails
        });

      // Wait for Cloudinary upload but don't block on failure
      await cloudinaryPromise;

    } catch (parseError) {
      console.error("❌ PDF parsing failed, using fallback:", parseError);
      extractedText = extractTextFallback(buffer);
    }

    // Validate we have enough text for analysis
    if (!extractedText || extractedText.trim().length < 50) {
      console.warn("⚠️ Insufficient text extracted:", extractedText?.length);
      // Continue anyway but note the limitation
    }

    console.log("📊 Final extracted text length:", extractedText.length);

    // ✅ STEP 2: Generate AI Analysis with optimized prompt
    let feedbackText = "";
    try {
      // Optimize prompt - only send necessary content
      const truncatedText = extractedText.length > 12000
        ? extractedText.substring(0, 12000) + "... [content truncated]"
        : extractedText;

      const analysisPrompt = `Analyze this resume against the job description:

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription.substring(0, 2000)}${jobDescription.length > 2000 ? '...' : ''}
RESUME CONTENT: ${truncatedText}

Provide structured feedback in these categories with a score (0-100):

**ATS COMPATIBILITY SCORE**: [number]
**ATS COMPATIBILITY**: [analysis]
**TONE AND STYLE**: [analysis]  
**CONTENT**: [analysis]
**STRUCTURE**: [analysis]
**SKILLS**: [analysis]

Be specific and actionable.`;

      const aiResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Consider gpt-4 for better analysis if available
        messages: [
          {
            role: "system",
            content: `You are an expert ATS consultant. Provide structured, actionable feedback. Always include an overall score (0-100) and detailed analysis.`
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ],
        max_tokens: 2000, // Reduced for cost optimization
        temperature: 0.2
      });

      feedbackText = aiResponse.choices[0]?.message?.content || "No feedback could be generated.";
      console.log("✅ AI analysis completed");

    } catch (aiError: any) {
      console.error("❌ OpenAI API error:", aiError.message);
      feedbackText = "AI analysis is temporarily unavailable. Please try again later.";
    }

    // ✅ STEP 3: Parse AI feedback
    const structuredFeedback = parseAIFeedbackToStructured(feedbackText);
    console.log("✅ Feedback parsed. Overall score:", structuredFeedback.overallScore);

    // Performance logging
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Total processing time: ${processingTime}ms`);

    // ✅ STEP 4: Return successful response
    return NextResponse.json({
      success: true,
      cloudinaryUrl,
      imageUrl,
      feedback: structuredFeedback,
      jobTitle: jobTitle.trim(),
      textLength: extractedText.length,
      processingTime: `${processingTime}ms`,
      message: "Resume analyzed successfully"
    });

  } catch (err: any) {
    console.error("❌ API Error:", err);

    // More specific error handling
    const errorMessage = err.message?.includes('timeout')
      ? "Request timeout. Please try a smaller file."
      : "Analysis failed. Please try again.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}

// Health check with better diagnostics
export async function GET() {
  const envVars = {
    cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
    openai: !!process.env.OPENAI_API_KEY
  };

  return NextResponse.json({
    status: "Resume Analysis API is running",
    timestamp: new Date().toISOString(),
    environment: envVars,
    endpoints: {
      POST: "/api/analyzeResume - Analyze resume PDF"
    }
  });
}
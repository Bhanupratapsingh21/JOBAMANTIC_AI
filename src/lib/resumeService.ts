import { database } from './appwrite';
import { ID, Query, type Models } from 'appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const RESUMES_COLLECTION_ID = process.env.NEXT_PUBLIC_CREATED_RESUME_COLLECTION_ID!;

export interface ResumeData {
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

// Appwrite Document interface that includes all default fields
interface ResumeDocument extends Models.Document {
  userId: string;
  title: string;
  resumeData: string; // Stored as JSON string
  template: string;
  isPublic: boolean;
  shareableUrl?: string;
}

// Our application interface
export interface SavedResume {
  $id: string;
  userId: string;
  title: string;
  resumeData: ResumeData;
  template: string;
  isPublic: boolean;
  shareableUrl?: string;
  $createdAt: string;
  $updatedAt: string;
}

// Helper function to convert Appwrite document to SavedResume
const documentToResume = (doc: ResumeDocument): SavedResume => ({
  $id: doc.$id,
  userId: doc.userId,
  title: doc.title,
  resumeData: JSON.parse(doc.resumeData),
  template: doc.template,
  isPublic: doc.isPublic,
  shareableUrl: doc.shareableUrl,
  $createdAt: doc.$createdAt,
  $updatedAt: doc.$updatedAt
});

export const resumeService = {
  // Save resume to Appwrite
  async saveResume(
    userId: string, 
    resumeData: ResumeData, 
    title: string,
    isPublic: boolean = false
  ): Promise<SavedResume> {
    try {
      const resumeDoc = await database.createDocument(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        ID.unique(),
        {
          userId,
          title: title.trim(),
          resumeData: JSON.stringify(resumeData),
          template: resumeData.template,
          isPublic,
          shareableUrl: isPublic ? ID.unique() : undefined
        }
      ) as ResumeDocument;

      return documentToResume(resumeDoc);
    } catch (error) {
      console.error('Error saving resume:', error);
      throw new Error('Failed to save resume');
    }
  },

  // Get all resumes for a user
  async getUserResumes(userId: string): Promise<SavedResume[]> {
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
      );

      const documents = response.documents as unknown as ResumeDocument[];
      return documents.map(documentToResume);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      throw new Error('Failed to fetch resumes');
    }
  },

  // Get single resume by ID
  async getResume(resumeId: string): Promise<SavedResume> {
    try {
      const resume = await database.getDocument(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        resumeId
      ) as ResumeDocument;

      return documentToResume(resume);
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw new Error('Resume not found');
    }
  },

  // Get public resume by shareable URL
  async getPublicResume(shareableUrl: string): Promise<SavedResume> {
    try {
      const response = await database.listDocuments(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        [Query.equal('shareableUrl', shareableUrl), Query.equal('isPublic', true)]
      );

      if (response.documents.length === 0) {
        throw new Error('Resume not found or not public');
      }

      const resume = response.documents[0] as unknown as ResumeDocument;
      return documentToResume(resume);
    } catch (error) {
      console.error('Error fetching public resume:', error);
      throw new Error('Resume not found');
    }
  },

  // Update resume
  async updateResume(
    resumeId: string,
    updates: Partial<{
      title: string;
      resumeData: ResumeData;
      isPublic: boolean;
    }>
  ): Promise<SavedResume> {
    try {
      const updateData: any = { ...updates };
      
      if (updates.resumeData) {
        updateData.resumeData = JSON.stringify(updates.resumeData);
      }

      // Generate new shareable URL if making public
      if (updates.isPublic === true) {
        updateData.shareableUrl = ID.unique();
      } else if (updates.isPublic === false) {
        updateData.shareableUrl = undefined;
      }

      const updated = await database.updateDocument(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        resumeId,
        updateData
      ) as ResumeDocument;

      return documentToResume(updated);
    } catch (error) {
      console.error('Error updating resume:', error);
      throw new Error('Failed to update resume');
    }
  },

  // Delete resume
  async deleteResume(resumeId: string): Promise<void> {
    try {
      await database.deleteDocument(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        resumeId
      );
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error('Failed to delete resume');
    }
  },

  // Toggle resume visibility
  async toggleResumeVisibility(resumeId: string, isPublic: boolean): Promise<SavedResume> {
    try {
      const updateData: any = { 
        isPublic,
        shareableUrl: isPublic ? ID.unique() : undefined
      };

      const updated = await database.updateDocument(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        resumeId,
        updateData
      ) as ResumeDocument;

      return documentToResume(updated);
    } catch (error) {
      console.error('Error toggling resume visibility:', error);
      throw new Error('Failed to update resume visibility');
    }
  },

  // Check if user owns the resume
  async userOwnsResume(userId: string, resumeId: string): Promise<boolean> {
    try {
      const resume = await this.getResume(resumeId);
      return resume.userId === userId;
    } catch (error) {
      return false;
    }
  }
};
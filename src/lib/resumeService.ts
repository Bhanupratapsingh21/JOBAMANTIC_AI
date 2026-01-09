import { database } from './appwrite';
import { ID, Query, type Models } from 'appwrite';
import { ResumeData } from '../types/resume';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const RESUMES_COLLECTION_ID = process.env.NEXT_PUBLIC_CREATED_RESUME_COLLECTION_ID!;

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

  // Update resume - FIXED VERSION
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

      // Get current resume to check existing shareableUrl
      let currentResume: SavedResume;
      try {
        currentResume = await this.getResume(resumeId);
      } catch (error) {
        console.error('Error fetching current resume:', error);
        throw new Error('Cannot update: Resume not found');
      }

      // Handle public/private status intelligently
      if (updates.isPublic !== undefined) {
        if (updates.isPublic === true) {
          // Only generate new shareableUrl if it doesn't already have one
          if (!currentResume.shareableUrl) {
            updateData.shareableUrl = ID.unique();
          } else {
            // Keep existing shareableUrl
            updateData.shareableUrl = currentResume.shareableUrl;
          }
        } else if (updates.isPublic === false) {
          // When making private, remove shareableUrl
          updateData.shareableUrl = undefined;
        }
      } else {
        // If isPublic is not being updated, keep existing shareableUrl
        updateData.shareableUrl = currentResume.shareableUrl;
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

  // Toggle resume visibility - Also needs fixing
  async toggleResumeVisibility(resumeId: string, isPublic: boolean): Promise<SavedResume> {
    try {
      // Get current resume first
      const currentResume = await this.getResume(resumeId);
      
      const updateData: any = { 
        isPublic,
        shareableUrl: isPublic 
          ? (currentResume.shareableUrl || ID.unique()) // Use existing or create new
          : undefined // Remove when making private
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
  },

  // New helper: Regenerate shareable URL (if needed)
  async regenerateShareableUrl(resumeId: string): Promise<SavedResume> {
    try {
      const currentResume = await this.getResume(resumeId);
      
      if (!currentResume.isPublic) {
        throw new Error('Cannot regenerate URL for private resume');
      }

      const updateData = {
        shareableUrl: ID.unique()
      };

      const updated = await database.updateDocument(
        DATABASE_ID,
        RESUMES_COLLECTION_ID,
        resumeId,
        updateData
      ) as ResumeDocument;

      return documentToResume(updated);
    } catch (error) {
      console.error('Error regenerating shareable URL:', error);
      throw new Error('Failed to regenerate URL');
    }
  }
};
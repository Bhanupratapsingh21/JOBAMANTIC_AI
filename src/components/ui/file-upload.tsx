import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload, IconFileTypePdf, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileUploadProps {
  onChange?: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
}

export const FileUpload = ({
  onChange,
  accept = ".pdf,application/pdf",
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB default
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setError(""); // Clear previous errors
    
    // Validate file type
    const invalidFiles = newFiles.filter(file => {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        return true;
      }
      if (file.size > maxSize) {
        return true;
      }
      return false;
    });

    if (invalidFiles.length > 0) {
      const invalidFile = invalidFiles[0];
      if (invalidFile.size > maxSize) {
        setError(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      } else {
        setError("Please upload PDF files only");
      }
      return;
    }

    // If single file upload, replace existing file
    if (maxFiles === 1) {
      setFiles(newFiles.slice(0, 1));
      onChange && onChange(newFiles.slice(0, 1));
    } else {
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...newFiles].slice(0, maxFiles);
        onChange && onChange(updatedFiles);
        return updatedFiles;
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter((_, i) => i !== index);
      onChange && onChange(newFiles);
      return newFiles;
    });
    setError("");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: maxFiles > 1,
    noClick: true,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: maxSize,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === 'file-too-large') {
          setError(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
        } else if (rejection.errors[0]?.code === 'file-invalid-type') {
          setError("Please upload PDF files only");
        } else {
          setError("File rejected. Please try another PDF file.");
        }
        return;
      }
      handleFileChange(acceptedFiles);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className={cn(
          "p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden",
          "border-2 border-dashed border-gray-300 dark:border-neutral-700",
          "hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/20",
          "transition-colors duration-200",
          error && "border-red-300 dark:border-red-700 hover:border-red-400"
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Upload PDF Resume
          </p>
          <p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            Drag or drop your PDF here or click to upload
          </p>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-20 mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md"
            >
              <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
            </motion.div>
          )}

          <div className="relative w-full mt-6 max-w-xl mx-auto">
            {files.length > 0 ? (
              <div className="space-y-3">
                {files.map((file, idx) => (
                  <motion.div
                    key={"file" + idx}
                    layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                    className={cn(
                      "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex items-start justify-between p-4 w-full rounded-lg",
                      "shadow-sm border border-gray-200 dark:border-neutral-800",
                      "hover:shadow-md transition-shadow duration-200"
                    )}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <IconFileTypePdf className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          layout
                          className="text-base font-medium text-neutral-700 dark:text-neutral-300 truncate"
                        >
                          {file.name}
                        </motion.p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            layout
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          >
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </motion.span>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            layout
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          >
                            PDF
                          </motion.span>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            layout
                            className="text-xs text-neutral-500 dark:text-neutral-500"
                          >
                            Modified {new Date(file.lastModified).toLocaleDateString()}
                          </motion.span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                    >
                      <IconX className="h-4 w-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300" />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center h-32 w-full max-w-[10rem] mx-auto rounded-lg",
                  "shadow-[0px_10px_30px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-neutral-800",
                  "hover:border-sky-300 dark:hover:border-sky-600 transition-all duration-200"
                )}
              >
                {isDragActive ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-neutral-600 dark:text-neutral-400 flex flex-col items-center space-y-2"
                  >
                    <IconUpload className="h-8 w-8" />
                    <p className="text-sm font-medium">Drop PDF here</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center space-y-2"
                  >
                    <IconFileTypePdf className="h-8 w-8 text-red-500" />
                    <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      PDF File
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      Click to browse
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border-2 border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 w-full max-w-[10rem] mx-auto rounded-lg"
              ></motion.div>
            )}
          </div>

          {/* Help text */}
          {!files.length && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative z-20 mt-4 text-center"
            >
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                Supports PDF files up to {(maxSize / (1024 * 1024)).toFixed(0)}MB
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
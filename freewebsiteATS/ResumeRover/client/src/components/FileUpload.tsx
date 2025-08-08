import React, { useState, useRef } from "react";
import { CloudUpload, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function FileUpload({ onFileSelect, selectedFile }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a PDF, DOC, or DOCX file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          className={cn(
            "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragOver && "border-primary bg-blue-50"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="upload-dropzone"
        >
          <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">Drag and drop your resume here</p>
          <p className="text-gray-500 mb-4">or click to browse</p>
          <p className="text-sm text-gray-400">Supported formats: PDF, DOC, DOCX (Max 5MB)</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileInputChange}
            className="hidden"
            data-testid="file-input"
          />
        </div>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg" data-testid="file-preview">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="text-red-500 h-6 w-6 mr-3" />
              <div>
                <p className="font-medium text-gray-900" data-testid="file-name">{selectedFile.name}</p>
                <p className="text-sm text-gray-500" data-testid="file-size">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              data-testid="button-remove-file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {selectedFile && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2" data-testid="resume-summary-title">Resume Uploaded</h4>
          <p className="text-sm text-gray-600" data-testid="resume-ready-message">
            Your resume is ready for analysis. Please fill in the job description and click "Analyze Resume Match".
          </p>
        </div>
      )}
    </div>
  );
}

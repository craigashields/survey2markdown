import React, { useRef, useState, useCallback } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UploadAreaProps {
  onFilesSelected: (files: FileList | File[]) => void;
}

export default function UploadArea({ onFilesSelected }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        onFilesSelected(e.dataTransfer.files);
      }
    },
    [onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files);
        e.target.value = ""; // Allow re-upload of same file
      }
    },
    [onFilesSelected]
  );

  return (
    <>
      <Card
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`transition-all duration-200 cursor-pointer ${
          isDragOver
            ? "border-blue-500 bg-blue-50 border-2 border-dashed"
            : "border-gray-300 border-2 border-dashed hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <div
            className={`p-4 rounded-full mb-4 ${
              isDragOver ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <Upload
              className={`w-8 h-8 ${
                isDragOver ? "text-blue-600" : "text-gray-600"
              }`}
            />
          </div>

          <div className="text-center space-y-2">
            <p
              className={`text-lg font-medium ${
                isDragOver ? "text-blue-900" : "text-gray-900"
              }`}
            >
              {isDragOver
                ? "Drop your files here"
                : "Choose files or drag and drop"}
            </p>
            <p className="text-sm text-gray-500">
              Excel files (.xlsx) up to 10MB each
            </p>
          </div>

          <Button
            variant="outline"
            className="mt-4 bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Files
          </Button>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
    </>
  );
}

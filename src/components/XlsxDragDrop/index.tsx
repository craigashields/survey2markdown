"use client";

import React, { useCallback, useRef, useState } from "react";
import UploadArea from "./UploadArea";
import FileList, { UploadedFile } from "./FileList";
import MarkdownOutput, { MarkdownOutput as Output } from "./MarkdownOutput";
import { convertToMarkdown } from "@/lib/markdown";
import * as XLSX from "xlsx";

export default function XlsxDragDrop() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [markdownOutputs, setMarkdownOutputs] = useState<Output[]>([]);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [outputMode, setOutputMode] = useState<"combined" | "separate">(
    "combined"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{
    total: number;
    completed: number;
  }>({ total: 0, completed: 0 });

  const validateFile = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return "Only .xlsx files are allowed";
    }
    if (file.size > 10 * 1024 * 1024) {
      return "File size must be under 10MB";
    }

    return null;
  };

  const processFile = (file: File): Promise<UploadedFile> => {
    return new Promise((resolve) => {
      const id = Math.random().toString(36).substr(2, 9);
      const error = validateFile(file);

      const baseFile: UploadedFile = {
        file,
        id,
        status: error ? "error" : "uploading",
        error: error || undefined,
      };

      if (error) {
        resolve(baseFile);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          const sheets: { [key: string]: any[][] } = {};
          workbook.SheetNames.forEach((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            sheets[sheetName] = jsonData as any[][];
          });

          resolve({
            ...baseFile,
            status: "success",
            data: {
              sheets,
              sheetNames: workbook.SheetNames,
            },
          });
        } catch {
          resolve({
            ...baseFile,
            status: "error",
            error: "Failed to parse Excel file",
          });
        }
      };

      reader.onerror = () => {
        resolve({
          ...baseFile,
          status: "error",
          error: "File reading failed",
        });
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const MAX_CONCURRENT = 3;

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const queue = [...fileArray];
    const results: UploadedFile[] = [];
    const active: Promise<void>[] = [];

    setProcessingProgress({
      total: fileArray.length,
      completed: 0,
    });

    async function handleFile(file: File) {
      const result = await processFile(file);
      results.push(result);
      setUploadedFiles((prev) => [...prev, result]);
      setProcessingProgress((prev) => ({
        ...prev,
        completed: prev.completed + 1,
      }));
    }

    while (queue.length > 0) {
      while (active.length < MAX_CONCURRENT && queue.length > 0) {
        const file = queue.shift()!;
        const task = handleFile(file);
        active.push(task);
        task.finally(() => {
          const idx = active.indexOf(task);
          if (idx > -1) active.splice(idx, 1);
        });
      }

      await Promise.race(active);
    }

    await Promise.all(active);
  };

  // const processFiles = useCallback((files: FileList | File[]) => {
  //   const fileArray = Array.from(files);

  //   fileArray.forEach((file) => {
  //     const id = Math.random().toString(36).substr(2, 9);
  //     const error = validateFile(file);

  //     const uploadedFile: UploadedFile = {
  //       file,
  //       id,
  //       status: error ? "error" : "uploading",
  //       error: error ?? undefined,
  //     };

  //     setUploadedFiles((prev) => [...prev, uploadedFile]);

  //     if (!error) {
  //       const reader = new FileReader();
  //       reader.onload = (e) => {
  //         try {
  //           const data = new Uint8Array(e.target?.result as ArrayBuffer);
  //           const workbook = XLSX.read(data, { type: "array" });

  //           const sheets: { [key: string]: any[][] } = {};
  //           workbook.SheetNames.forEach((sheetName) => {
  //             const worksheet = workbook.Sheets[sheetName];
  //             const jsonData = XLSX.utils.sheet_to_json(worksheet, {
  //               header: 1,
  //             });
  //             sheets[sheetName] = jsonData as any[][];
  //           });

  //           setUploadedFiles((prev) =>
  //             prev.map((f) =>
  //               f.id === id
  //                 ? {
  //                     ...f,
  //                     status: "success",
  //                     data: {
  //                       sheets,
  //                       sheetNames: workbook.SheetNames,
  //                     },
  //                   }
  //                 : f
  //             )
  //           );
  //         } catch {
  //           setUploadedFiles((prev) =>
  //             prev.map((f) =>
  //               f.id === id
  //                 ? {
  //                     ...f,
  //                     status: "error",
  //                     error: "Failed to parse Excel file",
  //                   }
  //                 : f
  //             )
  //           );
  //         }
  //       };
  //       reader.readAsArrayBuffer(file);
  //     }
  //   });
  // }, []);

  const removeFile = useCallback(
    (id: string) => {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
      if (previewFile === id) {
        setPreviewFile(null);
        setSelectedSheet("");
      }
    },
    [previewFile]
  );

  const togglePreview = useCallback(
    (fileId: string) => {
      if (previewFile === fileId) {
        setPreviewFile(null);
        setSelectedSheet("");
      } else {
        setPreviewFile(fileId);
        const file = uploadedFiles.find((f) => f.id === fileId);
        if (file?.data?.sheetNames.length) {
          setSelectedSheet(file.data.sheetNames[0]);
        }
      }
    },
    [previewFile, uploadedFiles]
  );

  const handleProcessFiles = async () => {
    const successfulFiles = uploadedFiles.filter((f) => f.status === "success");
    if (successfulFiles.length === 0) return;

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1000)); // simulate load
    const outputs = convertToMarkdown(successfulFiles, outputMode);
    setMarkdownOutputs(outputs);
    setShowMarkdown(true);
    setIsProcessing(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">SurveyMD</h2>
        <p className="text-gray-600">
          Upload your Microsoft Form results from Excel files and convert them
          into clean markdown summaries, perfect for use with AI.
        </p>
      </div>

      <UploadArea onFilesSelected={processFiles} />
      {processingProgress.total > 0 &&
        processingProgress.completed < processingProgress.total && (
          <div className="text-sm text-gray-600 text-center">
            Parsing files: {processingProgress.completed} of{" "}
            {processingProgress.total}
          </div>
        )}
      {uploadedFiles.some((f) => f.status === "success") && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Output Mode:</label>
            <label className="text-sm">
              <input
                type="radio"
                checked={outputMode === "combined"}
                onChange={() => setOutputMode("combined")}
                className="mr-1"
              />
              Combined
            </label>
            <label className="text-sm">
              <input
                type="radio"
                checked={outputMode === "separate"}
                onChange={() => setOutputMode("separate")}
                className="mr-1"
              />
              Separate
            </label>
          </div>

          <div className="flex justify-center">
            <button
              disabled={isProcessing}
              onClick={handleProcessFiles}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Convert to Markdown"}
            </button>
          </div>
        </div>
      )}

      {showMarkdown && markdownOutputs.length > 0 && (
        <MarkdownOutput
          outputs={markdownOutputs}
          onClose={() => setShowMarkdown(false)}
        />
      )}
      {uploadedFiles.length > 0 && (
        <FileList
          files={uploadedFiles}
          previewFileId={previewFile}
          selectedSheet={selectedSheet}
          onRemove={removeFile}
          onTogglePreview={togglePreview}
          onSheetChange={setSelectedSheet}
        />
      )}
    </div>
  );
}

import React from "react";
import { FileSpreadsheet, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { excelDateToString } from "@/lib/utils";

export interface UploadedFile {
  file: File;
  id: string;
  status: "uploading" | "success" | "error";
  error?: string;
  data?: {
    sheets: { [key: string]: any[][] };
    sheetNames: string[];
  };
}

interface FileListProps {
  files: UploadedFile[];
  previewFileId: string | null;
  selectedSheet: string;
  onRemove: (id: string) => void;
  onTogglePreview: (id: string) => void;
  onSheetChange: (sheetName: string) => void;
}

export default function FileList({
  files,
  previewFileId,
  selectedSheet,
  onRemove,
  onTogglePreview,
  onSheetChange,
}: FileListProps) {
  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
      case "success":
        return <Check className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return "bg-blue-50 border-blue-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
    }
  };

  const renderPreviewTable = (data: any[][], maxRows = 10) => {
    if (!data || data.length === 0) {
      return (
        <p className="text-gray-500 text-center py-4">No data to preview</p>
      );
    }

    const headers = data[0] || [];
    const rows = data.slice(1, maxRows + 1);

    return (
      <div className="overflow-x-auto border rounded-lg mt-4">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header: any, index: number) => (
                <th
                  key={index}
                  className="px-4 py-2 text-left text-gray-600 font-medium text-ellipsis max-w-[200px] whitespace-nowrap overflow-hidden"
                >
                  {header || `Column ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex}>
                {headers.map((_: any, colIndex: number) => (
                  <td
                    key={colIndex}
                    className="px-4 py-1 text-sm text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
                    title={String(row[colIndex] || "")}
                  >
                    {(() => {
                      const val = row[colIndex];
                      if (
                        typeof val === "number" &&
                        val > 20000 &&
                        val < 60000
                      ) {
                        return excelDateToString(val);
                      }
                      return String(val || "").slice(0, 100);
                    })()}{" "}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > maxRows + 1 && (
          <div className="bg-gray-50 px-4 py-2 text-sm text-gray-500 text-center">
            Showing {maxRows} of {data.length - 1} rows
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <div key={file.id}>
          <Card className={`${getStatusColor(file.status)} border`}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileSpreadsheet className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.file.name}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                    <span>{(file.file.size / 1024).toFixed(1)} KB</span>
                    {file.data && (
                      <span>{file.data.sheetNames.length} sheet(s)</span>
                    )}
                    {file.status === "success" && (
                      <Badge className="bg-green-100 text-green-800">
                        Uploaded
                      </Badge>
                    )}
                    {file.status === "uploading" && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Parsing...
                      </Badge>
                    )}
                    {file.status === "error" && (
                      <Badge variant="destructive">Error</Badge>
                    )}
                  </div>
                  {file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.status === "success" && file.data && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTogglePreview(file.id)}
                  >
                    {previewFileId === file.id ? "Hide Preview" : "Preview"}
                  </Button>
                )}
                {getStatusIcon(file.status)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(file.id)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Table */}
          {previewFileId === file.id && file.data && (
            <Card className="border-blue-200 bg-blue-50 mt-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Data Preview
                  </h4>
                  {file.data.sheetNames.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">
                        Sheet:
                      </label>
                      <select
                        value={selectedSheet}
                        onChange={(e) => onSheetChange(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                      >
                        {file.data.sheetNames.map((sheetName) => (
                          <option key={sheetName} value={sheetName}>
                            {sheetName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {selectedSheet &&
                  file.data.sheets[selectedSheet] &&
                  renderPreviewTable(file.data.sheets[selectedSheet])}
              </CardContent>
            </Card>
          )}
        </div>
      ))}
    </div>
  );
}

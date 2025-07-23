import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download } from "lucide-react";
import JSZip from "jszip";

export interface MarkdownOutput {
  filename: string;
  content: string;
}

interface MarkdownOutputProps {
  outputs: MarkdownOutput[];
  onClose: () => void;
}

export default function MarkdownOutput({
  outputs,
  onClose,
}: MarkdownOutputProps) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  const downloadMarkdown = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    if (outputs.length === 1) {
      // Download single file directly
      const { filename, content } = outputs[0];
      downloadMarkdown(filename, content);
    } else {
      // Bundle multiple files into a ZIP
      const zip = new JSZip();

      outputs.forEach(({ filename, content }) => {
        zip.file(filename, content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "survey-markdown-files.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="border-green-200 bg-green-50 mt-6">
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Markdown Output ({outputs.length} file
            {outputs.length > 1 ? "s" : ""})
          </h3>
          <div className="flex space-x-2">
            {outputs.length > 1 ? (
              <Button variant="outline" size="sm" onClick={downloadAll}>
                <Download className="w-4 h-4 mr-1" />
                Download {outputs.length > 1 ? "ZIP" : ".md"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(outputs[0].content)}
                >
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    downloadMarkdown(outputs[0].filename, outputs[0].content)
                  }
                >
                  Download
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {outputs.map(({ filename, content }, index) => (
            <div key={index} className="space-y-2">
              {outputs.length > 1 && (
                <h4 className="text-md font-medium text-gray-800">
                  {filename}
                </h4>
              )}
              <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                  {content}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

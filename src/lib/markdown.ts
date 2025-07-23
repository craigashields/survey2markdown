import { excelDateToString } from "@/lib/utils";

export interface UploadedFile {
  file: File;
  id: string;
  status: "uploading" | "success" | "error";
  error?: string;
  data?: {
    sheets: { [key: string]: SheetData };
    sheetNames: string[];
  };
}

type SheetRow = (string | number | boolean | null | undefined)[];
type SheetData = SheetRow[];

export interface MarkdownOutput {
  filename: string;
  content: string;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "").replace(/\s+/g, "-");
}

type OutputMode = "combined" | "separate";

export function convertSingleFileToMarkdown(file: UploadedFile): string {
  let markdown = `# Survey Results - ${file.file.name}\n\n`;

  if (file.status === "success" && file.data) {
    file.data.sheetNames.forEach((sheetName) => {
      const sheetData = file.data!.sheets[sheetName];

      if (file.data!.sheetNames.length > 1) {
        markdown += `## ${sheetName}\n\n`;
      }

      if (sheetData && sheetData.length > 1) {
        const questions = sheetData[0] || [];
        const responses = sheetData.slice(1);

        responses.forEach((response, participantIndex) => {
          markdown += `### Participant ${participantIndex + 1}\n\n`;

          questions.forEach((question, questionIndex) => {
            const questionStr = String(question || "").trim();
            if (questionStr) {
              const answer = response[questionIndex];
              let formattedAnswer = "*No response*";

              if (answer !== undefined && answer !== null && answer !== "") {
                if (
                  typeof answer === "number" &&
                  answer > 20000 &&
                  answer < 60000
                ) {
                  formattedAnswer = excelDateToString(answer);
                } else {
                  formattedAnswer = String(answer).trim();
                }
              }

              markdown += `**${questionStr}**: ${formattedAnswer}\n\n`;
            }
          });
        });

        markdown += `*Total participants: ${responses.length}*\n\n`;
      } else if (sheetData && sheetData.length === 1) {
        markdown += "*Only headers found, no participant responses*\n\n";
      } else {
        markdown += "*No data found in this sheet*\n\n";
      }
    });
  }

  return markdown;
}

export function convertToMarkdown(
  files: UploadedFile[],
  mode: OutputMode
): MarkdownOutput[] {
  if (mode === "separate") {
    return files
      .filter((file) => file.status === "success")
      .map((file) => ({
        filename: sanitizeFileName(file.file.name.replace(/\.xlsx$/, ".md")),
        content: convertSingleFileToMarkdown(file),
      }));
  } else {
    let combinedMarkdown = "# Combined Survey Results\n\n";

    files.forEach((file, index) => {
      if (file.status === "success") {
        combinedMarkdown += `## Survey: ${file.file.name}\n\n`;
        combinedMarkdown += convertSingleFileToMarkdown(file);

        if (index < files.length - 1) {
          combinedMarkdown += "---\n\n";
        }
      }
    });

    return [
      {
        filename: "combined-survey-results.md",
        content: combinedMarkdown,
      },
    ];
  }
}

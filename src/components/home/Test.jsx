import React, { useState, useCallback, useEffect } from "react";
import { ArrowLeftRight, Copy, Trash, Upload } from "lucide-react";
import { createPatch } from "diff";
import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import htmldiff from "htmldiff-js";
import { cleanupText } from "../../utils/cleantext";

const Test = ({ leftTextImport, rightTextImport }) => {
  // Clean up the input texts.
  const left_text = cleanupText(leftTextImport, {
    trimLines: true,
    singleSpaces: false,
    singleNewlines: true,
    noEmptyLines: true,
  });
  const right_text = cleanupText(rightTextImport, {
    trimLines: true,
    singleSpaces: false,
    singleNewlines: true,
    noEmptyLines: true,
  });

  const [leftText, setLeftText] = useState(left_text);
  const [rightText, setRightText] = useState(right_text);
  const [diffHtml, setDiffOutput] = useState("");
  // Instead of storing every changed tr id, we store only one id per changed section.
  const [changeIds, setChangeIds] = useState([]);
  const [curChangeIndex, setCurChangeIndex] = useState(-1);

  const generateDiff = useCallback(() => {
    const patch = createPatch("text", leftText, rightText, "", "", {
      context: Number.MAX_SAFE_INTEGER,
    });
    const diffOutput = html(patch, {
      drawFileList: false,
      matching: "words",
      outputFormat: "side-by-side",
      renderNothingWhenEmpty: true,
    });
    setDiffOutput(diffOutput);
  }, [leftText, rightText]);

  const swapTexts = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  };

  const clearTexts = () => {
    setLeftText("");
    setRightText("");
    setDiffOutput("");
    setChangeIds([]);
    setCurChangeIndex(-1);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleFileUpload = (side) => async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (side === "left") {
        setLeftText(text);
      } else {
        setRightText(text);
      }
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    }
  };

  // Synchronize row heights as before.
  useEffect(() => {
    if (diffHtml) {
      setTimeout(() => {
        const leftTableBody = document.querySelector(
          ".diff-container .d2h-file-side-diff:first-child .d2h-diff-tbody"
        );
        const rightTableBody = document.querySelector(
          ".diff-container .d2h-file-side-diff:last-child .d2h-diff-tbody"
        );
        if (leftTableBody && rightTableBody) {
          const leftRows = leftTableBody.querySelectorAll("tr");
          const rightRows = rightTableBody.querySelectorAll("tr");
          const numRows = Math.min(leftRows.length, rightRows.length);
          for (let i = 0; i < numRows; i++) {
            const leftRow = leftRows[i];
            const rightRow = rightRows[i];
            const maxHeight = Math.max(
              leftRow.offsetHeight,
              rightRow.offsetHeight
            );
            leftRow.style.height = `${maxHeight}px`;
            rightRow.style.height = `${maxHeight}px`;
          }
        }
      }, 0);
    }
  }, [diffHtml]);

  // Group consecutive changed rows (changed section) instead of counting every tr.
  useEffect(() => {
    if (diffHtml) {
      setTimeout(() => {
        const diffContainer = document.querySelector(".diff-container");
        if (!diffContainer) return;
        const rows = diffContainer.querySelectorAll("tr");
        const groupIds = [];
        let groupStarted = false;
        rows.forEach((row) => {
          const isChanged =
            row.querySelector(".d2h-del") || row.querySelector(".d2h-ins");
          if (isChanged) {
            if (!groupStarted) {
              // Mark the start of a new group.
              if (!row.id) {
                row.id = "change-group-" + groupIds.length;
              }
              groupIds.push(row.id);
              groupStarted = true;
            }
          } else {
            groupStarted = false;
          }
        });
        setChangeIds(groupIds);
        setCurChangeIndex(-1);
      }, 0);
    }
  }, [diffHtml]);

  // Scroll to the next or previous change section.
  const scrollChange = (direction = ">") => {
    if (changeIds.length === 0) return;
    let newIndex = curChangeIndex;
    if (direction === ">") {
      newIndex = curChangeIndex + 1;
    } else {
      newIndex = curChangeIndex - 1;
    }
    if (newIndex >= changeIds.length) {
      newIndex = 0;
    }
    if (newIndex < 0) {
      newIndex = changeIds.length - 1;
    }
    const targetElement = document.getElementById(changeIds[newIndex]);
    if (!targetElement) return;
    targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
    // Apply a simple highlight.
    targetElement.style.backgroundColor = "#fae69e";
    targetElement.style.padding = "5px";
    setCurChangeIndex(newIndex);
  };

  // Optional: Keyboard shortcuts for Alt+Left/Right.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "ArrowLeft") {
        scrollChange("<");
      } else if (e.altKey && e.key === "ArrowRight") {
        scrollChange(">");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [changeIds, curChangeIndex]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Text Diff Checker
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Compare text or code files side by side
          </p>
        </div>
      </header>

      <main className="max-w-8xl mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={generateDiff}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Compare Text
          </button>
          <button
            onClick={swapTexts}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" /> Swap
          </button>
          <button
            onClick={clearTexts}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash className="w-4 h-4" /> Clear
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Original Text
              </label>
              <div className="flex gap-2">
                <label
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  title="Upload file"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    onChange={handleFileUpload("left")}
                    className="hidden"
                    accept=".txt,.html,.css,.js,.jsx,.ts,.tsx,.json,.md"
                  />
                </label>
                <button
                  onClick={() => copyToClipboard(leftText)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Enter or upload original text here..."
            />
          </div>
          <div className="relative">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Modified Text
              </label>
              <div className="flex gap-2">
                <label
                  className="cursor-pointer text-gray-500 hover:text-gray-700"
                  title="Upload file"
                >
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    onChange={handleFileUpload("right")}
                    className="hidden"
                    accept=".txt,.html,.css,.js,.jsx,.ts,.tsx,.json,.md"
                  />
                </label>
                <button
                  onClick={() => copyToClipboard(rightText)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Enter or upload modified text here..."
            />
          </div>
        </div>

        {diffHtml && (
          <div className="bg-white rounded-lg shadow-lg p-2 relative">
            <h2 className="text-xl font-semibold mb-4">Comparison Result</h2>
            {/* Custom CSS to adjust text wrapping and reduce internal spacing */}
            <style>{`
              .diff-container .d2h-code-line,
              .diff-container .d2h-code-line-ctn {
                white-space: pre-wrap;
                word-break: break-all;
              }
              .diff-container .d2h-code-wrapper {
                padding: 0.25rem !important;
              }
              .diff-container .d2h-diff-table td {
                padding: 0.25rem !important;
              }
            `}</style>
            <div
              className="diff-container"
              dangerouslySetInnerHTML={{ __html: diffHtml }}
            />
            {/* Navigation buttons for changed sections */}
            {changeIds.length > 0 && (
              <div className="fixed z-20 top-64 right-6 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
                <button
                  onClick={() => scrollChange("<")}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                  title="Previous change (Alt + ←)"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {curChangeIndex + 1} / {changeIds.length}
                </span>
                <button
                  onClick={() => scrollChange(">")}
                  className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                  title="Next change (Alt + →)"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Test;

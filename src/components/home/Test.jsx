import React, { useState, useCallback } from "react";
import { ArrowLeftRight, Copy, Trash, Upload } from "lucide-react";
import { createPatch } from "diff";
import { html } from "diff2html";
import "diff2html/bundles/css/diff2html.min.css";
import htmldiff from "htmldiff-js";

const Test = () => {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffHtml, setDiffOutput] = useState("");
  console.log("dfdf", diffHtml);

  const generateDiff = useCallback(() => {
    const patch = createPatch("text", leftText, rightText, "", "");
    const diffOutput = new htmldiff(leftText, rightText);
    const diffOutput1 = html(patch, {
      drawFileList: false,
      matching: "words",
      outputFormat: "side-by-side",
      renderNothingWhenEmpty: true,
    });
    const text1 = extractTextUsingDOMParser(diffOutput1);
    setDiffOutput(text1);
    // console.log("htmltext", text1);
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

  function extractTextUsingDOMParser(htmlDocument) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlDocument, "text/html");
      // Remove script and style elements
      const scripts = doc.getElementsByTagName("script");
      const styles = doc.getElementsByTagName("style");

      [...scripts, ...styles].forEach((element) => {
        element.remove();
      });

      return doc.body.textContent.trim().replace(/\s+/g, " "); // Replace multiple spaces with single space
    } catch (error) {
      console.error("Error parsing HTML:", error);
      return "";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Text Diff Checker
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Compare text or code files side by side
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
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
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Comparison Result</h2>
            <div
              className="diff-container"
              dangerouslySetInnerHTML={{ __html: diffHtml }}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Test;

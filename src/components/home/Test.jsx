import React, { useState } from "react";
import * as Diff from "diff";
// import "./home.css";

const FileDiffChecker = () => {
  const [text1, setText1] = useState("");
  const [text2, setText2] = useState("");
  const [lines, setLines] = useState({ left: [], right: [] });

  const handleFile = (setText) => (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
  };

  const compareTexts = () => {
    const diff = Diff.diffLines(text1, text2, { newlineIsToken: true });
    const left = [];
    const right = [];

    diff.forEach((part) => {
      const lines = part.value.replace(/\n$/, "").split("\n");

      lines.forEach((line) => {
        if (part.added) {
          right.push({ content: line, type: "added" });
          left.push({ content: "\u00A0", type: "empty" });
        } else if (part.removed) {
          left.push({ content: line, type: "removed" });
          right.push({ content: "\u00A0", type: "empty" });
        } else {
          left.push({ content: line, type: "unchanged" });
          right.push({ content: line, type: "unchanged" });
        }
      });
    });

    setLines({ left, right });
  };

  return (
    <div className="container">
      <h1>Text File Diff Checker</h1>

      <div className="file-inputs">
        <input type="file" onChange={handleFile(setText1)} accept=".txt" />
        <input type="file" onChange={handleFile(setText2)} accept=".txt" />
      </div>

      <button onClick={compareTexts} disabled={!text1 || !text2}>
        Compare Files
      </button>

      <div className="diff-container">
        <div className="diff-side">
          <h3>Original File</h3>
          <div className="diff-content">
            {lines.left.map((line, i) => (
              <div key={i} className={`line ${line.type}`}>
                {line.content}
              </div>
            ))}
          </div>
        </div>

        <div className="diff-side">
          <h3>Modified File</h3>
          <div className="diff-content">
            {lines.right.map((line, i) => (
              <div key={i} className={`line ${line.type}`}>
                {line.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDiffChecker;

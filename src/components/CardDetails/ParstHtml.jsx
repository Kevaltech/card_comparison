import React, { useState, useEffect } from "react";

// Utility function to parse the HTML string and extract left/right sections
function parseComparisonHtml(htmlString) {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Query for left and right diff elements.
  // Adjust selectors if needed based on your actual HTML structure.
  const leftElements = Array.from(doc.querySelectorAll(".diff-left"));
  const rightElements = Array.from(doc.querySelectorAll(".diff-right"));

  // Determine the maximum number of rows (pairing by index)
  const maxRows = Math.max(leftElements.length, rightElements.length);
  const pairs = [];
  for (let i = 0; i < maxRows; i++) {
    const leftHtml = leftElements[i] ? leftElements[i].outerHTML : "";
    const rightHtml = rightElements[i] ? rightElements[i].outerHTML : "";
    pairs.push({ left: leftHtml, right: rightHtml });
  }
  return pairs;
}

const AlignedComparison = ({ htmlContent }) => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (htmlContent) {
      const parsedRows = parseComparisonHtml(htmlContent);
      setRows(parsedRows);
    }
  }, [htmlContent]);

  return (
    <div style={{ padding: "20px" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Left Section</th>
            <th style={styles.th}>Right Section</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx}>
              <td
                style={styles.td}
                dangerouslySetInnerHTML={{ __html: row.left }}
              />
              <td
                style={styles.td}
                dangerouslySetInnerHTML={{ __html: row.right }}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "1rem",
  },
  th: {
    border: "1px solid #e0e0e0",
    padding: "8px",
    backgroundColor: "#f8f9fa",
    textAlign: "left",
    textTransform: "uppercase",
    fontSize: "0.85rem",
  },
  td: {
    border: "1px solid #e0e0e0",
    padding: "8px",
    verticalAlign: "top",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  },
};

export default AlignedComparison;

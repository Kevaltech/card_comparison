import React, { useState, useEffect } from "react";

const DiffNavigation = () => {
  const [diffIds, setDiffIds] = useState([]);
  const [curScrollLineIndex, setCurScrollLineIndex] = useState(-1);

  const initializeDiffNavigation = () => {
    // Get currently displayed tab
    const activeTab = document.querySelector(
      '.tab-content[style="display: flex;"]'
    );
    if (!activeTab) return;

    // Get all elements with IDs (these are our diff elements)
    const diffElements = activeTab.querySelectorAll("[id]");
    const newDiffIds = Array.from(diffElements)
      .filter(
        (el) =>
          el.id &&
          (el.tagName.toLowerCase() === "del" ||
            el.tagName.toLowerCase() === "span")
      )
      .map((el) => el.id);

    setDiffIds(newDiffIds);
    setCurScrollLineIndex(-1);
  };

  const scrollDiff = (direction = ">") => {
    if (diffIds.length === 0) {
      return;
    }

    let newIndex;
    if (direction === ">") {
      newIndex = curScrollLineIndex + 1;
    } else {
      newIndex = curScrollLineIndex - 1;
    }

    if (newIndex >= diffIds.length) {
      newIndex = 0;
    }
    if (newIndex < 0) {
      newIndex = diffIds.length - 1;
    }

    // Get the current element
    const currentElement = document.getElementById(diffIds[newIndex]);
    if (!currentElement) return;

    // Scroll to the element
    currentElement.scrollIntoView({ behavior: "smooth", block: "center" });

    // Get the element's color for the border
    const borderColor = currentElement.style.color;

    // Add border to current element
    if (currentElement.children.length > 0) {
      // If span has child elements, apply outline to them
      currentElement.style.border = `2px solid ${borderColor}`;
      currentElement.querySelectorAll("*").forEach((el) => {
        el.style.border = `2px solid ${borderColor}`;
      });
    } else {
      // If no child elements, apply a highlight (background + border)
      //   currentElement.style.backgroundColor = "rgba(80, 205, 137, 0.2)"; // Light highlight
      currentElement.style.border = `2px solid ${borderColor}`;
    }

    // Clear previous outline
    const prevElement = document.getElementById(
      diffIds[newIndex - 1 < 0 ? diffIds.length - 1 : newIndex - 1]
    );
    if (prevElement) prevElement.style.border = "";

    // Clear next outline
    const nextElement = document.getElementById(
      diffIds[newIndex + 1 >= diffIds.length ? 0 : newIndex + 1]
    );
    if (nextElement) nextElement.style.border = "";

    setCurScrollLineIndex(newIndex);
  };

  useEffect(() => {
    // Initialize on mount
    initializeDiffNavigation();

    // Add tab change listener
    const handleTabClick = (e) => {
      if (e.target.classList.contains("tab-btn")) {
        setTimeout(initializeDiffNavigation, 100);
      }
    };

    // Add keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "ArrowLeft") {
        scrollDiff("<");
      } else if (e.altKey && e.key === "ArrowRight") {
        scrollDiff(">");
      }
    };

    document.addEventListener("click", handleTabClick);
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("click", handleTabClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
      <button
        onClick={() => scrollDiff("<")}
        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
        title="Previous change (Alt + ←)"
      >
        ← Previous
      </button>
      <span className="text-sm text-gray-600 px-2">
        {curScrollLineIndex + 1} / {diffIds.length}
      </span>
      <button
        onClick={() => scrollDiff(">")}
        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
        title="Next change (Alt + →)"
      >
        Next →
      </button>
    </div>
  );
};

export default DiffNavigation;

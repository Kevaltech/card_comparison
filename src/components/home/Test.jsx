import React, { useState, useEffect, useRef } from "react";
import { ArrowLeftRight, Copy, Trash, Upload } from "lucide-react";
import { createPatch } from "diff";
import { html } from "diff2html";
// import "diff2html/bundles/css/diff2html.min.css";
import { cleanupText } from "../../utils/cleantext";
import DiffNavigation from "../CardDetails/DiffNavigation";

const Test = ({ changes, Diff, handleDiff, handleAll }) => {
  /**
   * changes is an array of objects like:
   * [
   *   { 'old_content_1': "old content", 'new_content_1': "new content" },
   *   { 'old_content_2': "old content", 'new_content_2': "new content" },
   *   { 'old_content_3': "old content", 'new_content_3': "new content" },
   * ]
   */
  const [tabsData, setTabsData] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [curChangeIndex, setCurChangeIndex] = useState(-1);
  const [activeDiffHtml, setActiveDiffHtml] = useState("");
  const [tabsScanned, setTabsScanned] = useState(false);
  const hiddenContainersRef = useRef([]);

  // Build tabsData from the changes array.
  useEffect(() => {
    if (!changes || !changes.length) return;
    const newTabs = changes.map((obj, i) => {
      const oldKey = Object.keys(obj).find((k) => k.startsWith("old_content_"));
      const newKey = Object.keys(obj).find((k) => k.startsWith("new_content_"));
      const tabName = oldKey ? oldKey.replace("old_", "") : `content_${i + 1}`;
      const rawOld = obj[oldKey] || "";
      const rawNew = obj[newKey] || "";
      // Clean up content.
      const cleanedOld = cleanupText(rawOld, {
        trimLines: true,
        singleSpaces: false,
        singleNewlines: true,
        noEmptyLines: true,
      });
      const cleanedNew = cleanupText(rawNew, {
        trimLines: true,
        singleSpaces: false,
        singleNewlines: true,
        noEmptyLines: true,
      });
      // If contents are identical, mark artificialDiff so that we ignore change groups later.
      const artificialDiff = cleanedOld === cleanedNew;
      // If artificial, append a tiny tweak that differs.
      const oldContent = artificialDiff
        ? cleanedOld + " test_change_1"
        : cleanedOld;
      const newContent = artificialDiff
        ? cleanedNew + " test_change_2"
        : cleanedNew;

      const patch = createPatch("text", oldContent, newContent, "", "", {
        context: Diff ? 3 : Number.MAX_SAFE_INTEGER,
      });
      let diffOutput = html(patch, {
        drawFileList: false,
        matching: "words",
        outputFormat: "side-by-side",
        renderNothingWhenEmpty: false,
      });

      return {
        tabName,
        rawOld: cleanedOld,
        rawNew: cleanedNew,
        oldContent,
        newContent,
        diffHtml: diffOutput,
        changeGroups: [],
        artificialDiff,
      };
    });
    setTabsData(newTabs);
    setActiveTab(0);
    setCurChangeIndex(-1);
    setTabsScanned(false);
  }, [changes, Diff]);

  // Set active diff html when activeTab changes.
  useEffect(() => {
    if (!tabsData[activeTab]) {
      setActiveDiffHtml("");
      return;
    }
    setActiveDiffHtml(tabsData[activeTab].diffHtml);
    setCurChangeIndex(-1);
  }, [activeTab, tabsData]);

  // Synchronize row heights for active diff.
  useEffect(() => {
    if (!activeDiffHtml) return;
    setTimeout(() => {
      const container = document.querySelector(".active-diff-container");
      if (!container) return;
      const leftTableBody = container.querySelector(
        ".d2h-file-side-diff:first-child .d2h-diff-tbody"
      );
      const rightTableBody = container.querySelector(
        ".d2h-file-side-diff:last-child .d2h-diff-tbody"
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
  }, [activeDiffHtml]);

  // Scan each tab's diff for change groups.
  useEffect(() => {
    if (!tabsData.length || tabsScanned) return;
    tabsData.forEach((tab, idx) => {
      const container = hiddenContainersRef.current[idx];
      if (!container) return;
      container.innerHTML = tab.diffHtml;
      const leftTableBody = container.querySelector(
        ".d2h-file-side-diff:first-child .d2h-diff-tbody"
      );
      const rightTableBody = container.querySelector(
        ".d2h-file-side-diff:last-child .d2h-diff-tbody"
      );
      if (!leftTableBody || !rightTableBody) {
        tab.changeGroups = [];
        return;
      }
      const leftRows = leftTableBody.querySelectorAll("tr");
      const rightRows = rightTableBody.querySelectorAll("tr");
      const minRows = Math.min(leftRows.length, rightRows.length);
      const groups = [];
      let groupStarted = false;
      for (let i = 0; i < minRows; i++) {
        const leftRow = leftRows[i];
        const rightRow = rightRows[i];
        const leftChanged = leftRow.querySelector(".d2h-del, .d2h-ins");
        const rightChanged = rightRow.querySelector(".d2h-del, .d2h-ins");
        if (leftChanged || rightChanged) {
          if (!groupStarted) {
            if (!leftRow.id) {
              leftRow.id = `change-section-${groups.length}-tab${idx}`;
            }
            groups.push({ id: leftRow.id, index: i });
            groupStarted = true;
          }
        } else {
          groupStarted = false;
        }
      }
      // If this tab is artificial (i.e. no real difference), ignore any groups.
      tab.changeGroups = tab.artificialDiff ? [] : groups;
    });
    setTabsScanned(true);
    setTabsData([...tabsData]);
  }, [tabsData, tabsScanned]);

  // Previous/Next navigation function.
  const scrollChange = (direction) => {
    const activeTabData = tabsData[activeTab];
    if (!activeTabData || activeTabData.changeGroups.length === 0) return;
    const groups = activeTabData.changeGroups;
    let newIndex = curChangeIndex;
    if (direction === ">") {
      newIndex = curChangeIndex + 1;
    } else {
      newIndex = curChangeIndex - 1;
    }
    if (newIndex >= groups.length) newIndex = 0;
    if (newIndex < 0) newIndex = groups.length - 1;
    const container = document.querySelector(".active-diff-container");
    if (!container) return;
    const leftTableBody = container.querySelector(
      ".d2h-file-side-diff:first-child .d2h-diff-tbody"
    );
    const rightTableBody = container.querySelector(
      ".d2h-file-side-diff:last-child .d2h-diff-tbody"
    );
    if (!leftTableBody || !rightTableBody) return;
    const leftRows = leftTableBody.querySelectorAll("tr");
    const rightRows = rightTableBody.querySelectorAll("tr");
    groups.forEach(({ index }) => {
      if (leftRows[index]) leftRows[index].classList.remove("active-change");
      if (rightRows[index]) rightRows[index].classList.remove("active-change");
    });
    const group = groups[newIndex];
    if (leftRows[group.index] && rightRows[group.index]) {
      leftRows[group.index].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      leftRows[group.index].classList.add("active-change");
      rightRows[group.index].classList.add("active-change");
    }
    setCurChangeIndex(newIndex);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-8xl mx-auto px-4 py-6 pt-2">
        <div className="flex space-x-4 mb-2 justify-center items-center">
          {tabsData.map((tab, idx) => {
            const count = tab.changeGroups.length;
            const active = idx === activeTab;
            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(idx);
                  setCurChangeIndex(-1);
                }}
                className={`px-2 py-1 h-10  rounded-md border ${
                  active
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                } relative`}
              >
                {tab.tabName}
                {count > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    title={`${count} changes`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          <DiffNavigation
            changeGroups={tabsData[activeTab]?.changeGroups}
            curChangeIndex={curChangeIndex}
            onNavigate={scrollChange}
            handleDiff={handleDiff}
            handleAll={handleAll}
          />
        </div>

        {/* Active diff view */}
        {activeDiffHtml && (
          <div className="bg-white rounded-lg shadow-lg p-2 relative">
            <h2 className="text-xl font-semibold mb-4">
              {tabsData[activeTab]?.tabName} Diff
            </h2>
            <style>{`
              .active-diff-container .d2h-code-line,
              .active-diff-container .d2h-code-line-ctn {
                white-space: pre-wrap;
                word-break: break-all;
              }
              .active-diff-container .d2h-code-wrapper {
                padding: 0.25rem !important;
              }
              .active-diff-container .d2h-diff-table td {
                padding: 0.25rem !important;
              }
              .active-change {
                background-color: #fae69e !important;
                padding: 5px !important;
              }
            `}</style>
            <div
              className="active-diff-container diff-container"
              dangerouslySetInnerHTML={{ __html: activeDiffHtml }}
            />

            {/* Diff navigation using the separate component */}
          </div>
        )}
      </main>

      {/* Hidden containers for scanning each tab's diff */}
      <div style={{ display: "none" }}>
        {tabsData.map((_, idx) => (
          <div
            key={idx}
            ref={(el) => (hiddenContainersRef.current[idx] = el)}
          />
        ))}
      </div>
    </div>
  );
};

export default Test;

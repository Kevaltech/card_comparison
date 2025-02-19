import React, { useEffect, useState } from "react";
import NavButton from "./NavButton";
import { ChevronLeft, ChevronRight, FileText, FileDiff } from "lucide-react";

const DiffNavigation = ({
  changeGroups,
  curChangeIndex,
  onNavigate,
  handleDiff,
  handleAll,
  setActiveTab,
  setCurChangeIndex,
  tabsData,
  activeTab,
}) => {
  // Only show navigation if there are any change groups.
  // if (!changeGroups || changeGroups.length === 0) return null;

  const [activeButton, setActiveButton] = useState(true);
  // Optional: add keyboard shortcuts for navigation.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigate("<");
      } else if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        onNavigate(">");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNavigate]);

  const handleDiffClick = (e) => {
    setActiveButton(false);
    handleDiff();
  };

  const handleAllClick = (e) => {
    setActiveButton(true);
    handleAll();
  };

  return (
    <div className="fixed top-30 right-0 transform -translate-x-1/2 z-30">
      <div className="bg-gray-50 flex items-center justify-center p-1 mb-2">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center gap-1 p-1.5">
            {/* {tabsData.map((tab, idx) => {
              const count = tab.changeGroups.length;
              const active = idx === activeTab;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveTab(idx);
                    setCurChangeIndex(-1);
                  }}
                  className={`px-2 py-1 h-9  rounded-md border ${
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
            })} */}
            <button type="button" onClick={handleAllClick}>
              <NavButton
                icon={<FileText size={18} />}
                label="All"
                active={activeButton}
              />
            </button>
            <button type="button" onClick={handleDiffClick}>
              <NavButton
                icon={<FileDiff size={18} />}
                label="Diffs"
                active={!activeButton}
              />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNavigate("<");
              }}
              title="Previous change (Alt + ←)"
            >
              <NavButton label="← Previous" />
            </button>
            <span
              className={`
    flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-gray-100
    ${true ? "bg-blue-50 text-blue-600" : "text-gray-700"}
    transition-colors duration-150 ease-in-out
  `}
            >
              {curChangeIndex + 1 <= 0
                ? `0 / ${changeGroups?.length}`
                : `${curChangeIndex + 1} / ${changeGroups?.length}`}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(">");
              }}
              title="Next change (Alt + →)"
            >
              <NavButton label="Next →" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DiffNavigation);

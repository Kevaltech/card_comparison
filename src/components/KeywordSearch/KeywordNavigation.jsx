import React from "react";
import { ChevronLeft, ChevronRight, FileText, FileDiff } from "lucide-react";
import NavButton from "../CardDetails/NavButton";

const KeywordNavigation = ({
  curKeywordIndex,
  keywordCount,
  onPrev,
  onNext,
}) => {
  return (
    <div className="bg-gray-50 flex items-center justify-center p-1">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-1 p-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onPrev();
            }}
            title="Previous occurrence"
          >
            <NavButton label="← Previous" />
          </button>
          <span className="text-sm">
            {keywordCount > 0
              ? `${curKeywordIndex + 1} / ${keywordCount}`
              : "0/0"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onNext();
            }}
            title="Next occurrence"
          >
            <NavButton label="Next →" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeywordNavigation;

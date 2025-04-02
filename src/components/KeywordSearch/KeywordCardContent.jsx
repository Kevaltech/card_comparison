import React, { useState, useEffect, useRef } from "react";
import KeywordNavigation from "./KeywordNavigation"; // Adjust the import path as needed
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formateDate";

// Helper to escape regex special characters.
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Count occurrences only in the text nodes.
function countTextOccurrences(htmlContent, keyword) {
  if (!keyword) return 0;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  let count = 0;
  const walker = doc.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const regex = new RegExp(escapeRegExp(keyword), "gi");
  while (walker.nextNode()) {
    const text = walker.currentNode.nodeValue;
    const matches = text.match(regex);
    if (matches) {
      count += matches.length;
    }
  }
  return count;
}

// Highlight occurrences only in text nodes.
function highlightTextNodes(htmlContent, keyword) {
  if (!keyword) return htmlContent;
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const walker = doc.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  const regex = new RegExp(escapeRegExp(keyword), "gi");
  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  textNodes.forEach((node) => {
    const replacedHTML = node.nodeValue.replace(
      regex,
      '<span class="highlighted-keyword" style="background-color: yellow; font-weight: bold;">$&</span>'
    );
    const spanWrapper = document.createElement("span");
    spanWrapper.innerHTML = replacedHTML;
    node.parentNode.replaceChild(spanWrapper, node);
  });
  return doc.body.innerHTML;
}

const KeywordCardContent = ({ cardData2, keyword }) => {
  const cardId = cardData2.cardId;
  const version = cardData2.version;

  const [cardData, setCardData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [curKeywordIndex, setCurKeywordIndex] = useState(0);
  const [keywordCount, setKeywordCount] = useState(0);

  const contentRef = useRef(null);

  useEffect(() => {
    // Adjust the URL as needed.
    fetch(
      `https://e015-59-162-82-6.ngrok-free.app/get-tabs-content/?cardId=${cardId}&version=${version}`,
      {
        headers: { "ngrok-skip-browser-warning": "234242" },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        setCardData(data);
      })
      .catch((error) => console.error("Error fetching card data:", error));
  }, [cardId, version]);

  // After content renders, count highlighted keywords in the active tab.
  useEffect(() => {
    if (contentRef.current) {
      const highlights = contentRef.current.querySelectorAll(
        ".highlighted-keyword"
      );
      setKeywordCount(highlights.length);
      if (highlights.length === 0) {
        setCurKeywordIndex(0);
      }
    }
  }, [cardData, activeTab, keyword]);

  // Update the style of the active highlighted keyword.
  useEffect(() => {
    if (contentRef.current) {
      const highlights = contentRef.current.querySelectorAll(
        ".highlighted-keyword"
      );
      highlights.forEach((el, index) => {
        if (index === curKeywordIndex) {
          el.style.backgroundColor = "orange"; // active keyword color
          el.style.fontWeight = "bold";
        } else {
          el.style.backgroundColor = "yellow";
          el.style.fontWeight = "bold";
        }
      });
    }
  }, [curKeywordIndex, cardData, activeTab, keyword]);

  if (!cardData) {
    return <div>Loading...</div>;
  }

  const { cardName, last_updated, url, bank_name, changes } = cardData;
  const originalContent = changes[activeTab].content || "";
  const highlightedContent = highlightTextNodes(originalContent, keyword);

  // Navigate to next highlighted occurrence.
  const onNextKeyword = () => {
    if (contentRef.current) {
      const highlights = contentRef.current.querySelectorAll(
        ".highlighted-keyword"
      );
      if (!highlights.length) return;
      const nextIndex = (curKeywordIndex + 1) % highlights.length;
      highlights[nextIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setCurKeywordIndex(nextIndex);
    }
  };

  // Navigate to previous highlighted occurrence.
  const onPrevKeyword = () => {
    if (contentRef.current) {
      const highlights = contentRef.current.querySelectorAll(
        ".highlighted-keyword"
      );
      if (!highlights.length) return;
      const prevIndex =
        (curKeywordIndex - 1 + highlights.length) % highlights.length;
      highlights[prevIndex].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setCurKeywordIndex(prevIndex);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-0">
      <div className="flex flex-col items-center sticky top-0 bg-white z-1 py-2">
        <h3 className="mb-4 text-3xl tracking-tight font-extrabold text-gray-900 ">
          <Link
            to={url}
            target="_blank"
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {bank_name} {cardName} ({cardData.cardId})
          </Link>
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-md font-medium text-gray-900">
            Last updated: {formatDate(cardData.last_updated)}
          </span>
        </div>
      </div>

      {changes && changes.length > 0 && (
        <>
          {/* Flex container for tabs and keyword navigation */}
          <div className="flex items-center justify-between border-b mb-4 sticky top-24 bg-white z-10 py-2">
            {/* Tab Navigation */}
            <div className="flex">
              {changes.map((tab, index) => {
                const tabKeywordCount = countTextOccurrences(
                  tab.content,
                  keyword
                );
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveTab(index);
                      setCurKeywordIndex(0);
                    }}
                    className={`relative px-4 py-2 -mb-px font-medium ${
                      activeTab === index
                        ? "border-b-2 border-blue-500 text-blue-500"
                        : "text-gray-600"
                    }`}
                  >
                    {tab.tab_name || `Tab ${index + 1}`}
                    {tabKeywordCount > 0 && (
                      <span className="absolute top-0 right-0 -mt-1 -mr-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">
                        {tabKeywordCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {/* Keyword Navigation on the right side */}
            <KeywordNavigation
              curKeywordIndex={curKeywordIndex}
              keywordCount={keywordCount}
              onPrev={onPrevKeyword}
              onNext={onNextKeyword}
            />
          </div>

          {/* Content Area */}
          <div className="p-4 border h-full overflow-y-auto">
            <div
              ref={contentRef}
              className="content-area prose max-w-none"
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default KeywordCardContent;

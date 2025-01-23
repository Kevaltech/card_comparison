import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formateDate";
import { ChevronDown, RotateCcw } from "lucide-react";

export const CardContent = ({ cardData, onStatusToggle, containerRef }) => {
  console.log("cardData.url?.url", cardData.cardHtml);
  const [v1, setV1] = useState(null);
  const [v2, setV2] = useState(null);
  const [versionData, setVersionData] = useState(null);
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const versions = Array.from({ length: cardData.version || 5 }, (_, i) => ({
    id: i + 1,
    label: `Version ${i + 1}`,
  }));
  console.log("versiong", versions);

  useEffect(() => {
    if (v1 && v2) {
      fetchVersionComparison();
    }
  }, [v1, v2]);

  const fetchVersionComparison = async () => {
    if (!v1 || !v2) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://baf5-59-162-82-6.ngrok-free.app/compare-cards/?cardId=${cardData.cardId}&v1=${v1}&v2=${v2}`,
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch version comparison");
      }

      const data = await response.json();
      setVersionData(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching version comparison:", err);
    } finally {
      setLoading(false);
    }
  };

  const VersionDropdown = ({
    value,
    onChange,
    isOpen,
    setIsOpen,
    label,
    selected,
  }) => (
    <div className="relative p-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative px-6 py-3 rounded-xl bg-white border border-gray-200 shadow-sm
                 text-gray-900 font-medium flex items-center justify-between w-56
                 hover:border-primary/50 hover:shadow-md transition-all duration-300 ease-out"
        type="button"
      >
        {value ? `Version ${value}` : label}
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-lg
          transform transition-all duration-300 ease-out z-50
          ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="py-2">
            {versions.map((version) => (
              <button
                key={version?.id}
                onClick={() => {
                  onChange(version?.id);
                  setIsOpen(false);
                }}
                className={`w-full px-6 py-2 text-left hover:bg-gray-50 transition-colors
                       ${
                         selected?.id === version?.id
                           ? "text-primary font-medium"
                           : "text-gray-700"
                       }`}
              >
                {version?.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleReset = () => {
    setV1(null);
    setV2(null);
    setVersionData(null);
    setIsDropdown1Open(false);
    setIsDropdown2Open(false);

    if (typeof window.initializeTabs === "function") {
      try {
        window.initializeTabs();
      } catch (err) {
        console.error("Error initializing tabs:", err);
      }
    }
    if (typeof window.cleanupDOMElements === "function") {
      try {
        window.cleanupDOMElements();
      } catch (err) {
        console.error("Error cleaning up DOM elements:", err);
      }
    }
    // Reset any processed styles and scripts
    // if (containerRef.current) {
    //   const styleTags = containerRef.current.getElementsByTagName("style");
    //   Array.from(styleTags).forEach((styleTag) => {
    //     styleTag.removeAttribute("data-processed");
    //   });
    //   const scripts = containerRef.current.getElementsByTagName("script");
    //   Array.from(scripts).forEach((script) => {
    //     script.removeAttribute("data-executed");
    //   });
    // }
  };

  useEffect(() => {
    if (!versionData?.cardHtml || !containerRef.current) return;
    console.log("Inside card content  useEffect");
    const handleStyleTags = () => {
      const styleTags = containerRef?.current?.getElementsByTagName("style");
      Array.from(styleTags || []).forEach((styleTag) => {
        if (styleTag.getAttribute("data-processed")) return;

        const newStyleElement = document.createElement("style");
        Array.from(styleTag.attributes).forEach((attr) => {
          if (attr.name !== "data-processed") {
            newStyleElement.setAttribute(attr.name, attr.value);
          }
        });

        newStyleElement.textContent = styleTag.textContent;
        styleTag.setAttribute("data-processed", "true");
        document.head.appendChild(newStyleElement);
      });
    };

    const handleScriptTags = () => {
      const scripts = containerRef.current?.getElementsByTagName("script");
      Array.from(scripts || []).forEach((script) => {
        if (script.getAttribute("data-executed")) return;

        const newScript = document.createElement("script");
        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== "data-executed") {
            newScript.setAttribute(attr.name, attr.value);
          }
        });

        newScript.textContent = script.textContent;
        script.setAttribute("data-executed", "true");
        script.parentNode?.removeChild(script);
        document.body.appendChild(newScript);
      });
    };

    handleStyleTags();
    handleScriptTags();

    // Initialize custom functions if they exist
    if (typeof window.initializeTabs === "function") {
      try {
        window.initializeTabs();
      } catch (err) {
        console.error("Error initializing tabs:", err);
      }
    }

    if (typeof window.cleanupDOMElements === "function") {
      try {
        window.cleanupDOMElements();
      } catch (err) {
        console.error("Error cleaning up DOM elements:", err);
      }
    }
  }, [versionData?.cardHtml]);

  return (
    <>
      <div className="mx-auto max-w-screen-md text-center mb-4 lg:mb-4">
        <h3 className="mb-4 text-3xl tracking-tight font-extrabold text-gray-900">
          <Link
            to={cardData?.url}
            target="_blank"
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {cardData.bank_name} {cardData.cardName} ({cardData.cardId})
          </Link>
        </h3>
        <div className="flex items-center justify-center">
          <h4 className="mb-0 text-2xl tracking-tight font-extrabold text-gray-900">
            Total Version: {cardData?.bank_name}
          </h4>
          <div className="flex me-4">
            <label className="ms-2 ml-10 text-md font-medium text-gray-900">
              Last updated: {formatDate(cardData.last_updated)}
            </label>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <h4 className="mb-0 text-2xl tracking-tight font-extrabold text-gray-900">
            Status:{" "}
            <span
              id="badge-dismiss-green"
              className="inline-flex items-center px-2 py-1 me-2 text-sm font-medium text-green-800 bg-green-100 rounded D:bg-green-900 D:text-green-300"
            >
              {cardData.cardStatus}
            </span>
          </h4>
          <div className={`flex me-4 ${versionData ? "hidden" : ""}`}>
            <button
              onClick={onStatusToggle}
              className="focus:outline-none text-white bg-yellow-400 hover:bg-yellow-500 font-small rounded-lg text-sm px-3 py-2"
              disabled={versionData ? true : false}
            >
              {cardData.cardStatus === "Open" ? "Resolve" : "Open"}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mb-4 ">
          <button
            onClick={handleReset}
            className="mb-6 md:mb-0 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 
                   transition-colors duration-200 flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <VersionDropdown
            value={v1}
            onChange={setV1}
            isOpen={isDropdown1Open}
            selected={v1}
            setIsOpen={setIsDropdown1Open}
            label="Select Version A"
          />
          <VersionDropdown
            value={v2}
            onChange={setV2}
            isOpen={isDropdown2Open}
            selected={v2}
            setIsOpen={setIsDropdown2Open}
            label="Select Version B"
          />
        </div>
        {loading && (
          <div className="text-center text-gray-600">
            Loading version comparison...
          </div>
        )}

        {error && (
          <div className="text-center text-red-600">Error: {error}</div>
        )}
      </div>

      <div
        className="p-4  pt-0 pb-0 border-2 border-gray-200 border-dashed rounded-lg"
        ref={containerRef}
        dangerouslySetInnerHTML={{
          __html: versionData ? versionData.cardHtml : cardData.cardHtml,
        }}
      />
    </>
  );
};

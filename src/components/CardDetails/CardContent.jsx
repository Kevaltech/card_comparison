import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formateDate";
import { ChevronDown, RotateCcw } from "lucide-react";
import DiffNavigation from "./DiffNavigation";
import VersionStatusList from "./VersionDetails";
import Test from "../home/Test";

export const CardContent = ({ cardData, onStatusToggle, containerRef }) => {
  const [v1, setV1] = useState(
    cardData?.version - 1 !== 0 ? cardData?.version - 1 : cardData?.version
  );
  const [v2, setV2] = useState(cardData?.version);
  const [versionData, setVersionData] = useState(null);
  const [isDropdown1Open, setIsDropdown1Open] = useState(false);
  const [isDropdown2Open, setIsDropdown2Open] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [test, setTest] = useState(false);

  // Add ref to track if versions were changed manually

  const handleTest = () => {
    setTest(!test);
  };
  const versionsChanged = useRef(false);

  const versions = Array.from({ length: cardData.version || 5 }, (_, i) => ({
    id: i + 1,
    label: `Version ${i + 1}`,
  }));

  useEffect(() => {
    if (v1 && v2 && versionsChanged.current) {
      fetchVersionComparison();
    }
  }, [v1, v2]);

  const fetchVersionComparison = async () => {
    if (!v1 || !v2) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://c9e5-59-162-82-6.ngrok-free.app/compare-cards/?cardId=${cardData.cardId}&v1=${v1}&v2=${v2}`,
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

  const handleVersionChange = (version, setVersion) => {
    versionsChanged.current = true;
    setVersion(version);
  };

  const handleVersionChangeThroughVersionList = (v) => {
    versionsChanged.current = true;
    if (v === 1) {
      setV1(1);
      setV2(1);
    } else {
      setV1(v - 1);
      setV2(v);
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
    <div className="relative">
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
          className="absolute w-56 rounded-xl bg-white border border-gray-200 shadow-lg
                   transform transition-all duration-300 ease-out z-50"
          style={{
            top: "auto",
            left: "0",
            marginTop: "0.5rem",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          <div className="py-2">
            {versions.map((version) => (
              <button
                key={version?.id}
                onClick={() => {
                  handleVersionChange(version?.id, onChange);
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
    versionsChanged.current = false;
    setV1(
      cardData?.version - 1 !== 0 ? cardData?.version - 1 : cardData?.version
    );
    setV2(cardData?.version);
    setVersionData(null);
    setIsDropdown1Open(false);
    setIsDropdown2Open(false);

    if (typeof window.initializeTabs === "function") {
      try {
        window.initializeTabs();
        // window.navigateDiff();
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
  };

  useEffect(() => {
    if (!versionData?.cardHtml || !containerRef.current) return;

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

    if (typeof window.initializeTabs === "function") {
      try {
        window.initializeTabs();
        // window.navigateDiff();
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
    <div className="flex flex-col min-h-screen">
      {/* Header Section with Fixed Position */}
      <div className="w-full bg-white py-4 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Version Status List */}
            <div className="w-full lg:w-1/4">
              <VersionStatusList
                data={cardData?.status_by_version}
                onStatusToggle={onStatusToggle}
                onVersionChange={handleVersionChangeThroughVersionList}
              />
            </div>

            {/* Card Details and Controls */}
            <div className="w-full lg:w-3/4 flex flex-col items-center pr-20">
              <h3 className="mb-4 text-3xl tracking-tight font-extrabold text-gray-900">
                <Link
                  to={cardData?.url}
                  target="_blank"
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  {cardData.bank_name} {cardData.cardName} ({cardData.cardId})
                </Link>
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <h4 className="text-2xl tracking-tight font-extrabold text-gray-900">
                  Total Version: {cardData?.version}
                </h4>
                <span className="text-md font-medium text-gray-900">
                  Last updated: {formatDate(cardData.last_updated)}
                </span>
              </div>

              {/* Version Controls */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 
                  transition-colors duration-200 flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>

                <div className="flex flex-wrap gap-4">
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
          </div>
        </div>
      </div>
      <button onClick={handleTest}>test page</button>
      {/* Content Section */}
      {test ? (
        <Test
          leftTextImport={versionData?.old_content}
          rightTextImport={versionData?.new_content}
        />
      ) : (
        <div className="">
          <div
            className=" border-2 border-gray-200 border-dashed rounded-lg"
            ref={containerRef}
            dangerouslySetInnerHTML={{
              __html: versionData ? versionData.cardHtml : cardData.cardHtml,
            }}
          />
          <DiffNavigation />
        </div>
      )}
    </div>
  );
};

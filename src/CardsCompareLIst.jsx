import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Configuration for card buttons
const CARD_CONFIGS = [
  {
    id: "hdfcc29",
    name: "HDFC Business Black",
    icon: "chart",
  },
  {
    id: "hdfcc41",
    name: "HDFC Paytm Select",
    icon: "grid",
    badge: "Pro",
  },
  {
    id: "hdfcc49",
    name: "HDFC Business Regalia",
    icon: "headset",
    badgeCount: 3,
  },
];

// Icon mapping to SVG paths
const ICONS = {
  chart:
    "M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4Zm0 6h16v6H4v-6Z M5 14a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Zm5 0a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2h-5a1 1 0 0 1-1-1Z",
  grid: "M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z",
  headset:
    "M17.418 3.623-.018-.008a6.713 6.713 0 0 0-2.4-.569V2h1a1 1 0 1 0 0-2h-2a1 1 0 0 0-1 1v2H9.89A6.977 6.977 0 0 1 12 8v5h-2V8A5 5 0 1 0 0 8v6a1 1 0 0 0 1 1h8v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h6a1 1 0 0 0 1-1V8a5 5 0 0 0-2.582-4.377ZM6 12H4a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2Z",
};

function CardsCompareLIst() {
  const navigate = useNavigate();
  const { cardId } = useParams();

  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(cardId || "hdfcc29");
  const containerRef = useRef(null);

  // Construct base URLs
  const BASE_COMPARE_URL = "http://127.0.0.1:8000/compare/";

  const fetchHtmlContent = async (cardId) => {
    if (!cardId) return;

    setIsLoading(true);
    setError(null);
    setSelectedCard(cardId);

    // Update URL without page reload
    navigate(`/compare/${cardId}`);

    try {
      const response = await axios.get(`${BASE_COMPARE_URL}${cardId}`, {
        headers: {
          Accept: "text/html",
        },
      });

      setHtmlContent(response.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch HTML content");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    fetchHtmlContent(selectedCard);
  }, []);

  // Handle styles and scripts (previous implementation)
  useEffect(() => {
    if (!htmlContent || !containerRef.current) return;

    const handleStyleTags = () => {
      const styleTags = containerRef.current.getElementsByTagName("style");
      for (let styleTag of Array.from(styleTags)) {
        if (styleTag.getAttribute("data-processed")) continue;

        const newStyleElement = document.createElement("style");
        Array.from(styleTag.attributes).forEach((attr) => {
          if (attr.name !== "data-processed") {
            newStyleElement.setAttribute(attr.name, attr.value);
          }
        });

        newStyleElement.textContent = styleTag.textContent;
        styleTag.setAttribute("data-processed", "true");
        document.head.appendChild(newStyleElement);
      }
    };

    const handleScriptTags = () => {
      const scripts = containerRef.current.getElementsByTagName("script");
      for (let script of Array.from(scripts)) {
        if (script.getAttribute("data-executed")) continue;
        const newScript = document.createElement("script");

        Array.from(script.attributes).forEach((attr) => {
          if (attr.name !== "data-executed") {
            newScript.setAttribute(attr.name, attr.value);
          }
        });

        newScript.textContent = script.textContent;
        script.setAttribute("data-executed", "true");
        script.parentNode.removeChild(script);
        document.body.appendChild(newScript);
      }
    };

    handleStyleTags();
    handleScriptTags();

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
        console.error("Error cleaning up DOM elements for:", err);
      }
    }
  }, [htmlContent]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <aside
        id="default-sidebar"
        className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-8 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <ul className="space-y-2 font-medium">
            {CARD_CONFIGS.map((card) => (
              <li key={card.id}>
                <button
                  onClick={() => fetchHtmlContent(card.id)}
                  className={`flex items-center p-2 rounded-lg group w-full 
                    ${
                      selectedCard === card.id
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <svg
                    className={`w-5 h-5 transition duration-75 ${
                      selectedCard === card.id
                        ? "text-blue-800 dark:text-blue-300"
                        : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                    }`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H4Zm0 6h16v6H4v-6Z"
                      clip-rule="evenodd"
                    />
                    <path
                      fill-rule="evenodd"
                      d="M5 14a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1Zm5 0a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2h-5a1 1 0 0 1-1-1Z"
                      clip-rule="evenodd"
                    />
                  </svg>

                  <span className="flex-1 ms-3 whitespace-nowrap">
                    {card.name}
                  </span>
                  {card.badge && (
                    <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                      {card.badge}
                    </span>
                  )}
                  {card.badgeCount && (
                    <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300">
                      {card.badgeCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="p-4 sm:ml-64">
        <div
          className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700"
          id="content"
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        ></div>
      </div>
    </div>
  );
}

export default CardsCompareLIst;

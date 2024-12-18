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
    // badge: "Pro",
  },
  {
    id: "hdfcc49",
    name: "HDFC Business Regalia",
    icon: "headset",
    // badgeCount: 3,
  },
  {
    id: "hdfcc56",
    name: "HDFC RuPay UPI",
    icon: "chart",
  },
  {
    id: "hdfcc47",
    name: "HDFC Platinum Edge",
    icon: "chart",
  },
  {
    id: "hdfcc40",
    name: "HDFC Paytm Digital",
    icon: "chart",
  },
];

// Icon mapping to SVG paths

function CardsCompareLIst() {
  const navigate = useNavigate();
  const { cardId: routeCardId } = useParams();

  const [htmlContent, setHtmlContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const containerRef = useRef(null);

  // Construct base URLs
  const BASE_COMPARE_URL = "https://d1df-59-162-82-6.ngrok-free.app/compare/";

  const fetchHtmlContent = async (cardId) => {
    if (!cardId) return;

    setIsLoading(true);
    setError(null);
    setSelectedCard(cardId);

    // Update URL without page reload
    navigate(`/compare/${cardId}`, { replace: true });

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
      // Fallback to a default card if fetch fails
      if (cardId !== "hdfcc29") {
        fetchHtmlContent("hdfcc29");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load effect
  useEffect(() => {
    // Determine which card to load
    const cardToLoad = routeCardId || "hdfcc29";

    // Ensure the card exists in our configurations
    const validCard = CARD_CONFIGS.find((card) => card.id === cardToLoad);

    // Fetch content for the card, or fallback to default
    fetchHtmlContent(validCard ? cardToLoad : "hdfcc29");
  }, [routeCardId]);
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
        <div className="h-full px-2 py-8 overflow-y-auto bg-gray-50 D:bg-gray-800">
          <ul className="space-y-2 font-medium">
            {CARD_CONFIGS.map((card) => (
              <li key={card.id}>
                <button
                  onClick={() => fetchHtmlContent(card.id)}
                  className={`flex items-center p-2 pr-0 rounded-lg group w-full 
                    ${
                      selectedCard === card.id
                        ? "bg-blue-100 text-blue-800 D:bg-blue-900 D:text-blue-300"
                        : "text-gray-900 D:text-white hover:bg-gray-100 D:hover:bg-gray-700"
                    }`}
                >
                  {" "}
                  <svg
                    className={`w-5 h-5 transition duration-75 ${
                      selectedCard === card.id
                        ? "text-blue-800 D:text-blue-300"
                        : "text-gray-500 D:text-gray-400 group-hover:text-gray-900 D:group-hover:text-white"
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
                  {/* {card.badge && (
                    <span className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium text-gray-800 bg-gray-100 rounded-full D:bg-gray-700 D:text-gray-300">
                      {card.badge}
                    </span>
                  )}
                  {card.badgeCount && (
                    <span className="inline-flex items-center justify-center w-3 h-3 p-3 ms-3 text-sm font-medium text-blue-800 bg-blue-100 rounded-full D:bg-blue-900 D:text-blue-300">
                      {card.badgeCount}
                    </span>
                  )} */}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="p-4 sm:ml-64">
        <div
          className="p-4 border-2 border-gray-200 border-dashed rounded-lg D:border-gray-700"
          id="content"
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        ></div>
      </div>
    </div>
  );
}

export default CardsCompareLIst;

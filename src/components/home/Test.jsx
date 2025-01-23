import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { CardContent } from "../CardDetails/CardContent";

function Test() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/compare-cards/?cardId=6001&v1=1&v2=2",
        {
          headers: { "ngrok-skip-browser-warning": "234242" },
        }
      );
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!stats?.cardHtml || !containerRef.current) return;
    console.log("container", containerRef);
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
  }, [stats?.cardHtml, fetchDashboardStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        loading
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <AlertCircle className="w-6 h-6 mr-2" />
        {error}
      </div>
    );
  }

  const handleStatusToggle = () => {
    return null;
  };

  return (
    <div>
      <h1>Test page</h1>
      <>
        <CardContent
          cardData={stats}
          onStatusToggle={handleStatusToggle}
          containerRef={containerRef}
        />
      </>
    </div>
  );
}

export default Test;

import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import CardsCompareLIst from "./CardsCompareLIst";
import SearchKeyword from "./components/KeywordSearch/SearchKeyword";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [count, setCount] = useState(0);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/compare/:cardId" element={<CardsCompareLIst />} />
        <Route path="/compare" element={<CardsCompareLIst />} />
        {/* Add a redirect from root to default compare route */}
        <Route path="/" element={<Navigate to="/compare/hdfcc29" replace />} />
        {/* Catch-all route to handle any undefined routes */}
        <Route path="*" element={<Navigate to="/compare/hdfcc29" replace />} />
        <Route path="/searchKeyword" element={<SearchKeyword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

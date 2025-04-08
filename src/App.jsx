import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import CardsCompareLIst from "./CardsCompareLIst";
import SearchKeyword from "./components/KeywordSearch/SearchKeyword";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./components/home/Home";
import Navbar from "./components/nav/Navbar";
import Test from "./components/home/Test";

function App() {
  return (
    <BrowserRouter>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<CardsCompareLIst />} />
        <Route path="/test" element={<Test />} />
        <Route path="/compare/:cardId" element={<CardsCompareLIst />} />
        <Route path="/overview/:overview" element={<CardsCompareLIst />} />

        {/* <Route path="/" element={<CardsCompareLIst />} /> */}
        {/* Add a redirect from root to default compare route */}
        {/* <Route path="/" element={<Navigate to="/compare/hdfcc29" replace />} /> */}
        {/* Catch-all route to handle any undefined routes */}
        {/* <Route path="*" element={<Navigate to="/compare/hdfcc29" replace />} /> */}
        <Route path="/searchKeyword" element={<SearchKeyword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

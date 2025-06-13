// App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignupForm from "./components/auth/SignUp";
import LoginForm from "./components/auth/SignIn";
import PendingApproval from "./components/auth/PendingApproval";
import CardsCompareLIst from "./CardsCompareLIst";
import SearchKeyword from "./components/KeywordSearch/SearchKeyword";
import { Home } from "./components/home/Home";
import RequireAuth from "./utils/RequireAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/signin" element={<LoginForm />} />
        <Route path="/pending" element={<PendingApproval />} />

        {/* Protected routes */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<CardsCompareLIst />} />
          <Route path="/test" element={<Home />} />
          <Route path="/compare/:cardId" element={<CardsCompareLIst />} />
          <Route path="/overview/:overview" element={<CardsCompareLIst />} />
          <Route path="/searchKeyword" element={<SearchKeyword />} />
          <Route
            path="/searchKeyword/:cardId/:version"
            element={<SearchKeyword />}
          />
        </Route>

        {/* Catch-all: redirect unknown paths for unauthenticated users */}
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

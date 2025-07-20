import { Routes, Route, Navigate } from "react-router";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OnboardingPage from "./pages/OnboardingPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios.js";

import { Toaster } from "react-hot-toast";

const App = () => {
  const {
    data: authData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data;
    },
    retry: false,
  });

  const authUser = authData?.user;

  return (
    <div className="h-screen" data-theme="coffee">
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} Route />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} Route />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} Route />
        <Route
          path="/notifications"
          element={authUser ? <NotificationsPage /> : <Navigate to="/login" />}
          Route
        />
        <Route path="/call" element={authUser ? <CallPage /> : <Navigate to="/login" />} Route />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} Route />
        <Route
          path="/onboarding"
          element={authUser ? <OnboardingPage /> : <Navigate to="/login" />}
          Route
        />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;

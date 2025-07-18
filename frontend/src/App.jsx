import { Routes, Route } from "react-router";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import OnboardingPage from "./pages/OnboardingPage";
import CallPage from "./pages/CallPage";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="h-screen" data-theme="coffee">
      <Routes>
        <Route path="/" element={<HomePage />} Route />
        <Route path="/signup" element={<SignUpPage />} Route />
        <Route path="/login" element={<LoginPage />} Route />
        <Route path="/notifications" element={<NotificationsPage />} Route />
        <Route path="/call" element={<CallPage />} Route />
        <Route path="/chat" element={<ChatPage />} Route />
        <Route path="/onboarding" element={<OnboardingPage />} Route />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;

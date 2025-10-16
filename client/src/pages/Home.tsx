import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Camera, Sparkles, History, Settings, CreditCard, LogOut } from "lucide-react";
import { useState } from "react";
import { Route, Switch, useLocation } from "wouter";
import GeneratePage from "./GeneratePage";
import HistoryPage from "./HistoryPage";
import SettingsPage from "./SettingsPage";
import PlansPage from "./PlansPage";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [currentScreen, setCurrentScreen] = useState<"home" | "generate" | "history" | "settings" | "plans">("home");
  
  const { data: creditsData } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B]">
        <div className="loader"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B] p-4">
        <div className="phone-shimmer-bg"></div>
        <Card className="glass-3d-surface max-w-md w-full p-8 text-center relative z-10">
          <div className="mb-6">
            <img src="/logo.png" alt="Fashion Muse Studio" className="w-32 h-32 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#F5F7FA] mb-2">Fashion Muse Studio</h1>
            <p className="text-[#C8CDD5]">Transform your photos into professional fashion art with AI</p>
          </div>
          
          <Button 
            onClick={() => window.location.href = getLoginUrl()}
            className="glass-3d-button primary-button w-full"
          >
            <span className="button-text">Sign In to Get Started</span>
          </Button>
          
          <div className="mt-6 space-y-2 text-sm text-[#8A92A0]">
            <p>✨ 10 free credits on signup</p>
            <p>📸 8 professional camera angles</p>
            <p>💡 Multiple lighting setups</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B] flex items-center justify-center p-4 md:p-8">
      <div className="phone-shimmer-bg"></div>
      
      <div className="phone-frame">
        <div className="screen-content">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Fashion Muse" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-[#F5F7FA]">Fashion Muse</h1>
                <p className="text-xs text-[#8A92A0]">{user?.name || user?.email}</p>
              </div>
            </div>
            
            <div className="glass-3d-surface px-3 py-2 rounded-full flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F5F7FA]" />
              <span className="text-sm font-semibold text-[#F5F7FA]">{creditsData?.credits || 0}</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Switch location={location}>
              <Route path="/" component={WelcomeScreen} />
              <Route path="/generate" component={GeneratePage} />
              <Route path="/history" component={HistoryPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/plans" component={PlansPage} />
            </Switch>
          </div>

          {/* Bottom Navigation */}
          <nav className="bottom-nav glass-3d-surface">
            <button 
              onClick={() => setLocation("/")}
              className={`nav-button glass-3d-button ${location === "/" ? "active" : ""}`}
            >
              <Camera className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setLocation("/generate")}
              className={`nav-button glass-3d-button sparkle-button ${location === "/generate" ? "active" : ""}`}
            >
              <Sparkles className="w-7 h-7" />
            </button>
            
            <button 
              onClick={() => setLocation("/history")}
              className={`nav-button glass-3d-button ${location === "/history" ? "active" : ""}`}
            >
              <History className="w-6 h-6" />
            </button>
            
            <button 
              onClick={() => setLocation("/settings")}
              className={`nav-button glass-3d-button ${location === "/settings" ? "active" : ""}`}
            >
              <Settings className="w-6 h-6" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  const [location, setLocation] = useLocation();
  const { data: creditsData } = trpc.credits.getBalance.useQuery();
  const { data: plans } = trpc.plans.list.useQuery();

  return (
    <div className="space-y-6 pb-20">
      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h2 className="text-2xl font-bold text-[#F5F7FA] mb-4">Welcome to Fashion Muse</h2>
        <p className="text-[#C8CDD5] mb-6">
          Transform your photos into stunning professional fashion photography with AI-powered generation.
        </p>
        
        <Button 
          onClick={() => setLocation("/generate")}
          className="glass-3d-button primary-button w-full mb-4"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          <span className="button-text">Start Creating</span>
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => setLocation("/history")}
            className="glass-3d-button"
          >
            <History className="w-4 h-4 mr-2" />
            <span className="button-text text-sm">History</span>
          </Button>
          
          <Button 
            onClick={() => setLocation("/plans")}
            className="glass-3d-button"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            <span className="button-text text-sm">Plans</span>
          </Button>
        </div>
      </Card>

      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-lg font-semibold text-[#F5F7FA] mb-4">Features</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A76AF] to-[#004b93] flex items-center justify-center flex-shrink-0">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[#F5F7FA] font-medium">8 Camera Angles</p>
              <p className="text-sm text-[#8A92A0]">Professional photography perspectives</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A76AF] to-[#004b93] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[#F5F7FA] font-medium">Multiple Lighting</p>
              <p className="text-sm text-[#8A92A0]">Studio-quality lighting setups</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0A76AF] to-[#004b93] flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[#F5F7FA] font-medium">Credit System</p>
              <p className="text-sm text-[#8A92A0]">Flexible plans for every need</p>
            </div>
          </div>
        </div>
      </Card>

      {plans && plans.length > 0 && (
        <Card className="glass-3d-surface p-6 rounded-3xl">
          <h3 className="text-lg font-semibold text-[#F5F7FA] mb-4">Your Plan</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#F5F7FA] font-medium">Free Plan</p>
              <p className="text-sm text-[#8A92A0]">{creditsData?.credits || 0} credits remaining</p>
            </div>
            <Button 
              onClick={() => setLocation("/plans")}
              className="glass-3d-button"
              size="sm"
            >
              <span className="button-text text-sm">Upgrade</span>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}


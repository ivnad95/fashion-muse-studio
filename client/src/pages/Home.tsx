import { Camera, History, Settings, Sparkles } from "lucide-react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import GeneratePage from "./GeneratePage";
import HistoryPage from "./HistoryPage";
import PlansPage from "./PlansPage";
import SettingsPage from "./SettingsPage";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, loading, error, isAuthenticated } = useAuth();
  const { data: creditsData } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B] flex items-center justify-center">
        <div className="glass-3d-surface p-8 rounded-3xl">
          <div className="animate-pulse text-[#F5F7FA]">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B] flex items-center justify-center p-4">
        <div className="glass-3d-surface p-8 rounded-3xl max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#F5F7FA] mb-4">Authentication Required</h2>
          <p className="text-[#8A92A0] mb-6">Please log in to access Fashion Muse Studio.</p>
          <a
            href={`${import.meta.env.VITE_OAUTH_PORTAL_URL}?app_id=${import.meta.env.VITE_APP_ID}`}
            className="glass-3d-button px-6 py-3 rounded-full inline-block text-[#F5F7FA] font-semibold"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B]">
      {/* Fixed Header - Fully Transparent */}
      <div className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between">
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

      {/* Main Content - Mobile: Stack, Desktop: Grid */}
      <div className="pt-20 pb-28 md:pb-8 px-4 md:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Switch location={location}>
            <Route path="/" component={WelcomeScreen} />
            <Route path="/generate" component={GeneratePage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/plans" component={PlansPage} />
          </Switch>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only, Fully Transparent */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 px-4 pb-6 pt-4 flex items-center justify-center gap-4">
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

      {/* Desktop Navigation - Sidebar */}
      <nav className="hidden md:block fixed left-8 top-1/2 -translate-y-1/2 z-50">
        <div className="glass-3d-surface rounded-3xl p-4 flex flex-col gap-4">
          <button 
            onClick={() => setLocation("/")}
            className={`nav-button glass-3d-button ${location === "/" ? "active" : ""}`}
            title="Home"
          >
            <Camera className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setLocation("/generate")}
            className={`nav-button glass-3d-button sparkle-button ${location === "/generate" ? "active" : ""}`}
            title="Generate"
          >
            <Sparkles className="w-7 h-7" />
          </button>
          
          <button 
            onClick={() => setLocation("/history")}
            className={`nav-button glass-3d-button ${location === "/history" ? "active" : ""}`}
            title="History"
          >
            <History className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setLocation("/settings")}
            className={`nav-button glass-3d-button ${location === "/settings" ? "active" : ""}`}
            title="Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </nav>
    </div>
  );
}

function WelcomeScreen() {
  const [location, setLocation] = useLocation();

  return (
    <div className="space-y-6">
      {/* Hero Section - Desktop: 2 columns */}
      <div className="glass-3d-surface p-8 md:p-12 rounded-3xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#F5F7FA] mb-4">
              Welcome to Fashion Muse
            </h2>
            <p className="text-[#8A92A0] text-lg mb-6">
              Transform your photos into stunning professional fashion photography with AI-powered generation.
            </p>
            <button
              onClick={() => setLocation("/generate")}
              className="glass-3d-button primary-button w-full md:w-auto px-8 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              <span className="button-text">Start Creating</span>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setLocation("/history")}
              className="glass-3d-button p-6 rounded-2xl flex flex-col items-center gap-2"
            >
              <History className="w-8 h-8 text-[#F5F7FA]" />
              <span className="button-text text-sm">History</span>
            </button>
            <button
              onClick={() => setLocation("/plans")}
              className="glass-3d-button p-6 rounded-2xl flex flex-col items-center gap-2"
            >
              <Sparkles className="w-8 h-8 text-[#F5F7FA]" />
              <span className="button-text text-sm">Plans</span>
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid - Desktop: 3 columns */}
      <div className="glass-3d-surface p-8 rounded-3xl">
        <h3 className="text-2xl font-bold text-[#F5F7FA] mb-6">Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="glass-3d-surface p-3 rounded-xl">
              <Camera className="w-6 h-6 text-[#F5F7FA]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#F5F7FA] mb-1">8 Camera Angles</h4>
              <p className="text-sm text-[#8A92A0]">Professional photography perspectives</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="glass-3d-surface p-3 rounded-xl">
              <Sparkles className="w-6 h-6 text-[#F5F7FA]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#F5F7FA] mb-1">Multiple Lighting</h4>
              <p className="text-sm text-[#8A92A0]">Studio-quality lighting setups</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="glass-3d-surface p-3 rounded-xl">
              <Sparkles className="w-6 h-6 text-[#F5F7FA]" />
            </div>
            <div>
              <h4 className="font-semibold text-[#F5F7FA] mb-1">Credit System</h4>
              <p className="text-sm text-[#8A92A0]">Flexible plans for every need</p>
            </div>
          </div>
        </div>
      </div>

      {/* Your Plan Section */}
      <div className="glass-3d-surface p-8 rounded-3xl">
        <h3 className="text-2xl font-bold text-[#F5F7FA] mb-6">Your Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[#F5F7FA] mb-1">Free Plan</h4>
            <p className="text-sm text-[#8A92A0]">10 credits remaining</p>
          </div>
          <button
            onClick={() => setLocation("/plans")}
            className="glass-3d-button px-6 py-3 rounded-full"
          >
            <span className="button-text">Upgrade</span>
          </button>
        </div>
      </div>
    </div>
  );
}


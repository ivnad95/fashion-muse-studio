import { Camera, Grid3x3, Clock, Settings as SettingsIcon } from "lucide-react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useRef } from "react";
import { toast } from "sonner";
import ResultsPage from "./ResultsPage";
import HistoryPage from "./HistoryPage";
import SettingsPage from "./SettingsPage";

export default function Home() {
  const [location, setLocation] = useLocation();
  const { user, loading, error, isAuthenticated } = useAuth();
  const { data: creditsData } = trpc.credits.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Require Manus authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B] flex items-center justify-center">
        <div className="glass-3d-surface p-8 rounded-3xl">
          <div className="animate-pulse text-[#F5F7FA]">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B] flex items-center justify-center p-4">
        <div className="glass-3d-surface p-8 rounded-3xl max-w-md text-center">
          <h2 className="text-2xl font-bold text-[#F5F7FA] mb-4">Welcome to Fashion Muse Studio</h2>
          <p className="text-[#8A92A0] mb-6">Sign in with your Manus account to start generating stunning fashion photography</p>
          <a
            href={`${import.meta.env.VITE_OAUTH_PORTAL_URL}?app_id=${import.meta.env.VITE_APP_ID}`}
            className="glass-3d-button px-6 py-3 rounded-full inline-block text-[#F5F7FA] font-semibold"
          >
            Sign In with Manus
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A133B] via-[#002857] to-[#0A133B]">
      {/* Main Content */}
      <div className="pt-6 pb-28 md:pb-8 px-4 md:px-8 min-h-screen">
        <div className="max-w-2xl mx-auto">
          <Switch location={location}>
            <Route path="/" component={() => <GenerateScreen user={user} creditsData={creditsData} />} />
            <Route path="/results" component={ResultsPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/settings" component={SettingsPage} />
          </Switch>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 flex items-center justify-center gap-4">
        <button 
          onClick={() => setLocation("/")}
          className={`nav-button glass-3d-button ${location === "/" ? "active" : ""}`}
        >
          <Camera className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setLocation("/results")}
          className={`nav-button glass-3d-button ${location === "/results" ? "active" : ""}`}
        >
          <Grid3x3 className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setLocation("/history")}
          className={`nav-button glass-3d-button ${location === "/history" ? "active" : ""}`}
        >
          <Clock className="w-6 h-6" />
        </button>
        
        <button 
          onClick={() => setLocation("/settings")}
          className={`nav-button glass-3d-button ${location === "/settings" ? "active" : ""}`}
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}

function GenerateScreen({ user, creditsData }: any) {
  const [, setLocation] = useLocation();
  const [imageCount, setImageCount] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [style, setStyle] = useState("Editorial");
  const [cameraAngle, setCameraAngle] = useState("Hero low angle");
  const [lighting, setLighting] = useState("Rembrandt");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createMutation = trpc.generations.create.useMutation({
    onSuccess: () => {
      toast.success("Generation started!");
      setImageFile(null);
      setImagePreview("");
      // Redirect to results page
      setLocation("/results");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start generation");
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageFile) {
      toast.error("Please upload an image first");
      return;
    }
    
    // Check credits
    if (user?.role !== 'super_admin' && (!creditsData || creditsData.credits < imageCount)) {
      toast.error("Insufficient credits. Please purchase more credits from Settings.");
      return;
    }

    // Convert image to base64 for upload
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      
      createMutation.mutate({
        originalUrl: base64,
        imageCount,
        aspectRatio: "portrait",
        prompt: "Transform this into a professional fashion photoshoot",
        style,
        cameraAngle,
        lighting,
      });
    };
    reader.readAsDataURL(imageFile);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-4">
      {/* Greeting Card */}
      <div className="glass-3d-surface p-6 rounded-3xl">
        <h1 className="text-2xl font-bold text-[#F5F7FA]">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
        </h1>
      </div>

      {/* Image Count Selector */}
      <div className="flex gap-2 justify-center">
        {[1, 2, 4, 6, 8].map((num) => (
          <button
            key={num}
            onClick={() => setImageCount(num)}
            className={`w-14 h-14 rounded-full glass-3d-button flex items-center justify-center ${
              imageCount === num ? "active" : ""
            }`}
          >
            <span className="button-text font-semibold text-lg">{num}</span>
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div className="glass-3d-surface rounded-3xl overflow-hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[3/4] relative group"
        >
          {imagePreview ? (
            <>
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-white mx-auto mb-2" />
                  <p className="text-white font-medium">Change Image</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <img 
                src="/logo.png" 
                alt="Fashion Muse Studio" 
                className="w-32 h-32 object-contain opacity-60"
              />
              <div className="text-center">
                <p className="text-[#8A92A0] text-lg font-medium mb-1">Tap to upload your photo</p>
                <p className="text-[#8A92A0]/60 text-sm">Start your fashion transformation</p>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={createMutation.isPending || !imageFile}
        className="w-full glass-3d-button primary-button py-4 rounded-3xl disabled:opacity-50"
      >
        {createMutation.isPending ? (
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
        ) : (
          <span className="button-text text-lg font-semibold">Generate Photoshoot</span>
        )}
      </button>

      {/* Advanced Options - Collapsible */}
      <div className="glass-3d-surface rounded-3xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-6 py-4 flex items-center justify-between"
        >
          <span className="text-[#F5F7FA] font-medium">Advanced Options</span>
          <span className="text-[#8A92A0]">{showAdvanced ? "−" : "+"}</span>
        </button>
        
        {showAdvanced && (
          <div className="px-6 pb-6 space-y-4 border-t border-white/10">
            {/* Style Selection */}
            <div className="pt-4">
              <p className="text-[#C8CDD5] text-sm mb-2">Style</p>
              <div className="grid grid-cols-2 gap-2">
                {["Editorial", "Vogue", "Minimalist", "Vintage"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`glass-3d-button px-4 py-2 rounded-xl ${style === s ? "active" : ""}`}
                  >
                    <span className="button-text text-sm">{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Angle */}
            <div>
              <p className="text-[#C8CDD5] text-sm mb-2">Camera Angle</p>
              <div className="grid grid-cols-2 gap-2">
                {["Hero low angle", "Beauty close-up", "Editorial side", "Full body"].map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setCameraAngle(angle)}
                    className={`glass-3d-button px-4 py-2 rounded-xl ${cameraAngle === angle ? "active" : ""}`}
                  >
                    <span className="button-text text-sm">{angle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div>
              <p className="text-[#C8CDD5] text-sm mb-2">Lighting</p>
              <div className="grid grid-cols-2 gap-2">
                {["Rembrandt", "Butterfly", "Split", "Loop"].map((light) => (
                  <button
                    key={light}
                    onClick={() => setLighting(light)}
                    className={`glass-3d-button px-4 py-2 rounded-xl ${lighting === light ? "active" : ""}`}
                  >
                    <span className="button-text text-sm">{light}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Credits Info */}
      <div className="text-center text-sm text-[#8A92A0]">
        Cost: {imageCount} credit{imageCount > 1 ? "s" : ""} • Available: {user?.role === 'super_admin' ? '∞' : (creditsData?.credits || 0)}
      </div>
    </div>
  );
}


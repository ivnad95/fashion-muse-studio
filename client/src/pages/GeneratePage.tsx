import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Camera, Upload, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function GeneratePage() {
  const [imageCount, setImageCount] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("Transform this into a professional fashion photoshoot");
  const [style, setStyle] = useState("Editorial");
  const [cameraAngle, setCameraAngle] = useState("Hero low angle");
  const [lighting, setLighting] = useState("Rembrandt");
  
  const { data: creditsData } = trpc.credits.getBalance.useQuery();
  const createMutation = trpc.generations.create.useMutation({
    onSuccess: () => {
      toast.success("Generation started! Check history for results.");
      setImageUrl("");
      setPrompt("Transform this into a professional fashion photoshoot");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to start generation");
    },
  });

  const handleGenerate = () => {
    if (!imageUrl) {
      toast.error("Please provide an image URL");
      return;
    }
    
    if (!creditsData || creditsData.credits < imageCount) {
      toast.error("Insufficient credits");
      return;
    }

    createMutation.mutate({
      originalUrl: imageUrl,
      imageCount,
      aspectRatio: "portrait",
      prompt,
      style,
      cameraAngle,
      lighting,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h2 className="text-2xl font-bold text-[#F5F7FA] mb-6 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Generate Fashion Art
        </h2>

        <div className="space-y-4">
          {/* Image URL Input */}
          <div>
            <Label className="text-[#C8CDD5] mb-2 block">Image URL</Label>
            <div className="relative">
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="glass-3d-surface border-0 text-[#F5F7FA] placeholder:text-[#8A92A0]"
              />
              <Upload className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A92A0]" />
            </div>
            <p className="text-xs text-[#8A92A0] mt-1">Paste a URL to your image</p>
          </div>

          {/* Prompt */}
          <div>
            <Label className="text-[#C8CDD5] mb-2 block">Prompt</Label>
            <Textarea
              placeholder="Describe the style you want..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="glass-3d-surface border-0 text-[#F5F7FA] placeholder:text-[#8A92A0] min-h-[100px]"
            />
          </div>

          {/* Image Count Selector */}
          <div>
            <Label className="text-[#C8CDD5] mb-3 block">Number of Images ({imageCount})</Label>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setImageCount(num)}
                  className={`number-chip glass-3d-button ${imageCount === num ? "active" : ""}`}
                >
                  <span className="button-text">{num}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#8A92A0] mt-2">
              Cost: {imageCount} credit{imageCount > 1 ? "s" : ""} | Available: {creditsData?.credits || 0}
            </p>
          </div>

          {/* Style Selection */}
          <div>
            <Label className="text-[#C8CDD5] mb-2 block">Style</Label>
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
            <Label className="text-[#C8CDD5] mb-2 block">Camera Angle</Label>
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
            <Label className="text-[#C8CDD5] mb-2 block">Lighting</Label>
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

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={createMutation.isPending || !imageUrl}
            className="glass-3d-button primary-button w-full mt-6"
          >
            {createMutation.isPending ? (
              <div className="loading-dots">
                <div></div>
                <div></div>
                <div></div>
              </div>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                <span className="button-text">Generate ({imageCount} credit{imageCount > 1 ? "s" : ""})</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-sm font-semibold text-[#C8CDD5] mb-3">💡 Tips</h3>
        <ul className="space-y-2 text-sm text-[#8A92A0]">
          <li>• Use high-quality images for best results</li>
          <li>• Be specific in your prompt for better accuracy</li>
          <li>• Generation takes 10-30 seconds</li>
          <li>• Check history tab for completed images</li>
        </ul>
      </Card>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, Heart, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function HistoryPage() {
  const { data: generations, isLoading } = trpc.generations.list.useQuery();
  const toggleFavoriteMutation = trpc.generations.toggleFavorite.useMutation();
  const utils = trpc.useUtils();

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteMutation.mutate({ id }, {
      onSuccess: () => {
        utils.generations.list.invalidate();
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (!generations || generations.length === 0) {
    return (
      <div className="space-y-6 pb-20">
        <Card className="glass-3d-surface p-8 rounded-3xl text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-[#8A92A0]" />
          <h2 className="text-xl font-bold text-[#F5F7FA] mb-2">No Generations Yet</h2>
          <p className="text-[#C8CDD5]">
            Your generated images will appear here. Start creating to see your history!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <h2 className="text-2xl font-bold text-[#F5F7FA] mb-4">Generation History</h2>
      
      {generations.map((generation) => (
        <Card key={generation.id} className="glass-3d-surface p-4 rounded-3xl">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0A76AF] to-[#004b93]">
              {generation.imageUrls && generation.imageUrls.length > 0 ? (
                <img 
                  src={generation.imageUrls[0]} 
                  alt="Generated" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[#F5F7FA] font-medium truncate">{generation.prompt}</p>
                  <p className="text-xs text-[#8A92A0]">
                    {generation.createdAt ? new Date(generation.createdAt).toLocaleDateString() : 'N/A'} • {generation.imageCount} image{generation.imageCount > 1 ? 's' : ''}
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {generation.status === "completed" && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {generation.status === "processing" && (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  )}
                  {generation.status === "failed" && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap gap-2 mb-3">
                {generation.style && (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-[#C8CDD5]">
                    {generation.style}
                  </span>
                )}
                {generation.cameraAngle && (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-[#C8CDD5]">
                    {generation.cameraAngle}
                  </span>
                )}
                {generation.lighting && (
                  <span className="text-xs px-2 py-1 rounded-full bg-white/5 text-[#C8CDD5]">
                    {generation.lighting}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleToggleFavorite(generation.id)}
                  className={`glass-3d-button ${generation.isFavorite ? 'active' : ''}`}
                >
                  <Heart className={`w-4 h-4 ${generation.isFavorite ? 'fill-current' : ''}`} />
                </Button>
                
                {generation.status === "completed" && generation.imageUrls && generation.imageUrls.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => window.open(generation.imageUrls[0], '_blank')}
                    className="glass-3d-button"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    <span className="button-text text-xs">View</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Image Grid for completed generations */}
          {generation.status === "completed" && generation.imageUrls && generation.imageUrls.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {generation.imageUrls.slice(0, 4).map((url: string, idx: number) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                  <img src={url} alt={`Generated ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}


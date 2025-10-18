import { trpc } from "@/lib/trpc";
import { Trash2, Download, Loader2, Clock, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function HistoryPage() {
  const { user } = useAuth();
  const { data: generations, isLoading, refetch } = trpc.generations.list.useQuery();
  const deleteMutation = trpc.generations.delete.useMutation({
    onSuccess: () => {
      toast.success("Generation deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete generation");
    },
  });

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [zoomedImage, setZoomedImage] = useState<{ url: string; generationId: string } | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this generation?")) {
      setDeletingIds(prev => new Set(prev).add(id));
      try {
        await deleteMutation.mutateAsync({ id });
        if (zoomedImage?.generationId === id) {
          setZoomedImage(null);
        }
      } finally {
        setDeletingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    }
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `fashion-muse-${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Image downloaded");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Fashion Muse Studio',
          text: 'Check out this amazing fashion photo!',
          url: url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch (error) {
        toast.error("Failed to share");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F5F7FA]" />
      </div>
    );
  }

  // Get all completed generations EXCEPT the latest one (which is shown in Results)
  const allGenerations = generations
    ?.filter(gen => gen.status === 'completed')
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()) || [];
  
  // Skip the first one (latest) as it's shown in Results page
  const historyGenerations = allGenerations.slice(1);

  // Check if user should see watermark (free users only)
  const showWatermark = user?.subscriptionPlan === 'free' && user?.role !== 'super_admin' && user?.role !== 'admin';

  if (historyGenerations.length === 0) {
    return (
      <div className="space-y-4">
        <div className="glass-3d-surface p-6 rounded-3xl">
          <h1 className="text-2xl font-bold text-[#F5F7FA]">History</h1>
        </div>
        <div className="glass-3d-surface p-12 rounded-3xl text-center">
          <Clock className="w-12 h-12 text-[#8A92A0] mx-auto mb-3" />
          <p className="text-[#8A92A0]">No generation history yet</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="glass-3d-surface p-6 rounded-3xl">
          <h1 className="text-2xl font-bold text-[#F5F7FA]">History</h1>
          <p className="text-sm text-[#8A92A0] mt-1">{historyGenerations.length} previous generation{historyGenerations.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Generation List */}
        <div className="space-y-3">
          {historyGenerations.map((gen) => {
            const imageUrls = (() => {
              try {
                return Array.isArray(gen.imageUrls) ? gen.imageUrls : JSON.parse(gen.imageUrls as string);
              } catch {
                return [];
              }
            })();
            const firstImage = imageUrls[0];
            
            return (
              <div key={gen.id} className="glass-3d-surface rounded-2xl overflow-hidden">
                <div className="flex gap-3 p-3">
                  {/* Thumbnail */}
                  <div 
                    className="w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 glass-3d-surface cursor-pointer relative"
                    onClick={() => firstImage && setZoomedImage({ url: firstImage, generationId: gen.id })}
                  >
                    {firstImage ? (
                      <>
                        <img 
                          src={firstImage} 
                          alt="Generated" 
                          className="w-full h-full object-cover"
                        />
                        {showWatermark && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <img 
                              src="/logo.png" 
                              alt="Fashion Muse Studio" 
                              className="w-8 h-8 object-contain opacity-40"
                            />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-[#8A92A0]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F5F7FA] font-medium text-sm truncate">
                          {gen.style || 'Editorial'} Style
                        </p>
                        <p className="text-xs text-[#8A92A0] mt-0.5">
                          {imageUrls.length} image{imageUrls.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-[#8A92A0] mt-1">
                          {new Date(gen.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Desktop Actions */}
                      <div className="hidden md:flex gap-2">
                        {firstImage && (
                          <>
                            <button
                              onClick={() => handleDownload(firstImage, gen.id)}
                              className="glass-3d-button p-2 rounded-lg"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-[#F5F7FA]" />
                            </button>
                            <button
                              onClick={() => handleShare(firstImage)}
                              className="glass-3d-button p-2 rounded-lg"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4 text-[#F5F7FA]" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(gen.id)}
                          disabled={deletingIds.has(gen.id)}
                          className="glass-3d-button delete-button p-2 rounded-lg"
                          title="Delete"
                        >
                          {deletingIds.has(gen.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Generation Details */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {gen.cameraAngle && (
                        <span className="text-xs px-2 py-0.5 rounded-full glass-3d-surface text-[#C8CDD5]">
                          {gen.cameraAngle}
                        </span>
                      )}
                      {gen.lighting && (
                        <span className="text-xs px-2 py-0.5 rounded-full glass-3d-surface text-[#C8CDD5]">
                          {gen.lighting}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex flex-col"
          onClick={() => setZoomedImage(null)}
        >
          {/* Close Button */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setZoomedImage(null)}
              className="glass-3d-button p-3 rounded-full"
            >
              <X className="w-6 h-6 text-[#F5F7FA]" />
            </button>
          </div>

          {/* Zoomed Image */}
          <div className="flex-1 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative max-w-full max-h-full">
              <img 
                src={zoomedImage.url} 
                alt="Zoomed fashion" 
                className="max-w-full max-h-[70vh] object-contain rounded-2xl"
              />
              
              {/* Watermark on zoomed image for free users */}
              {showWatermark && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img 
                      src="/logo.png" 
                      alt="Fashion Muse Studio" 
                      className="w-24 h-24 object-contain opacity-40"
                    />
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                    <p className="text-[#FFD700] font-bold text-lg tracking-wider drop-shadow-lg">
                      FASHION MUSE
                    </p>
                    <p className="text-[#FFD700] font-bold text-sm tracking-wider drop-shadow-lg">
                      Studio
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="p-6 flex justify-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(zoomedImage.url, zoomedImage.generationId);
              }}
              className="glass-3d-button px-6 py-4 rounded-2xl flex items-center gap-2"
            >
              <Download className="w-5 h-5 text-[#F5F7FA]" />
              <span className="button-text text-[#F5F7FA]">Download</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleShare(zoomedImage.url);
              }}
              className="glass-3d-button px-6 py-4 rounded-2xl flex items-center gap-2"
            >
              <Share2 className="w-5 h-5 text-[#F5F7FA]" />
              <span className="button-text text-[#F5F7FA]">Share</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(zoomedImage.generationId);
              }}
              disabled={deletingIds.has(zoomedImage.generationId)}
              className="glass-3d-button delete-button px-6 py-4 rounded-2xl flex items-center gap-2 disabled:opacity-50"
            >
              {deletingIds.has(zoomedImage.generationId) ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              <span className="button-text">Delete</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}


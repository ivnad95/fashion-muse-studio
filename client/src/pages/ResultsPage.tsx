import { trpc } from "@/lib/trpc";
import { Trash2, Download, Loader2, Share2, X, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function ResultsPage() {
  const { user } = useAuth();
  const { data: generations, isLoading, refetch } = trpc.generations.list.useQuery();
  const deleteMutation = trpc.generations.delete.useMutation({
    onSuccess: () => {
      toast.success("Image deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete image");
    },
  });

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [zoomedImage, setZoomedImage] = useState<{ url: string; id: string; generationId: string } | null>(null);

  // Get the latest generation
  const latestGeneration = generations
    ?.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];

  const isProcessing = latestGeneration?.status === 'processing';
  const isFailed = latestGeneration?.status === 'failed';
  const isCompleted = latestGeneration?.status === 'completed';

  // Auto-refresh while processing
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        refetch();
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [isProcessing, refetch]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
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

  // Parse completed images
  const completedImages = isCompleted && latestGeneration?.imageUrls ? (() => {
    try {
      const urls = Array.isArray(latestGeneration.imageUrls) 
        ? latestGeneration.imageUrls 
        : JSON.parse(latestGeneration.imageUrls as string);
      return urls.map((url: string, index: number) => ({
        id: `${latestGeneration.id}-${index}`,
        generationId: latestGeneration.id,
        url,
        createdAt: latestGeneration.createdAt,
      }));
    } catch {
      return [];
    }
  })() : [];

  // Check if user should see watermark (free users only)
  const showWatermark = user?.subscriptionPlan === 'free' && user?.role !== 'super_admin' && user?.role !== 'admin';

  // No generation at all
  if (!latestGeneration) {
    return (
      <div className="space-y-4">
        <div className="glass-3d-surface p-6 rounded-3xl">
          <h1 className="text-2xl font-bold text-[#F5F7FA]">Results</h1>
        </div>
        <div className="glass-3d-surface p-12 rounded-3xl text-center">
          <Sparkles className="w-16 h-16 text-[#8A92A0] mx-auto mb-4 opacity-50" />
          <p className="text-[#F5F7FA] text-lg font-medium mb-2">Ready to create magic?</p>
          <p className="text-[#8A92A0]">Upload a photo and generate your first photoshoot!</p>
        </div>
      </div>
    );
  }

  // Processing state - show placeholders
  if (isProcessing) {
    const expectedCount = latestGeneration.imageCount || 1;
    
    return (
      <div className="space-y-4">
        {/* Header with Progress */}
        <div className="glass-3d-surface p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#F5F7FA]">Generating...</h1>
              <p className="text-sm text-[#8A92A0] mt-1">Creating {expectedCount} stunning image{expectedCount !== 1 ? 's' : ''}</p>
            </div>
            <Loader2 className="w-8 h-8 animate-spin text-[#4A9EFF]" />
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white/5 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#4A9EFF] to-[#7B61FF] animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Loading Placeholders Grid */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: expectedCount }).map((_, index) => (
            <div 
              key={index} 
              className="glass-3d-surface rounded-2xl overflow-hidden relative"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="aspect-[3/4] relative bg-gradient-to-br from-white/5 to-white/10">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 shimmer"></div>
                
                {/* Loading Icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <Sparkles className="w-12 h-12 text-[#4A9EFF] animate-pulse" />
                    <div className="absolute inset-0 animate-ping">
                      <Sparkles className="w-12 h-12 text-[#4A9EFF] opacity-30" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[#F5F7FA] font-medium text-sm">Image {index + 1}</p>
                    <p className="text-[#8A92A0] text-xs mt-1">Processing...</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Processing Tips */}
        <div className="glass-3d-surface p-4 rounded-2xl">
          <p className="text-[#C8CDD5] text-sm text-center">
            ✨ Creating your professional photoshoot with AI magic...
          </p>
        </div>
      </div>
    );
  }

  // Failed state
  if (isFailed) {
    return (
      <div className="space-y-4">
        <div className="glass-3d-surface p-6 rounded-3xl">
          <h1 className="text-2xl font-bold text-[#F5F7FA]">Results</h1>
        </div>
        <div className="glass-3d-surface p-12 rounded-3xl text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-[#F5F7FA] text-lg font-medium mb-2">Generation Failed</p>
          <p className="text-[#8A92A0] mb-4">{latestGeneration.errorMessage || "Something went wrong. Please try again."}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="glass-3d-button primary-button px-6 py-3 rounded-2xl"
          >
            <span className="button-text">Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Completed state - show images
  if (completedImages.length === 0) {
    return (
      <div className="space-y-4">
        <div className="glass-3d-surface p-6 rounded-3xl">
          <h1 className="text-2xl font-bold text-[#F5F7FA]">Results</h1>
        </div>
        <div className="glass-3d-surface p-12 rounded-3xl text-center">
          <AlertCircle className="w-16 h-16 text-[#8A92A0] mx-auto mb-4 opacity-50" />
          <p className="text-[#8A92A0]">No images were generated. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with Success */}
        <div className="glass-3d-surface p-6 rounded-3xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#F5F7FA]">Results</h1>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm text-[#8A92A0] mt-1">Latest generation • {completedImages.length} image{completedImages.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Grid of Images with Fade-in Animation */}
        <div className="grid grid-cols-2 gap-3">
          {completedImages.map((image, index) => (
            <div 
              key={image.id} 
              className="glass-3d-surface rounded-2xl overflow-hidden group relative cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setZoomedImage(image)}
            >
              <div className="aspect-[3/4] relative">
                <img 
                  src={image.url} 
                  alt="Generated fashion" 
                  className="w-full h-full object-cover"
                />
                
                {/* Watermark for Free Users Only */}
                {showWatermark && (
                  <>
                    {/* Logo Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <img 
                        src="/logo.png" 
                        alt="Fashion Muse Studio" 
                        className="w-20 h-20 object-contain opacity-40"
                      />
                    </div>

                    {/* Logo Text Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-center pointer-events-none">
                      <p className="text-[#FFD700] font-bold text-sm tracking-wider drop-shadow-lg">
                        FASHION MUSE
                      </p>
                      <p className="text-[#FFD700] font-bold text-xs tracking-wider drop-shadow-lg">
                        Studio
                      </p>
                    </div>
                  </>
                )}

                {/* Desktop: Action Buttons - Show on Hover */}
                <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(image.url, image.generationId);
                    }}
                    className="glass-3d-button p-3 rounded-full hover:scale-110 transition-transform"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-[#F5F7FA]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(image.url);
                    }}
                    className="glass-3d-button p-3 rounded-full hover:scale-110 transition-transform"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5 text-[#F5F7FA]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(image.generationId);
                    }}
                    disabled={deletingIds.has(image.generationId)}
                    className="glass-3d-button p-3 rounded-full hover:scale-110 transition-transform disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingIds.has(image.generationId) ? (
                      <Loader2 className="w-5 h-5 text-[#F5F7FA] animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5 text-red-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        <div className="glass-3d-surface p-4 rounded-2xl">
          <p className="text-[#C8CDD5] text-sm text-center">
            ✨ Your photoshoot is ready! Tap any image to view full size.
          </p>
        </div>
      </div>

      {/* Mobile Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex flex-col animate-fade-in"
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


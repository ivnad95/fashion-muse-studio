import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { User, CreditCard, LogOut, Mail, Calendar, Sparkles, Check, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: creditsData } = trpc.credits.getBalance.useQuery();
  const { data: packages } = trpc.credits.getPackages.useQuery();
  const createCheckout = trpc.credits.createCheckout.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      window.location.href = getLoginUrl();
    },
  });

  const [showPlans, setShowPlans] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handlePurchase = async (packageId: string) => {
    try {
      const { url } = await createCheckout.mutateAsync({ packageId });
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to start checkout");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="glass-3d-surface p-6 rounded-3xl">
        <h1 className="text-2xl font-bold text-[#F5F7FA]">Settings</h1>
      </div>

      {/* Profile Card */}
      <div className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-lg font-semibold text-[#F5F7FA] mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A76AF] to-[#004b93] flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#F5F7FA] font-medium">{user?.name || "User"}</p>
              <p className="text-sm text-[#8A92A0]">{user?.email}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#C8CDD5]">
                <Mail className="w-4 h-4" />
                <span className="text-sm">Email</span>
              </div>
              <span className="text-sm text-[#F5F7FA]">{user?.email}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C8CDD5]">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Member since</span>
              </div>
              <span className="text-sm text-[#F5F7FA]">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Card */}
      <div className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-lg font-semibold text-[#F5F7FA] mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Credits
        </h3>
        
        <div className="flex items-center justify-between p-4 rounded-xl glass-3d-surface">
          <div>
            <p className="text-[#C8CDD5] text-sm">Available Credits</p>
            <p className="text-3xl font-bold text-[#F5F7FA]">
              {user?.role === 'super_admin' ? '∞' : (creditsData?.credits || 0)}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A76AF] to-[#004b93] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Credit Packages - Collapsible */}
      <div className="glass-3d-surface rounded-3xl overflow-hidden">
        <button
          onClick={() => setShowPlans(!showPlans)}
          className="w-full px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#F5F7FA]" />
            <span className="text-[#F5F7FA] font-semibold">Buy Credits</span>
          </div>
          {showPlans ? (
            <ChevronUp className="w-5 h-5 text-[#8A92A0]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[#8A92A0]" />
          )}
        </button>
        
        {showPlans && (
          <div className="px-6 pb-6 space-y-3 border-t border-white/10">
            <div className="pt-4">
              <p className="text-[#8A92A0] text-sm mb-4">
                Purchase credits to generate stunning fashion photography
              </p>
            </div>
            
            {packages?.map((pkg) => (
              <div
                key={pkg.id}
                className={`glass-3d-surface p-4 rounded-2xl ${
                  pkg.popular ? 'ring-2 ring-[#0A76AF]' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="mb-2">
                    <span className="bg-gradient-to-r from-[#0A76AF] to-[#004b93] text-white text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                {pkg.bestValue && (
                  <div className="mb-2">
                    <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-xs px-3 py-1 rounded-full font-semibold">
                      Best Value
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-[#F5F7FA] mb-1">{pkg.name}</h4>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-bold text-[#F5F7FA]">£{pkg.price}</span>
                      <span className="text-xs text-[#8A92A0]">
                        £{(pkg.price / pkg.credits).toFixed(2)} per credit
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[#C8CDD5] text-xs">
                        <Check className="w-3 h-3 text-[#0A76AF]" />
                        <span>{pkg.credits} generation credits</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#C8CDD5] text-xs">
                        <Check className="w-3 h-3 text-[#0A76AF]" />
                        <span>Never expires</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    className="glass-3d-button px-6 py-3 rounded-full ml-4"
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={createCheckout.isPending || user?.role === 'super_admin'}
                  >
                    <span className="button-text text-sm">
                      {user?.role === 'super_admin' ? 'Unlimited' : 'Buy'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
            
            <div className="glass-3d-surface p-4 rounded-2xl mt-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-[#0A76AF] mt-1" />
                <div>
                  <p className="text-[#C8CDD5] text-xs">
                    Secure payments via Stripe. Credits added instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-lg font-semibold text-[#F5F7FA] mb-4">Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-xl glass-3d-surface">
            <div>
              <p className="text-[#F5F7FA] font-medium text-sm">Email Updates</p>
              <p className="text-xs text-[#8A92A0]">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A76AF]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl glass-3d-surface">
            <div>
              <p className="text-[#F5F7FA] font-medium text-sm">Generation Complete</p>
              <p className="text-xs text-[#8A92A0]">Notify when ready</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A76AF]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="glass-3d-button delete-button w-full py-4 rounded-3xl"
      >
        <div className="flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          <span className="button-text">
            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
          </span>
        </div>
      </button>

      {/* App Info */}
      <div className="glass-3d-surface p-4 rounded-3xl text-center">
        <p className="text-xs text-[#8A92A0]">Fashion Muse Studio v1.0.0</p>
        <p className="text-xs text-[#8A92A0] mt-1">© 2025 All rights reserved</p>
      </div>
    </div>
  );
}


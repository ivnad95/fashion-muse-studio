import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { User, CreditCard, LogOut, Mail, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: creditsData } = trpc.credits.getBalance.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      window.location.href = getLoginUrl();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold text-[#F5F7FA] mb-4">Settings</h2>

      {/* Profile Card */}
      <Card className="glass-3d-surface p-6 rounded-3xl">
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
      </Card>

      {/* Credits Card */}
      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-lg font-semibold text-[#F5F7FA] mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Credits & Billing
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-[#C8CDD5] text-sm">Available Credits</p>
              <p className="text-2xl font-bold text-[#F5F7FA]">{creditsData?.credits || 0}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0A76AF] to-[#004b93] flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#C8CDD5] text-sm">Current Plan</span>
              <span className="text-[#F5F7FA] font-medium">Free</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#C8CDD5] text-sm">Monthly Credits</span>
              <span className="text-[#F5F7FA] font-medium">10</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-lg font-semibold text-[#F5F7FA] mb-4">Account Actions</h3>
        
        <div className="space-y-3">
          <Button
            onClick={() => toast.info("Feature coming soon!")}
            className="glass-3d-button w-full justify-start"
          >
            <span className="button-text">Change Password</span>
          </Button>
          
          <Button
            onClick={() => toast.info("Feature coming soon!")}
            className="glass-3d-button w-full justify-start"
          >
            <span className="button-text">Notification Settings</span>
          </Button>
          
          <Button
            onClick={() => toast.info("Feature coming soon!")}
            className="glass-3d-button w-full justify-start"
          >
            <span className="button-text">Privacy Settings</span>
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="glass-3d-button delete-button w-full"
      >
        <LogOut className="w-5 h-5 mr-2" />
        <span className="button-text">
          {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
        </span>
      </Button>

      {/* App Info */}
      <Card className="glass-3d-surface p-4 rounded-3xl text-center">
        <p className="text-xs text-[#8A92A0]">Fashion Muse Studio v1.0.0</p>
        <p className="text-xs text-[#8A92A0] mt-1">© 2024 All rights reserved</p>
      </Card>
    </div>
  );
}


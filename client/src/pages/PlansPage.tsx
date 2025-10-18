import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Check, CreditCard, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";

export default function PlansPage() {
  const { user } = useAuth();
  const { data: creditsData } = trpc.credits.getBalance.useQuery();
  const { data: plans } = trpc.plans.list.useQuery();
  const { data: packages } = trpc.credits.getPackages.useQuery();
  const createCheckout = trpc.credits.createCheckout.useMutation();

  const handlePurchase = async (packageId: string) => {
    try {
      const { url } = await createCheckout.mutateAsync({ packageId });
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to start checkout");
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F5F7FA] mb-2">Credit Packages</h1>
        <p className="text-[#C8CDD5]">Purchase credits to generate stunning fashion photography</p>
        
        <div className="mt-4 glass-3d-surface inline-flex items-center gap-2 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-[#F5F7FA]" />
          <span className="text-[#F5F7FA] font-semibold">
            {user?.role === 'super_admin' ? '∞' : (creditsData?.credits || 0)} credits available
          </span>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {packages?.map((pkg) => (
          <div
            key={pkg.id}
            className={`glass-3d-surface p-6 rounded-2xl relative ${
              pkg.popular ? 'ring-2 ring-[#0A76AF]' : ''
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0A76AF] to-[#004b93] text-white text-xs px-3 py-1 rounded-full">
                Most Popular
              </div>
            )}
            {pkg.bestValue && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-xs px-3 py-1 rounded-full font-semibold">
                Best Value
              </div>
            )}
            
            <div className="text-center mb-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#0A76AF] to-[#004b93] flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#F5F7FA] mb-1">{pkg.name}</h3>
              <div className="text-3xl font-bold text-[#F5F7FA]">
                £{pkg.price}
              </div>
              <p className="text-sm text-[#8A92A0] mt-1">
                £{(pkg.price / pkg.credits).toFixed(2)} per credit
              </p>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-[#C8CDD5] text-sm">
                <Check className="w-4 h-4 text-[#0A76AF]" />
                <span>{pkg.credits} generation credits</span>
              </div>
              <div className="flex items-center gap-2 text-[#C8CDD5] text-sm">
                <Check className="w-4 h-4 text-[#0A76AF]" />
                <span>Never expires</span>
              </div>
              <div className="flex items-center gap-2 text-[#C8CDD5] text-sm">
                <Check className="w-4 h-4 text-[#0A76AF]" />
                <span>All styles & features</span>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-[#0A76AF] to-[#004b93] hover:from-[#004b93] hover:to-[#0A76AF] text-white"
              onClick={() => handlePurchase(pkg.id)}
              disabled={createCheckout.isPending || user?.role === 'super_admin'}
            >
              {user?.role === 'super_admin' ? 'Unlimited Credits' : 'Purchase'}
            </Button>
          </div>
        ))}
      </div>

      {/* Subscription Plans Info */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#F5F7FA] mb-4">Subscription Plans</h2>
        <p className="text-[#8A92A0] text-sm mb-6">
          Monthly subscription plans coming soon! For now, purchase credit packages above.
        </p>
      </div>

      <div className="space-y-4">
        {plans?.map((plan) => {
          const features = plan.features as string[];
          return (
            <div
              key={plan.id}
              className="glass-3d-surface p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#F5F7FA] mb-1">{plan.name}</h3>
                <p className="text-[#C8CDD5] text-sm mb-3">{plan.description}</p>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white/5 px-3 py-1 rounded-full text-[#C8CDD5]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#F5F7FA]">
                  {plan.priceMonthly > 0 ? `£${(plan.priceMonthly / 100).toFixed(2)}/mo` : 'Free'}
                </div>
                <div className="text-sm text-[#8A92A0] mt-1">
                  {plan.monthlyCredits} credits/month
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Info */}
      <div className="mt-8 glass-3d-surface p-6 rounded-2xl">
        <div className="flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-[#0A76AF] mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-[#F5F7FA] mb-2">Secure Payment</h3>
            <p className="text-[#C8CDD5] text-sm">
              All payments are processed securely through Stripe. We never store your payment information.
              Credits are added to your account instantly after successful payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


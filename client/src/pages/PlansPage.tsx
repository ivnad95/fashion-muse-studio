import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function PlansPage() {
  const { data: plans, isLoading } = trpc.plans.list.useQuery();
  const { data: creditsData } = trpc.credits.getBalance.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#F5F7FA] mb-2">
          Choose Your Plan
        </h2>
        <p className="text-[#C8CDD5]">
          Unlock unlimited creativity with our flexible plans
        </p>

        <div className="mt-4 glass-3d-surface inline-flex items-center gap-2 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-[#F5F7FA]" />
          <span className="text-[#F5F7FA] font-semibold">
            {creditsData?.credits || 0} credits available
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {plans?.map(plan => {
          const isFree = plan.name === "free";
          const isPopular = plan.name === "pro";

          return (
            <Card
              key={plan.id}
              className={`glass-3d-surface p-6 rounded-3xl relative ${isPopular ? "border-2 border-[#0A76AF]" : ""}`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#0A76AF] to-[#004b93] rounded-full">
                  <span className="text-xs font-bold text-white">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-2xl font-bold text-[#F5F7FA] mb-1">
                  {plan.displayName}
                </h3>
                <p className="text-[#C8CDD5] text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#F5F7FA]">
                    {isFree ? "$0" : `$${(plan.priceMonthly / 100).toFixed(0)}`}
                  </span>
                  <span className="text-[#8A92A0]">/month</span>
                </div>
                {!isFree && (
                  <p className="text-sm text-[#8A92A0] mt-1">
                    or ${(plan.priceYearly / 100).toFixed(0)}/year (save 17%)
                  </p>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-[#0A76AF]" />
                  <span className="text-[#F5F7FA] font-semibold">
                    {plan.monthlyCredits === 999999
                      ? "Unlimited"
                      : plan.monthlyCredits}{" "}
                    credits/month
                  </span>
                </div>

                <ul className="space-y-2">
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-[#0A76AF] flex-shrink-0 mt-0.5" />
                      <span className="text-[#C8CDD5] text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => {
                  if (isFree) {
                    toast.info("You're already on the free plan!");
                  } else {
                    toast.info("Payment integration coming soon!");
                  }
                }}
                className={`glass-3d-button w-full ${isPopular ? "primary-button" : ""}`}
              >
                <span className="button-text">
                  {isFree ? "Current Plan" : "Upgrade Now"}
                </span>
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="glass-3d-surface p-6 rounded-3xl">
        <h3 className="text-lg font-semibold text-[#F5F7FA] mb-3">
          💡 How Credits Work
        </h3>
        <ul className="space-y-2 text-sm text-[#C8CDD5]">
          <li>• Each image generation costs 1 credit</li>
          <li>• Credits reset monthly on your billing date</li>
          <li>• Unused credits don't roll over</li>
          <li>• Cancel anytime, no questions asked</li>
        </ul>
      </Card>
    </div>
  );
}

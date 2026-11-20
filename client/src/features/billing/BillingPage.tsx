import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Check, CreditCard, Zap, CalendarDays } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../auth/useAuth";
import { createCheckoutSession, getPaymentStatus } from "./billing.api";

type PlanId = "free" | "monthly" | "yearly";

const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "USD $0",
    duration: "Unlimited",
    description: "For individuals getting started.",
    features: [
      "Access to invited workspaces",
      "View projects and tasks",
      "Dashboard and notifications",
      "Profile and account settings",
    ],
  },
  {
    id: "monthly" as const,
    name: "Pro Monthly",
    price: "USD $14.99",
    duration: "per month",
    description: "Full access with monthly billing.",
    features: [
      "Create and manage workspaces",
      "Create unlimited projects",
      "Full task management",
      "Team and member management",
      "All Pro workspace features",
    ],
  },
  {
    id: "yearly" as const,
    name: "Pro Yearly",
    price: "USD $149.99",
    duration: "per year",
    description: "Full Pro access with yearly savings.",
    features: [
      "Everything included in Pro Monthly",
      "12 months of Pro access",
      "Save $29.89 compared to monthly",
      "One yearly renewal",
    ],
  },
];

function BillingPage() {
  const { user, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<PlanId>("monthly");
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const isPro = user?.isProActive === true;

  const expiryDate = user?.proExpiresAt ? new Date(user.proExpiresAt) : null;

  const formattedExpiry =
    expiryDate && !Number.isNaN(expiryDate.getTime())
      ? expiryDate.toLocaleDateString("en-PK", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  const isCurrentPlan = (planId: PlanId) => {
    return planId === "free" && !isPro;
  };

  const handleCheckout = async () => {
    if (selectedPlan === "free") {
      setCheckoutError("Please select a Pro plan to continue.");
      return;
    }

    try {
      setIsCheckoutLoading(true);
      setCheckoutError("");

      const response = await createCheckoutSession(selectedPlan);

      if (!response.data.checkoutUrl) {
        throw new Error("Checkout URL was not received.");
      }

      window.location.assign(response.data.checkoutUrl);
    } catch (error) {
      const response =
        typeof error === "object" && error !== null && "response" in error
          ? (
              error as {
                response?: {
                  data?: {
                    message?: string;
                  };
                };
              }
            ).response
          : undefined;

      setCheckoutError(
        response?.data?.message ||
          (error instanceof Error
            ? error.message
            : "Unable to start checkout. Please try again."),
      );

      setIsCheckoutLoading(false);
    }
  };

  useEffect(() => {
    const paymentResult = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    const clearPaymentParams = () => {
      const params = new URLSearchParams(searchParams);
      params.delete("payment");
      params.delete("session_id");

      setSearchParams(params, { replace: true });
    };

    if (paymentResult === "cancelled") {
      queueMicrotask(() => {
        setPaymentMessage("Payment was cancelled. No payment was made.");
        clearPaymentParams();
      });

      return;
    }

    if (paymentResult !== "success" || !sessionId) {
      return;
    }

    let isMounted = true;

    const verifyPayment = async () => {
      try {
        setIsVerifyingPayment(true);
        setPaymentError("");
        setPaymentMessage("Verifying your payment...");

        let paymentStatus = "pending";

        for (let attempt = 1; attempt <= 10; attempt++) {
          const response = await getPaymentStatus(sessionId);

          if (!isMounted) return;

          paymentStatus = response.data.status;

          if (paymentStatus !== "pending") {
            break;
          }

          if (attempt < 10) {
            await new Promise((resolve) => {
              window.setTimeout(resolve, 2000);
            });
          }
        }

        if (!isMounted) return;

        if (paymentStatus === "paid") {
          await refreshUser();

          if (!isMounted) return;

          setPaymentMessage(
            "Payment successful! Your Pro subscription is now active.",
          );

          clearPaymentParams();
        } else if (paymentStatus === "pending") {
          setPaymentMessage(
            "Payment is still being processed. Please check your Billing page again shortly.",
          );
        } else {
          setPaymentMessage("Payment was not completed. You can try again.");
          clearPaymentParams();
        }
      } catch (error) {
        if (!isMounted) return;

        setPaymentMessage("");

        setPaymentError(
          error instanceof Error
            ? error.message
            : "Unable to verify payment. Please try again.",
        );
      } finally {
        setIsVerifyingPayment(false);
      }
    };

    void verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [searchParams, setSearchParams, refreshUser]);

  return (
    <div>
      <PageHeader
        title="Billing & Plans"
        description="Manage your subscription and explore available plans."
      />

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <CreditCard size={23} />
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Your current subscription
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {isPro ? "Pro Plan" : "Free Plan"}
                </h2>

                <Badge variant={isPro ? "success" : "warning"}>
                  {isPro ? "Active" : "Current Plan"}
                </Badge>
              </div>

              {isPro && formattedExpiry && (
                <p className="mt-1 text-sm text-slate-500">
                  <CalendarDays size={14} className="mr-1 inline" />
                  Expires on {formattedExpiry}
                </p>
              )}

              {!isPro && (
                <p className="mt-1 text-sm text-slate-500">
                  Upgrade to Pro to unlock workspace management.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Choose your plan
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Select the subscription that works best for you.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const current = isCurrentPlan(plan.id);
          const selected = selectedPlan === plan.id;

          return (
            <Card key={plan.id}>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">
                  {plan.name}
                </h3>

                {current ? (
                  <Badge variant="success">Current Plan</Badge>
                ) : plan.id !== "free" ? (
                  <Zap className="text-indigo-600" size={22} />
                ) : null}
              </div>

              <p className="mt-5 text-3xl font-bold text-slate-900">
                {plan.price}
              </p>

              <p className="mt-1 text-sm text-slate-500">{plan.duration}</p>

              <p className="mt-4 min-h-10 text-sm text-slate-500">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-green-600"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {current ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500"
                  >
                    Current Plan
                  </button>
                ) : plan.id === "free" ? (
                  <button
                    type="button"
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-500"
                  >
                    Free Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isCheckoutLoading}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setCheckoutError("");
                    }}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      selected
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-300 text-slate-700 hover:border-indigo-400 hover:bg-slate-50"
                    }`}
                  >
                    {selected ? "Selected" : "Select Plan"}
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-900">
              {selectedPlan === "monthly"
                ? "Pro Monthly — USD $14.99"
                : selectedPlan === "yearly"
                  ? "Pro Yearly — USD $149.99"
                  : "Free Plan"}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              You will be redirected to Stripe's secure test checkout.
            </p>
          </div>
          {paymentMessage && (
            <p className="mb-3 text-sm font-medium text-indigo-700">
              {paymentMessage}
            </p>
          )}

          {paymentError && (
            <p className="mb-3 text-sm font-medium text-red-600">
              {paymentError}
            </p>
          )}
          <button
            type="button"
            disabled={
              isCheckoutLoading || isVerifyingPayment || selectedPlan === "free"
            }
            onClick={handleCheckout}
            className="w-full shrink-0 sm:w-auto rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCheckoutLoading ? "Redirecting..." : "Continue to Checkout"}
          </button>
        </div>

        {checkoutError && (
          <p className="mt-3 text-sm font-medium text-red-600">
            {checkoutError}
          </p>
        )}
      </div>
    </div>
  );
}

export default BillingPage;

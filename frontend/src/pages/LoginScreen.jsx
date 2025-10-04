import React from "react";
import { Waves } from "lucide-react";
import { useAuthStore } from "../stores/useAuthStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
});

const LoginScreen = () => {
  const { login, setLoading, handleApiError, showSuccess, showWarning } =
    useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    // Clear any existing toasts first
    toast.dismiss();

    // const loadingToast = toast.loading('🔐 Signing you in...');
    setLoading(true);

    try {
      const res = await fetch("https://ayurtrace.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login failed");
      }

      const { accessToken, user } = await res.json();

      // IMPORTANT: Dismiss loading toast first
      // toast.dismiss(loadingToast);

      // Update the Zustand store with the user data and token
      login(user, accessToken);

      // Show success message
      // toast.success(`✅ Welcome back, ${user.name || user.email}! Redirecting to your dashboard...`);

      setTimeout(() => {
        // Clear all toasts before navigation
        toast.dismiss();

        // Redirect based on the user's role from the API response
        switch (user.role.toLowerCase()) {
          case "fpo":
          case "farmer":
            navigate("/farmer");
            break;
          case "manufacturer":
            navigate("/manufacturer");
            break;
          case "laboratory":
          case "lab":
            navigate("/labs");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          default:
            console.error("Unknown role, cannot redirect.");
            toast.error("❌ Unknown user role. Please contact support.");
            break;
        }
      }, 1500);
    } catch (error) {
      // IMPORTANT: Always dismiss loading toast
      // toast.dismiss(loadingToast);
      setLoading(false);

      console.error("Login error:", error);

      // Clear any existing toasts before showing error
      toast.dismiss();

      // Specific error messages
      if (
        error.message.includes("Invalid credentials") ||
        error.message.includes("password")
      ) {
        toast.error(
          "❌ Invalid email or password. Please check your credentials and try again."
        );
      } else if (error.message.includes("not found")) {
        toast.error(
          "❌ Account not found. Would you like to create a new account?"
        );
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        toast.error(
          "❌ Network error. Please check your connection and try again."
        );
      } else if (
        error.message.includes("suspended") ||
        error.message.includes("blocked")
      ) {
        toast.error(
          "❌ Your account has been suspended. Please contact support."
        );
      } else {
        toast.error("❌ Login failed. Please try again.");
      }
    }
  };

  const handleSignup = () => {
    toast.dismiss(); // Clear existing toasts
    const loadingToast = toast.loading("Redirecting to signup...");

    setTimeout(() => {
      toast.dismiss(loadingToast);
      navigate("/signup");
    }, 1000);
  };

  const handleForgotPassword = () => {
    toast.dismiss(); // Clear existing toasts
    toast.error("🔧 Password reset feature is not yet implemented.");
  };

  // Show validation errors as toasts with proper cleanup
  React.useEffect(() => {
    if (errors.email) {
      toast.dismiss(); // Clear existing toasts
      toast.error(`❌ ${errors.email.message}`);
    }
    if (errors.password) {
      toast.dismiss(); // Clear existing toasts
      toast.error(`❌ ${errors.password.message}`);
    }
  }, [errors]);

  // Welcome toast when component mounts - FIXED DURATION
  React.useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      toast("👋 Welcome back! Please sign in to continue.", {
        icon: "🔐",
        duration: 4000, // 4 seconds duration
      });
    }, 500);

    // Cleanup function to clear toasts when component unmounts
    return () => {
      clearTimeout(welcomeTimer);
      toast.dismiss(); // Clear all toasts on unmount
    };
  }, []);

  // Handle input focus with better toast management
  const handleEmailFocus = () => {
    // Only dismiss error toasts, not loading toasts
    const currentToasts = document.querySelectorAll("[data-hot-toast]");
    currentToasts.forEach((toastEl) => {
      if (toastEl.textContent?.includes("❌")) {
        const toastId = toastEl.getAttribute("data-hot-toast");
        if (toastId) toast.dismiss(toastId);
      }
    });

    toast("📧 Enter your registered email address", {
      icon: "💡",
      duration: 2000,
    });
  };

  const handlePasswordFocus = () => {
    // Only dismiss error toasts, not loading toasts
    const currentToasts = document.querySelectorAll("[data-hot-toast]");
    currentToasts.forEach((toastEl) => {
      if (toastEl.textContent?.includes("❌")) {
        const toastId = toastEl.getAttribute("data-hot-toast");
        if (toastId) toast.dismiss(toastId);
      }
    });

    toast("🔒 Enter your account password", {
      icon: "💡",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-4">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
              <p className="text-sm text-slate-400 mt-1">
                Sign in to your account
              </p>
            </div>
            <div className="p-2 bg-emerald-500/20">
              <Waves className="h-6 w-6 text-[#34d399]" />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                {...register("email")}
                disabled={isSubmitting}
                onFocus={handleEmailFocus}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                  className="text-xs text-[#34d399] hover:text-[#10b981] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                id="password"
                {...register("password")}
                disabled={isSubmitting}
                onFocus={handlePasswordFocus}
                className="mt-1 block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 text-white shadow-sm transition-all duration-300 hover:border-[#34d399] focus:border-[#34d399] focus:ring-1 focus:ring-[#34d399] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-3 border border-[#10b981] bg-[#10b981] text-white font-semibold transition-all duration-300 hover:bg-transparent hover:border-[#34d399] hover:text-[#34d399] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#10b981] disabled:hover:text-white cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent mr-2"></div>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center text-slate-400">
            Don't have an account?{" "}
            <button
              onClick={handleSignup}
              disabled={isSubmitting}
              className="text-[#34d399] hover:text-[#10b981] font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Sign up
            </button>
          </div>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 text-center">
              💡 Demo Mode: Use any valid email format with password
              "password123"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

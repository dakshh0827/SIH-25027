import React, { useEffect, useRef } from "react";
import { Waves, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PublicQRGrid from "../components/PublicQRGrid";

// A custom hook to manage the page theme cleanly
const usePageTheme = (themeClass) => {
  useEffect(() => {
    document.body.classList.add(themeClass);
    // Cleanup function to remove the class when the component unmounts
    return () => {
      document.body.classList.remove(themeClass);
    };
  }, [themeClass]);
};

const LandingPage = () => {
  const navigate = useNavigate();
  const scrollHandlerRef = useRef(null);

  // Apply the green theme class to the body element
  usePageTheme("landing-page-theme");

  // Simplified effect for animations and parallax
  useEffect(() => {
    // --- Initialize Animations on Mount ---
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elementsToAnimate = document.querySelectorAll(".fade-in-effect");
    elementsToAnimate.forEach((el) => observer.observe(el));

    // --- Initialize Parallax Effect ---
    const handleScroll = () => {
      const parallax = document.querySelector(".bg-parallax");
      if (parallax) {
        const yPos = -(window.pageYOffset * 0.2);
        parallax.style.transform = `translate3d(0, ${yPos}px, 0)`;
      }
    };

    scrollHandlerRef.current = handleScroll;
    window.addEventListener("scroll", scrollHandlerRef.current, {
      passive: true,
    });

    // Initial call to set position
    handleScroll();

    // Cleanup function for listeners
    return () => {
      if (scrollHandlerRef.current) {
        window.removeEventListener("scroll", scrollHandlerRef.current);
      }
      observer.disconnect();
    };
  }, []);

  const handleLogin = () => {
    toast.loading("Redirecting to login...");
    setTimeout(() => navigate("/login"), 500);
  };

  const handleSignup = () => {
    toast.loading("Redirecting to signup...");
    setTimeout(() => navigate("/signup"), 500);
  };

  return (
    <>
      {/* Updated styles with consistent background and sharp corners */}
      <style>{`
        body.landing-page-theme {
          background-color: #020617; /* slate-950 */
        }
        .landing-page-theme .logo-icon { color: #34d399; }
        .landing-page-theme .signup-btn {
          border-color: #34d399;
          color: #34d399;
          border-radius: 0; /* Sharp corners */
        }
        .landing-page-theme .signup-btn:hover {
          background-color: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }
        .landing-page-theme .login-btn {
          background-color: #10b981;
          border-color: #10b981;
          color: #ffffff;
          border-radius: 0; /* Sharp corners */
        }
        .landing-page-theme .login-btn:hover {
          background-color: transparent;
          border-color: #34d399;
          color: #34d399;
        }
        .fade-in-effect {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        .fade-in-effect.fade-in-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .fade-in-effect:nth-child(2) { transition-delay: 200ms; }
        .fade-in-effect:nth-child(3) { transition-delay: 400ms; }
        .bg-parallax { will-change: transform; }
        
        /* Override any button border-radius globally for this page */
        .landing-page-theme button {
          border-radius: 0 !important;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image with consistent overlay */}
        <div
          className="bg-parallax fixed top-0 left-0 w-full h-[120vh] z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/6.jpg')` }}
        />
        {/* Single consistent overlay throughout */}
        <div className="fixed inset-0 z-1 bg-slate-950/70" />

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-slate-950/20 backdrop-blur-md border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <Waves className="w-8 h-8 logo-icon" />
            <span className="font-bold text-xl text-white">AyurTrace</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="px-5 py-2 border font-semibold transition-all duration-300 active:scale-[0.98] signup-btn"
              onClick={handleSignup}
            >
              Signup
            </button>
            <button
              className="px-5 py-2 border font-semibold transition-all duration-300 active:scale-[0.98] login-btn"
              onClick={handleLogin}
            >
              Login
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10">
          {/* Hero Section */}
          <section className="min-h-screen flex flex-col justify-center items-center text-center px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="p-5 bg-emerald-500/10 border border-emerald-400/20 inline-block fade-in-effect">
                <Leaf className="h-16 w-16 text-emerald-400" />
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none fade-in-effect">
                Trace Your Herbs
                <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  From Farm to Shelf
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed fade-in-effect">
                Scan a QR code to follow the complete journey of Ayurvedic
                products with verifiable transparency and trust.
              </p>
            </div>
          </section>

          {/* Public QR Codes Section - Consistent background */}
          <section>
            <div className="container mx-auto px-4">
              <div className="text-center mb-16 fade-in-effect">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Explore Public Reports
                </h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  View the complete traceability journey for our publicly
                  available products.
                </p>
              </div>
              <div className="fade-in-effect">
                <PublicQRGrid />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default LandingPage;

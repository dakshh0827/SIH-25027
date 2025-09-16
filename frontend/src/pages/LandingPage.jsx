import React, { useEffect, useRef, useState } from 'react';
import { Waves, CheckCircle, Clock, AlertCircle, ArrowDown, Leaf, Shield, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Mock data for demonstration (unchanged from your code)
const mockProjects = [
  {
    id: 1,
    name: "Sundarbans Mangrove Restoration",
    location: "West Bengal, India",
    area: 150.5,
    carbonCredits: 12500,
    status: "verified",
    description: "Large-scale mangrove restoration project in the Sundarbans delta region."
  },
  {
    id: 2,
    name: "Kerala Backwater Conservation",
    location: "Kerala, India",
    area: 89.2,
    carbonCredits: 7800,
    status: "pending",
    description: "Coastal ecosystem restoration focusing on backwater mangrove systems."
  },
  {
    id: 3,
    name: "Andaman Blue Carbon Initiative",
    location: "Andaman & Nicobar, India",
    area: 203.7,
    carbonCredits: 18200,
    status: "verified",
    description: "Comprehensive blue carbon project covering multiple island ecosystems."
  }
];

const ProjectCard = ({ project, index }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-emerald-300 bg-emerald-700/30 border-emerald-500/30 group-hover:bg-emerald-300 group-hover:text-emerald-900';
      case 'pending': return 'text-amber-300 bg-amber-700/30 border-amber-500/30 group-hover:bg-amber-300 group-hover:text-amber-900';
      default: return 'text-slate-300 bg-slate-700/30 border-slate-500/30 group-hover:bg-slate-300 group-hover:text-slate-900';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="project-card group bg-slate-900/40 border border-transparent hover:bg-slate-800 hover:border-blue-400 transition-all duration-300 cursor-pointer active:scale-[0.98]">
      <div className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white group-hover:text-white mb-2 transition-colors">
              {project.name}
            </h3>
            <p className="text-slate-400 group-hover:text-slate-300 text-sm mb-3 transition-colors">{project.location}</p>
            <p className="text-slate-300 group-hover:text-slate-400 text-sm leading-relaxed transition-colors">{project.description}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 text-xs font-medium border transition-all ${getStatusColor(project.status)}`}>
            {getStatusIcon(project.status)}
            {project.status}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400 group-hover:text-emerald-300 mb-1 transition-colors">
              {project.carbonCredits.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 group-hover:text-slate-500 uppercase tracking-wider transition-colors">Carbon Credits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 mb-1 transition-colors">
              {project.area} ha
            </div>
            <div className="text-xs text-slate-400 group-hover:text-slate-500 uppercase tracking-wider transition-colors">Restored Area</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => {
  return (
    <div className={`feature-card group bg-slate-900/40 border border-transparent p-6 hover:bg-slate-800 hover:border-blue-400 transition-all duration-300 cursor-pointer active:scale-[0.98]`}>
      <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 border border-blue-400/20 mb-4 mx-auto group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-colors">
        <Icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
      </div>
      <h3 className="text-lg font-semibold text-white group-hover:text-white mb-3 text-center transition-colors">{title}</h3>
      <p className="text-slate-400 group-hover:text-slate-400 text-sm leading-relaxed text-center transition-colors">{description}</p>
    </div>
  );
};

const LandingPage = () => {
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const projectsRef = useRef(null);
  const featuresRef = useRef(null);
  const titleRef = useRef(null);

  const projects = mockProjects;
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (!mounted) return;

    // Hero animations
    const titleTimeline = gsap.timeline();
    const titleWords = titleRef.current.querySelectorAll('h1 span');

    titleTimeline.from(titleWords, {
      opacity: 0,
      y: 50,
      stagger: 0.15,
      duration: 1,
      ease: "power3.out"
    })
    .from(".hero-subtitle", {
      opacity: 0,
      y: 30,
      duration: 1,
      ease: "power3.out"
    }, "-=0.7")
    .from(".hero-icon", {
      opacity: 0,
      scale: 0.8,
      duration: 0.8,
      ease: "back.out(1.7)"
    }, "-=0.5");

    // Scroll animations
    gsap.utils.toArray('.animated-section').forEach(section => {
      gsap.from(section.children, {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      });
    });

    // Parallax effect for background
    gsap.to(".bg-parallax", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

  }, [mounted]);

  const stats = {
    totalProjects: projects.length,
    verifiedProjects: projects.filter(p => p.status === 'verified').length,
    totalCredits: projects.reduce((sum, p) => sum + p.carbonCredits, 0),
    totalArea: projects.reduce((sum, p) => sum + p.area, 0)
  };

  const features = [
    {
      icon: Shield,
      title: "Blockchain Verification",
      description: "Immutable and transparent verification system powered by blockchain technology"
    },
    {
      icon: BarChart3,
      title: "Real-time Monitoring",
      description: "Advanced IoT sensors and satellite imagery for continuous ecosystem monitoring"
    },
    {
      icon: Leaf,
      title: "Carbon Credit Generation",
      description: "Automated carbon credit calculation and issuance based on verified data"
    }
  ];
  
  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Background with Parallax */}
      <div 
        className="bg-parallax absolute top-0 left-0 w-full h-[150%] z-0"
        style={{
          backgroundImage: `url('/5.jpeg')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />

      {/* Header with Navigation Buttons */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-end items-center bg-slate-950/20 backdrop-blur-md border-b border-slate-800/50">
        <div className="hidden">Logo/Title</div>
        <div className="flex items-center gap-4">
          <button 
            className="px-5 py-2 border border-blue-400 text-blue-400 font-semibold transition-all duration-300 hover:bg-blue-800/30 hover:text-white active:scale-[0.98] cursor-pointer"
            onClick={handleSignup}
          >
            Signup
          </button>
          <button 
            className="px-5 py-2 border border-slate-600 text-slate-300 font-semibold transition-all duration-300 hover:bg-slate-800 hover:text-white active:scale-[0.98] cursor-pointer"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </header>
      
      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="min-h-screen flex flex-col justify-center items-center px-6 text-center pt-24 md:pt-0">
          <div className="max-w-6xl mx-auto space-y-8" ref={heroRef}>
            <div className="hero-icon flex justify-center mb-8">
              <div className="p-6 bg-blue-500/10 border-2 border-blue-400/20 backdrop-blur-sm">
                <Waves className="h-20 w-20 text-blue-400" />
              </div>
            </div>
            
            <div ref={titleRef} className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-none">
                <span className="block">BLUE CARBON</span>
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  REGISTRY
                </span>
              </h1>
            </div>
            
            <div className="hero-subtitle space-y-6">
              <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
                Next-generation blockchain-powered <span className="font-semibold text-blue-300">Monitoring, Reporting, and Verification</span> system for blue carbon ecosystems
              </p>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                Transparent, immutable, and verifiable carbon credit generation from coastal ecosystem restoration
              </p>
            </div>
          </div>
          
          <div className="scroll-indicator absolute bottom-8 flex flex-col items-center text-slate-400">
            <span className="text-sm uppercase tracking-wider mb-2">Scroll to explore</span>
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 animated-section" ref={featuresRef}>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose Blue Carbon Registry</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Advanced technology meets environmental conservation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-6 py-16 animated-section">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Impact Metrics</h2>
            <p className="text-slate-400">Real-time data from our global network</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="stat-card group bg-slate-900/40 backdrop-blur-md border border-transparent p-8 text-center transition-all duration-300 hover:bg-slate-800 hover:border-blue-400 active:scale-[0.98]">
              <div className="text-4xl font-bold text-blue-400 group-hover:text-blue-300 mb-2 transition-colors">{stats.totalProjects}</div>
              <div className="text-slate-300 group-hover:text-slate-500 uppercase tracking-widest text-sm transition-colors">Active Projects</div>
            </div>
            <div className="stat-card group bg-slate-900/40 backdrop-blur-md border border-transparent p-8 text-center transition-all duration-300 hover:bg-slate-800 hover:border-blue-400 active:scale-[0.98]">
              <div className="text-4xl font-bold text-emerald-400 group-hover:text-emerald-300 mb-2 transition-colors">{stats.verifiedProjects}</div>
              <div className="text-slate-300 group-hover:text-slate-500 uppercase tracking-widest text-sm transition-colors">Verified Projects</div>
            </div>
            <div className="stat-card group bg-slate-900/40 backdrop-blur-md border border-transparent p-8 text-center transition-all duration-300 hover:bg-slate-800 hover:border-blue-400 active:scale-[0.98]">
              <div className="text-4xl font-bold text-green-400 group-hover:text-green-300 mb-2 transition-colors">{stats.totalCredits.toLocaleString()}</div>
              <div className="text-slate-300 group-hover:text-slate-500 uppercase tracking-widest text-sm transition-colors">Carbon Credits</div>
            </div>
            <div className="stat-card group bg-slate-900/40 backdrop-blur-md border border-transparent p-8 text-center transition-all duration-300 hover:bg-slate-800 hover:border-blue-400 active:scale-[0.98]">
              <div className="text-4xl font-bold text-teal-400 group-hover:text-teal-300 mb-2 transition-colors">{stats.totalArea.toFixed(1)}</div>
              <div className="text-slate-300 group-hover:text-slate-500 uppercase tracking-widest text-sm transition-colors">Hectares Restored</div>
            </div>
          </div>
        </div>
        
        {/* Projects Section */}
        <div className="max-w-7xl mx-auto px-6 py-20 animated-section">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Featured Projects</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Verified blue carbon restoration initiatives transforming coastal ecosystems across India
            </p>
          </div>
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8" ref={projectsRef}>
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-4xl mx-auto px-6 py-20 text-center animated-section">
          <div className="bg-slate-900/40 backdrop-blur-md border border-transparent p-12 transition-all duration-300 hover:bg-slate-800 hover:border-blue-400 active:scale-[0.98]">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 group-hover:text-white transition-colors">
              Ready to Make an Impact?
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed group-hover:text-slate-400 transition-colors">
              Join the future of carbon credit verification and help restore our blue carbon ecosystems
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-300 active:scale-[0.98]"
              >
                Start a Project
              </button>
              <button 
                className="px-8 py-3 border border-slate-600 text-slate-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white font-semibold transition-all duration-300 active:scale-[0.98]"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
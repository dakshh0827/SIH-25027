import React, { useState, useRef, useEffect } from 'react';
import { Waves, Search, Leaf, Factory, TestTubeDiagonal, Tractor, Eye } from 'lucide-react';

// Mock data for a single product's provenance
const mockProvenanceData = {
    batchId: "VEDA-A-12345",
    productName: "Ashwagandha Capsules",
    status: "Verified on Blockchain",
    events: [
        {
            id: 1,
            type: "CollectionEvent",
            title: "Herb Harvested",
            date: "2023-09-15",
            details: "Ashwagandha (Withania somnifera) harvested by farmer collective in Jaipur, Rajasthan.",
            location: "26.9124° N, 75.7873° E",
            actor: "Farmer Collective FPO",
            icon: Tractor,
        },
        {
            id: 2,
            type: "ProcessingStep",
            title: "Herbs Processed",
            date: "2023-09-20",
            details: "Drying and grinding of herbs at VedaHerbs processing facility.",
            location: "28.7041° N, 77.1025° E",
            actor: "VedaHerbs Ayurvedic Pvt. Ltd.",
            icon: Factory,
        },
        {
            id: 3,
            type: "QualityTest",
            title: "Lab Test Performed",
            date: "2023-09-25",
            details: "Tested for heavy metals and microbial limits. Report #NABL-TC-1234.",
            location: "28.7041° N, 77.1025° E",
            actor: "Herbal Quality Labs Pvt. Ltd.",
            icon: TestTubeDiagonal,
        },
        {
            id: 4,
            type: "FinalProduct",
            title: "Product Packaged",
            date: "2023-09-30",
            details: "Encapsulated and packaged with unique QR code for consumer traceability.",
            location: "28.7041° N, 77.1025° E",
            actor: "VedaHerbs Ayurvedic Pvt. Ltd.",
            icon: Waves,
        },
    ],
};

// Mock data for most viewed products
const mockMostViewedProducts = [
    {
        id: 1,
        name: "Ashwagandha Capsules",
        company: "VedaHerbs Ayurvedic Pvt. Ltd.",
        views: 1245,
        status: "Verified",
    },
    {
        id: 2,
        name: "Tulsi Tea Blend",
        company: "Organic Wellness Co.",
        views: 987,
        status: "Verified",
    },
    {
        id: 3,
        name: "Brahmi Syrup",
        company: "BrainBoost Pharma",
        views: 752,
        status: "Verified",
    }
];

const ProductCard = ({ product }) => {
    return (
        <div className="bg-slate-900/40 border border-transparent p-6 space-y-4 transition-all duration-300 hover:bg-slate-800 hover:border-blue-400 active:scale-[0.98]">
            <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white">{product.name}</h4>
                <div className="flex items-center gap-2 text-sm text-green-400">
                    <Eye className="w-4 h-4" />
                    <span>{product.views.toLocaleString()}</span>
                </div>
            </div>
            <p className="text-sm text-slate-400">{product.company}</p>
            <span className="inline-block bg-green-600/30 text-green-400 text-xs px-2 py-1 font-semibold">
                {product.status}
            </span>
        </div>
    );
};

const LandingPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [provenanceData, setProvenanceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const heroRef = useRef(null);
    const mostViewedRef = useRef(null);
    const titleRef = useRef(null);

    const handleSearch = () => {
        if (!searchTerm) return;
        setLoading(true);
        setProvenanceData(null);

        // Simulate an API call
        setTimeout(() => {
            if (searchTerm.toUpperCase() === mockProvenanceData.batchId) {
                setProvenanceData(mockProvenanceData);
            } else {
                setProvenanceData(null);
            }
            setLoading(false);
        }, 1500);
    };

    const handleLogin = () => {
        alert('Login button clicked!');
    };

    const handleSignup = () => {
        alert('Signup button clicked!');
    };

    useEffect(() => {
        setMounted(true);
        
        // Since we can't import GSAP in this environment, we'll use CSS animations
        // and simulate the scroll effects with vanilla JavaScript
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all animated sections
        const animatedSections = document.querySelectorAll('.animated-section');
        animatedSections.forEach((section) => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            observer.observe(section);
        });

        // Hero animation
        const heroElements = document.querySelectorAll('.hero-animate');
        heroElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });

        // Parallax effect
        const handleScroll = () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.bg-parallax');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-950">
            {/* Background with Parallax - Updated to match second code pattern */}
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
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-slate-950/20 backdrop-blur-md border-b border-slate-800/50">
                <div className="flex items-center gap-2">
                    <Waves className="w-8 h-8 text-blue-400" />
                    <span className="font-bold text-xl text-white">AyurTrace</span>
                </div>
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
                        <div className="hero-animate flex justify-center mb-8">
                            <div className="p-6 bg-emerald-500/10 border-2 border-emerald-400/20 backdrop-blur-sm">
                                <Leaf className="h-20 w-20 text-emerald-400" />
                            </div>
                        </div>
                        
                        <div ref={titleRef} className="space-y-4">
                            <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-none hero-animate">
                                <span className="block">TRACE YOUR</span>
                                <span className="block bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">HERBS</span>
                            </h1>
                        </div>
                        
                        <div className="hero-animate space-y-6">
                            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
                                Scan a QR code or enter a batch ID to view the full journey of your <span className="font-semibold text-emerald-300">Ayurvedic product</span>, from farm to shelf
                            </p>
                            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                                Transparent, immutable, and verifiable supply chain tracking
                            </p>
                        </div>
                        
                        <div className="hero-animate mt-8 flex items-center max-w-lg mx-auto">
                            <input
                                type="text"
                                placeholder="Enter Batch ID (try: VEDA-A-12345)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-6 py-4 bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 transition-colors duration-300 focus:outline-none focus:border-emerald-400 backdrop-blur-sm"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 active:scale-[0.98]"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Provenance Results Section (Dynamic) */}
                <div className="max-w-7xl mx-auto px-6 py-12">
                    {loading && (
                        <div className="text-center text-slate-400 py-12">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Searching blockchain records...</p>
                        </div>
                    )}
                    {!loading && provenanceData && (
                        <div className="animated-section bg-slate-900/40 backdrop-blur-md border border-transparent p-8 space-y-8 transition-all duration-300 hover:bg-slate-800 hover:border-emerald-400">
                            <h2 className="text-3xl font-bold text-white text-center">
                                Provenance Record: <span className="text-emerald-400">{provenanceData.batchId}</span>
                            </h2>
                            <div className="relative border-l-2 border-slate-700 ml-4 pl-8 space-y-12">
                                {/* Timeline */}
                                {provenanceData.events.map((event, index) => (
                                    <div key={event.id} className="relative timeline-event">
                                        <div className="absolute -left-12 top-0 flex items-center justify-center w-10 h-10 bg-slate-800 border-2 border-emerald-400 text-emerald-400 backdrop-blur-sm rounded-full">
                                            <event.icon className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                                            <p className="text-sm text-slate-400">Date: {event.date}</p>
                                            <p className="text-sm text-slate-400">Actor: {event.actor}</p>
                                            <p className="text-sm text-slate-300">{event.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {!loading && !provenanceData && searchTerm && (
                        <div className="text-center text-red-400 mt-8 py-12">
                            <p className="text-lg">No matching record found for that batch ID.</p>
                            <p className="text-sm text-slate-500 mt-2">Try: VEDA-A-12345</p>
                        </div>
                    )}
                </div>

                {/* Most Viewed Products Section */}
                <div className="max-w-7xl mx-auto px-6 py-20 animated-section" ref={mostViewedRef}>
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Most Viewed Products</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            See what other customers are tracing to ensure quality and authenticity
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {mockMostViewedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className="max-w-4xl mx-auto px-6 py-20 text-center animated-section">
                    <div className="bg-slate-900/40 backdrop-blur-md border border-transparent p-12 transition-all duration-300 hover:bg-slate-800 hover:border-emerald-400 active:scale-[0.98]">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to Make an Impact?
                        </h2>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            Join the future of supply chain transparency and help build trust in Ayurvedic medicine
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 active:scale-[0.98]"
                            >
                                Start a Project
                            </button>
                            <button
                                className="px-8 py-3 border border-slate-600 text-slate-300 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white font-semibold transition-all duration-300 active:scale-[0.98]"
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
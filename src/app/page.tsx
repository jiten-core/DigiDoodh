'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Shield,
  Zap,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  PhoneCall,
  MessageCircle,
  Milk,
  Calculator,
  FileText,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

const LandingPage = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stats with animation
  const [stats, setStats] = useState({
    dairies: 0,
    farmers: 0,
    liters: 0,
    states: 0
  });

  // Pricing plans
  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: '₹0',
      duration: '/month',
      description: 'For small dairies',
      features: [
        'Add milk (today only)',
        'Up to 10 farmers',
        'Basic reports',
        'Mobile app'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Business',
      price: '₹199',
      duration: '/month',
      description: 'For growing dairies',
      features: [
        '1-month history',
        'Up to 500 farmers',
        'WhatsApp alerts',
        'PDF Reports',
        'Priority support',
        'No ads'
      ],
      popular: true
    },
    {
      id: 'ultimate',
      name: 'Enterprise',
      price: '₹499',
      duration: '/month',
      description: 'For large dairies',
      features: [
        '1-year history',
        'Unlimited farmers',
        'Offline mode',
        'AI Assistant',
        'Custom branding',
        'API access',
        'Dedicated support'
      ],
      popular: false
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Ramesh Patel',
      role: 'Dairy Owner, Gujarat',
      content: 'DigiDhoodh saved us 3 hours daily. Farmers get timely payments now.',
      rating: 5
    },
    {
      name: 'Sunita Devi',
      role: 'Dairy Manager, Bihar',
      content: 'The mobile app is so easy. Even our farmers use it.',
      rating: 5
    },
    {
      name: 'Arjun Singh',
      role: 'Dairy Owner, Punjab',
      content: 'Best dairy software in India. Support team is very helpful.',
      rating: 5
    }
  ];

  // Core features
  const features = [
    {
      icon: Milk,
      title: 'Milk Collection',
      description: 'Record milk with FAT, SNF, CLR. Auto rate calculation.',
      color: 'bg-dairy-500'
    },
    {
      icon: Calculator,
      title: 'Auto Billing',
      description: 'Automatic bill generation for farmers and buyers.',
      color: 'bg-saffron-500'
    },
    {
      icon: WifiOff,
      title: 'Offline Mode',
      description: 'Works without internet. Syncs when connected.',
      color: 'bg-earth-600'
    },
    {
      icon: Bell,
      title: 'WhatsApp Alerts',
      description: 'Auto payment updates via WhatsApp to farmers.',
      color: 'bg-dairy-600'
    },
    {
      icon: FileText,
      title: 'PDF Reports',
      description: 'Daily, weekly, monthly reports. Print or share.',
      color: 'bg-saffron-600'
    },
    {
      icon: Users,
      title: 'Multi-Staff',
      description: 'Multiple staff members with their own logins.',
      color: 'bg-earth-500'
    }
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        dairies: Math.min(prev.dairies + Math.floor(Math.random() * 3) + 1, 1250),
        farmers: Math.min(prev.farmers + Math.floor(Math.random() * 50) + 10, 15000),
        liters: Math.min(prev.liters + Math.floor(Math.random() * 1000) + 100, 250000),
        states: Math.min(prev.states + 1, 12)
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const handleGetStarted = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-milk-texture dark:bg-background">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'glass-warm shadow-warm'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-dairy-premium rounded-2xl flex items-center justify-center shadow-dairy">
                <span className="text-2xl">🥛</span>
              </div>
              <div>
                <span className="text-xl md:text-2xl font-display font-bold text-dairy-700 dark:text-dairy-400">
                  DigiDhoodh
                </span>
                <span className="hidden md:block text-xs text-earth-500 dark:text-earth-400 font-medium">
                  Smart Dairy Management
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#features" className="text-earth-700 dark:text-earth-300 hover:text-dairy-600 dark:hover:text-dairy-400 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-earth-700 dark:text-earth-300 hover:text-dairy-600 dark:hover:text-dairy-400 font-medium transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-earth-700 dark:text-earth-300 hover:text-dairy-600 dark:hover:text-dairy-400 font-medium transition-colors">
                Testimonials
              </a>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2.5 rounded-xl bg-cream-100 dark:bg-earth-800 hover:bg-cream-200 dark:hover:bg-earth-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-saffron-500" /> : <Moon className="w-5 h-5 text-earth-600" />}
                </button>
              )}

              {/* CTA Button */}
              <button
                onClick={handleGetStarted}
                className="btn-dairy text-base px-6 py-3"
              >
                Open Dashboard
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-cream-100 dark:bg-earth-800 tap-target"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border">
            <div className="px-4 py-4 space-y-2 safe-area-bottom">
              <a href="#features" className="block px-4 py-3 rounded-xl hover:bg-muted font-medium tap-target">
                Features
              </a>
              <a href="#pricing" className="block px-4 py-3 rounded-xl hover:bg-muted font-medium tap-target">
                Pricing
              </a>
              <a href="#testimonials" className="block px-4 py-3 rounded-xl hover:bg-muted font-medium tap-target">
                Testimonials
              </a>
              <button
                onClick={handleGetStarted}
                className="btn-dairy w-full mt-2"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-organic-pattern">
        {/* Background decorations */}
        <div className="absolute top-20 right-0 w-72 h-72 bg-dairy-200/30 dark:bg-dairy-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-saffron-200/20 dark:bg-saffron-800/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-dairy-100 dark:bg-dairy-900/50 text-dairy-700 dark:text-dairy-300 mb-6">
                <span className="text-lg">🇮🇳</span>
                <span className="font-medium">Made in India • Offline-First</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold mb-6 leading-tight">
                <span className="text-dairy-600 dark:text-dairy-400">
                  Your Dairy,
                </span>
                <br />
                <span className="text-foreground">
                  In Your Hands
                </span>
                <br />
                <span className="text-saffron-500 text-3xl sm:text-4xl lg:text-5xl">
                  🥛 DigiDhoodh
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl text-earth-600 dark:text-earth-300 mb-8 max-w-3xl mx-auto font-medium">
                Milk collection, farmer payments, billing - all in one app. Works offline too!
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleGetStarted}
                className="btn-dairy text-lg px-8 group"
              >
                <span>Start Free</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href="tel:+919876543210"
                className="btn-saffron text-lg px-8"
              >
                <PhoneCall className="w-5 h-5 mr-2" />
                <span>+91 98765 43210</span>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
              {[
                { value: stats.dairies, suffix: '+', label: 'Dairies' },
                { value: stats.farmers, suffix: '+', label: 'Farmers' },
                { value: Math.floor(stats.liters / 1000), suffix: 'L+', label: 'Milk/day' },
                { value: stats.states, suffix: '', label: 'States' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="stat-card stagger-item"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className="text-3xl sm:text-4xl font-bold text-dairy-600 dark:text-dairy-400 animate-count">
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-earth-600 dark:text-earth-400 font-medium mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
              Everything in One Place
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage even the largest dairy with ease
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-premium p-6 md:p-8"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-earth-gradient dark:bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
              Simple Pricing
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 md:p-8 ${plan.popular
                  ? 'bg-dairy-premium text-white scale-105 shadow-dairy'
                  : 'card-premium'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-saffron-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-saffron">
                      POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-1">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold mb-2">
                    {plan.price}
                    <span className="text-lg font-normal opacity-80">{plan.duration}</span>
                  </div>
                  <p className={plan.popular ? 'text-white/80' : 'text-muted-foreground'}>
                    {plan.description}
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <span className={plan.popular ? 'text-white' : 'text-foreground'}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => router.push('/dashboard')}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-[1.02] ${plan.popular
                    ? 'bg-white text-dairy-700 hover:bg-cream-100'
                    : 'btn-dairy'
                    }`}
                >
                  {plan.id === 'free' ? 'Start Free' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="text-center card-premium p-8 md:p-12">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-saffron-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl text-foreground mb-8 font-medium leading-relaxed">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <div className="farmer-avatar">
                    {testimonials[activeTestimonial].name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-foreground">
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className="text-muted-foreground">
                      {testimonials[activeTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dots */}
              <div className="flex justify-center space-x-2 mt-6">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === activeTestimonial
                      ? 'bg-dairy-500 w-8'
                      : 'bg-border w-2'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-dairy-premium">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Get Started Today!
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            14-day free trial. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-dairy-700 rounded-2xl text-lg font-bold hover:bg-cream-100 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Start Free Trial
            </button>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-2xl text-lg font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>WhatsApp Demo</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-earth-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-dairy-premium rounded-xl flex items-center justify-center">
                  <span className="text-xl">🥛</span>
                </div>
                <span className="text-xl font-bold">DigiDhoodh</span>
              </div>
              <p className="text-earth-300">
                Smart Dairy Management 🇮🇳
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Product</h4>
              <ul className="space-y-2 text-earth-300">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link href="/mobile-app" className="hover:text-white transition-colors">Mobile App</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Support</h4>
              <ul className="space-y-2 text-earth-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-lg">Legal</h4>
              <ul className="space-y-2 text-earth-300">
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-earth-700 pt-8 text-center text-earth-400">
            <p>© {new Date().getFullYear()} DigiDhoodh Technologies Pvt. Ltd. All rights reserved.</p>
            <p className="mt-2">Made with ❤️ in India, for Indian dairy farmers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
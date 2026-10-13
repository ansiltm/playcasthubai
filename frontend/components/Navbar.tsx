'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { 
  ShoppingCart, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ArrowLeft,
  ChevronDown,
  Package,
  Layers,
  Award,
  User
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

const CATEGORIES = [
  { name: 'All Products', href: '/products' },
  { name: 'Vehicles & RC', href: `/products?category=${encodeURIComponent('Vehicles & Remote-Controlled (RC)')}` },
  { name: 'Action Figures', href: `/products?category=${encodeURIComponent('Action Figures & Pop-Culture Collectibles')}` },
  { name: 'Scale Model Kits', href: `/products?category=${encodeURIComponent('Scale Model Kits & Hobby Crafts')}` },
  { name: 'STEM & Educational', href: `/products?category=${encodeURIComponent('Educational, STEM & STEAM Toys')}` },
  { name: 'Smart Toys', href: `/products?category=${encodeURIComponent('Electronic, Smart & Animatronic Toys')}` },
  { name: 'Outdoor Play', href: `/products?category=${encodeURIComponent('Outdoor, Sports & Active Play')}` },
];

const GRADES = [
  { name: 'All Grades', desc: 'Browse full collection', href: '/products' },
  { name: 'Toy-Grade', desc: 'Fun & accessible toys for all ages', href: `/products?grade=${encodeURIComponent('Toy-Grade')}` },
  { name: 'Semi-Hobby Grade', desc: 'Step up with prosumer performance', href: `/products?grade=${encodeURIComponent('Semi-Hobby / Prosumer Grade')}` },
  { name: 'Hobby-Grade', desc: 'High-performance enthusiast & repairable models', href: `/products?grade=${encodeURIComponent('Hobby-Grade')}` },
  { name: 'Collector-Grade', desc: 'Extreme scale display fidelity & detailed diecasts', href: `/products?grade=${encodeURIComponent('Collector-Grade / Display-Grade')}` },
  { name: 'Commercial Grade', desc: 'Heavy-duty & commercial models', href: `/products?grade=${encodeURIComponent('Institutional / Commercial Grade')}` },
  { name: 'Artisan Grade', desc: 'Boutique & limited edition crafts', href: `/products?grade=${encodeURIComponent('Artisan / Designer Grade')}` },
];

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isGradesOpen, setIsGradesOpen] = useState(false);
  const [isDesktopCatOpen, setIsDesktopCatOpen] = useState(false);
  const [isDesktopGradeOpen, setIsDesktopGradeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const desktopCatRef = useRef<HTMLDivElement>(null);
  const desktopGradeRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopCatRef.current && !desktopCatRef.current.contains(e.target as Node)) {
        setIsDesktopCatOpen(false);
      }
      if (desktopGradeRef.current && !desktopGradeRef.current.contains(e.target as Node)) {
        setIsDesktopGradeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCategoriesOpen(false);
    setIsGradesOpen(false);
    setIsDesktopCatOpen(false);
    setIsDesktopGradeOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-bubble-surface/90 backdrop-blur-md border-b border-border-main shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Back Button & Logo */}
            <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
              {mounted && pathname !== '/' && (
                <button 
                  onClick={() => router.back()} 
                  className="p-2 md:p-2.5 bg-bubble-input hover:bg-gray-200 dark:hover:bg-gray-700 text-text-muted hover:text-primary rounded-full transition-colors shadow-sm border border-border-main"
                  aria-label="Go Back"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              
              <div className="flex items-center space-x-3 shrink-0 group">
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                  <div className="relative w-12 h-12 overflow-hidden rounded-[var(--radius-pill)] shadow-[var(--shadow-bubble)] group-hover:scale-105 transition-transform">
                    <Image src="/logo.jpeg" alt="PlaycastHub Logo" fill className="object-cover" />
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                      PlaycastHub
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Categories & Grades Dropdowns */}
              <div className="hidden lg:flex items-center space-x-2 ml-4">
                {/* Categories Dropdown */}
                <div className="relative" ref={desktopCatRef}>
                  <button
                    onClick={() => {
                      setIsDesktopCatOpen(!isDesktopCatOpen);
                      setIsDesktopGradeOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-text-main hover:text-primary hover:bg-bubble-input transition-colors"
                  >
                    <Layers size={15} className="text-primary" />
                    <span>Categories</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isDesktopCatOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDesktopCatOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-bubble-surface border border-border-main rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {CATEGORIES.map((cat, idx) => (
                        <Link
                          key={idx}
                          href={cat.href}
                          onClick={() => setIsDesktopCatOpen(false)}
                          className="block px-3 py-2 rounded-xl text-xs font-medium text-text-main hover:bg-bubble-input hover:text-primary transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grades Dropdown */}
                <div className="relative" ref={desktopGradeRef}>
                  <button
                    onClick={() => {
                      setIsDesktopGradeOpen(!isDesktopGradeOpen);
                      setIsDesktopCatOpen(false);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-text-main hover:text-secondary hover:bg-bubble-input transition-colors"
                  >
                    <Award size={15} className="text-secondary" />
                    <span>Grades</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isDesktopGradeOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDesktopGradeOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-bubble-surface border border-border-main rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {GRADES.map((g, idx) => (
                        <Link
                          key={idx}
                          href={g.href}
                          onClick={() => setIsDesktopGradeOpen(false)}
                          className="block px-3 py-2 rounded-xl text-xs text-text-main hover:bg-bubble-input hover:text-secondary transition-colors"
                        >
                          <span className="font-bold block">{g.name}</span>
                          <span className="text-[11px] text-text-muted">{g.desc}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-xl mx-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search toys, diecasts, RC..."
                  className="bubble-input w-full pl-12 py-2.5 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </form>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-5">
              {mounted && (
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-bubble-input"
                  aria-label="Toggle Theme"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}

              {/* My Orders link on desktop */}
              {user && (
                <Link 
                  href="/orders" 
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-text-main hover:text-primary hover:bg-bubble-input rounded-xl transition-colors"
                  title="My Orders & Live Tracking"
                >
                  <Package size={17} className="text-primary" />
                  <span>My Orders</span>
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-text-muted hover:text-primary transition-colors">
                <ShoppingCart size={22} />
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-secondary rounded-full">
                    {items.length}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-3">
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-xs font-black uppercase tracking-wider bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors">
                      Super Admin
                    </Link>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-text-main truncate max-w-[110px]">Hi, {user.name}</span>
                    <button 
                      onClick={handleLogout} 
                      className="p-1.5 text-text-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-500/10"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="bubble-btn text-xs px-5 py-2.5">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button & Cart */}
            <div className="flex items-center space-x-3 md:hidden">
              <Link href="/cart" className="relative p-2 text-text-muted dark:text-gray-300">
                <ShoppingCart size={22} />
                {items.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-secondary rounded-full">
                    {items.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-text-muted hover:text-primary focus:outline-none rounded-xl hover:bg-bubble-input transition-colors"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>

          {/* Mobile Search - Always visible under top row */}
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search toys, diecasts, RC..."
                className="bubble-input w-full pl-10 py-2.5 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </form>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-bubble-surface border-b border-border-main shadow-2xl absolute w-full left-0 top-full flex flex-col p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            
            {/* Quick Links */}
            <div className="flex flex-col space-y-2 pb-3 border-b border-border-main">
              <div className="grid grid-cols-2 gap-2">
                <Link 
                  href="/" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-bubble-input text-xs font-bold text-text-main hover:text-primary text-center transition-colors border border-border-main"
                >
                  Home
                </Link>
                <Link 
                  href="/products" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-bubble-input text-xs font-bold text-text-main hover:text-primary text-center transition-colors border border-border-main"
                >
                  All Products
                </Link>
              </div>

              {/* COLLAPSIBLE CATEGORIES ACCORDION */}
              <div className="rounded-2xl bg-bubble-input border border-border-main overflow-hidden mt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="w-full px-4 py-3 text-sm font-bold text-text-main hover:text-primary flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers size={18} className="text-primary" />
                    <span>Categories</span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-text-muted transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180 text-primary' : ''}`} 
                  />
                </button>

                {isCategoriesOpen && (
                  <div className="px-3 pb-3 pt-1 space-y-1 bg-bubble-surface/60 border-t border-border-main animate-in fade-in duration-150">
                    {CATEGORIES.map((cat, idx) => (
                      <Link
                        key={idx}
                        href={cat.href}
                        onClick={() => {
                          setIsCategoriesOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="block px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-primary hover:bg-bubble-input transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* COLLAPSIBLE HOBBY & TOY GRADE ACCORDION */}
              <div className="rounded-2xl bg-bubble-input border border-border-main overflow-hidden mt-1">
                <button
                  type="button"
                  onClick={() => setIsGradesOpen(!isGradesOpen)}
                  className="w-full px-4 py-3 text-sm font-bold text-text-main hover:text-secondary flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Award size={18} className="text-secondary" />
                    <span>Grades</span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-text-muted transition-transform duration-200 ${isGradesOpen ? 'rotate-180 text-secondary' : ''}`} 
                  />
                </button>

                {isGradesOpen && (
                  <div className="px-3 pb-3 pt-1 space-y-1 bg-bubble-surface/60 border-t border-border-main animate-in fade-in duration-150">
                    {GRADES.map((g, idx) => (
                      <Link
                        key={idx}
                        href={g.href}
                        onClick={() => {
                          setIsGradesOpen(false);
                          setIsMobileMenuOpen(false);
                        }}
                        className="block px-3 py-2 rounded-xl text-xs text-text-muted hover:text-secondary hover:bg-bubble-input transition-colors"
                      >
                        <span className="font-bold block text-text-main">{g.name}</span>
                        <span className="text-[11px] opacity-75">{g.desc}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account & Orders Section */}
            <div className="space-y-3 pt-1">
              {user ? (
                <>
                  <div className="px-4 py-3 bg-bubble-input rounded-2xl flex items-center justify-between border border-border-main">
                    <div className="flex items-center gap-2.5">
                      <User size={18} className="text-primary" />
                      <span className="font-black text-sm text-text-main">Hi, {user.name}</span>
                    </div>
                    {user.role === 'admin' && (
                      <span className="text-[10px] font-black uppercase bg-primary/20 text-primary px-2.5 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* USER ORDER HISTORY & TRACKING */}
                  <Link 
                    href="/orders" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-2xl font-bold text-sm text-text-main hover:bg-bubble-input hover:text-primary flex items-center gap-3 transition-colors border border-border-main"
                  >
                    <Package size={20} className="text-primary" />
                    <div className="text-left">
                      <span className="block font-black">My Orders</span>
                      <span className="block text-[11px] text-text-muted font-normal">Track order status & view receipts</span>
                    </div>
                  </Link>

                  {user.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="px-4 py-3 rounded-2xl font-bold text-sm text-primary hover:bg-bubble-input flex items-center gap-3 transition-colors border border-primary/20"
                    >
                      <Award size={20} />
                      <span>Super Admin Dashboard</span>
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-4 py-3 rounded-2xl font-bold text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link 
                    href="/login" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="bubble-btn text-center justify-center py-3"
                  >
                    Login to Account
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="bubble-btn-secondary text-center justify-center py-2.5 text-xs font-bold"
                  >
                    Create New Account
                  </Link>
                </div>
              )}

              {/* Theme Toggle Button */}
              {mounted && (
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full px-4 py-3 rounded-2xl text-left font-bold text-xs text-text-muted hover:text-primary hover:bg-bubble-input flex items-center gap-2.5 transition-colors border-t border-border-main mt-3"
                >
                  {theme === 'dark' ? <><Sun size={18} /> Switch to Light Mode</> : <><Moon size={18} /> Switch to Dark Mode</>}
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Search, LogOut, Menu, X, Sun, Moon, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const categories = [
    { name: 'Vehicles & RC', query: 'Vehicles & Remote-Controlled (RC)', icon: '🏎️' },
    { name: 'Action Figures', query: 'Action Figures & Pop-Culture Collectibles', icon: '🦸‍♂️' },
    { name: 'Model Kits', query: 'Scale Model Kits & Hobby Crafts', icon: '🛠️' },
    { name: 'STEM & Tech', query: 'Educational, STEM & STEAM Toys', icon: '🔬' },
    { name: 'Smart Toys', query: 'Electronic, Smart & Animatronic Toys', icon: '🤖' },
    { name: 'Outdoor Play', query: 'Outdoor, Sports & Active Play', icon: '⛺' }
  ];

  const grades = [
    { name: 'Toy-Grade', query: 'Toy-Grade' },
    { name: 'Semi-Hobby', query: 'Semi-Hobby / Prosumer Grade' },
    { name: 'Hobby-Grade', query: 'Hobby-Grade' },
    { name: 'Collector', query: 'Collector-Grade / Display-Grade' }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <nav className="sticky top-0 z-50 w-full bg-bubble-surface/90 backdrop-blur-md border-b border-blue-50 shadow-sm">
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
            
            <button onClick={() => setIsSidebarOpen(true)} className="flex items-center space-x-3 shrink-0 cursor-pointer group hover:opacity-80 transition-opacity">
              <div className="relative w-12 h-12 overflow-hidden rounded-[var(--radius-pill)] shadow-[var(--shadow-bubble)] border-2 border-white group-hover:scale-105 transition-transform">
                <Image src="/logo.jpeg" alt="PlaycastHub Logo" fill className="object-cover" />
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  PlaycastHub
                </span>
                <Menu className="text-text-muted hidden lg:block" size={20} />
              </div>
            </button>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search toys, diecasts, RC..."
                className="bubble-input w-full pl-12 py-3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-6">
            
            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-gray-100 "
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            <Link href="/cart" className="relative p-2 text-text-muted hover:text-primary transition-colors">
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-secondary rounded-full">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-bold text-primary hover:text-primary-dark">
                    Super Admin
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-text-main truncate max-w-[100px]">Hi, {user.name}</span>
                  <button onClick={handleLogout} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="bubble-btn text-sm px-5 py-2.5">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button & Cart */}
          <div className="flex items-center space-x-4 md:hidden">
            <Link href="/cart" className="relative p-2 text-text-muted dark:text-gray-300">
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-secondary rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text-muted hover:text-primary focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-bubble-surface border-b border-border-main shadow-lg absolute w-full left-0 top-full flex flex-col p-4 space-y-4">
          <div className="flex flex-col space-y-4">
            {mounted && (
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-left font-bold text-text-muted hover:text-primary flex items-center gap-2 pb-4 border-b border-border-main"
              >
                {theme === 'dark' ? <><Sun size={20} /> Switch to Light Mode</> : <><Moon size={20} /> Switch to Dark Mode</>}
              </button>
            )}

            {user ? (
              <>
                <div className="font-bold text-text-main">Hi, {user.name}</div>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-bold">
                    Super Admin Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="text-left text-red-500 font-bold flex items-center gap-2">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="bubble-btn text-center justify-center">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
      </nav>

      {/* Left Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          
          {/* Sidebar Panel */}
          <div className="relative w-80 max-w-[80vw] bg-bubble-surface h-full flex flex-col shadow-2xl overflow-y-auto transform transition-transform duration-300">
            <div className="p-6 border-b border-border-main flex justify-between items-center sticky top-0 bg-bubble-surface/90 backdrop-blur-md z-10">
              <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 group">
                <div className="relative w-10 h-10 overflow-hidden rounded-[var(--radius-pill)] border-2 border-white group-hover:scale-110 transition-transform">
                  <Image src="/logo.jpeg" alt="PlaycastHub" fill className="object-cover" />
                </div>
                <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  Menu
                </span>
              </Link>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-text-muted hover:text-red-500 bg-bubble-input rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 space-y-8 pb-20">
              <Link href="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 font-bold text-lg text-text-main hover:text-primary transition-colors bubble-card p-4">
                🏠 Home
              </Link>
              
              <div>
                <h3 className="text-sm font-black text-text-muted uppercase tracking-wider mb-4 px-2">Categories</h3>
                <div className="flex flex-col space-y-2">
                  {categories.map((c, i) => (
                    <Link key={i} href={`/products?category=${encodeURIComponent(c.query)}`} onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-text-main hover:text-primary hover:bg-bubble-input p-3 rounded-xl transition-all font-medium">
                      <span className="text-xl">{c.icon}</span> {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-text-muted uppercase tracking-wider mb-4 px-2">Grades</h3>
                <div className="flex flex-col space-y-2">
                  {grades.map((g, i) => (
                    <Link key={i} href={`/products?grade=${encodeURIComponent(g.query)}`} onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-3 text-text-main hover:text-primary hover:bg-bubble-input p-3 rounded-xl transition-all font-medium">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block shrink-0 shadow-[var(--shadow-bubble)]" /> 
                      {g.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

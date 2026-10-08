import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-bubble-surface border-t border-border-main mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 overflow-hidden rounded-[var(--radius-pill)] shadow-sm">
                <Image src="/logo.jpeg" alt="PlaycastHub Logo" fill className="object-cover" />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                PlaycastHub
              </span>
            </div>
            <p className="text-text-muted text-sm">
              Your ultimate destination for Toy Grade, Hobby Grade, and Semi Toy Grade items. Experience products in full 3D before you buy.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-text-main mb-4">Categories</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><a href="/products?category=Vehicles+%26+Remote-Controlled+%28RC%29" className="hover:text-primary">Vehicles & RC</a></li>
              <li><a href="/products?category=Action+Figures+%26+Pop-Culture+Collectibles" className="hover:text-primary">Action Figures</a></li>
              <li><a href="/products?category=Scale+Model+Kits+%26+Hobby+Crafts" className="hover:text-primary">Scale Model Kits</a></li>
              <li><a href="/products?category=Educational%2C+STEM+%26+STEAM+Toys" className="hover:text-primary">STEM & Educational</a></li>
              <li><a href="/products?category=Electronic%2C+Smart+%26+Animatronic+Toys" className="hover:text-primary">Smart Toys</a></li>
              <li><a href="/products?category=Outdoor%2C+Sports+%26+Active+Play" className="hover:text-primary">Outdoor Play</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-text-main mb-4">Grades</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li><a href="/products?grade=Toy-Grade" className="hover:text-primary">Toy-Grade</a></li>
              <li><a href="/products?grade=Semi-Hobby+%2F+Prosumer+Grade" className="hover:text-primary">Semi-Hobby Grade</a></li>
              <li><a href="/products?grade=Hobby-Grade" className="hover:text-primary">Hobby-Grade</a></li>
              <li><a href="/products?grade=Collector-Grade+%2F+Display-Grade" className="hover:text-primary">Collector-Grade</a></li>
              <li><a href="/products?grade=Institutional+%2F+Commercial+Grade" className="hover:text-primary">Commercial Grade</a></li>
              <li><a href="/products?grade=Artisan+%2F+Designer+Grade" className="hover:text-primary">Artisan Grade</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-text-main mb-4">Newsletter</h3>
            <p className="text-sm text-text-muted mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="bubble-input rounded-r-none border-r-0 focus:ring-0" />
              <button className="bg-primary text-white px-4 rounded-r-[var(--radius-pill)] font-bold hover:bg-primary-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border-main text-center text-sm text-text-muted">
          © {new Date().getFullYear()} PlaycasthubAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

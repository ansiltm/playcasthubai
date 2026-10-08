export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              PlaycastHub
            </span>
            <p className="text-gray-500 text-sm">
              Your ultimate destination for RC, Toys, Diecast, and Hobby-grade items. Experience products in full 3D before you buy.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Shop Categories</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="/products?category=RC Cars" className="hover:text-primary">RC Cars</a></li>
              <li><a href="/products?category=Diecast Models" className="hover:text-primary">Diecast Models</a></li>
              <li><a href="/products?category=Action Figures" className="hover:text-primary">Action Figures</a></li>
              <li><a href="/products?category=Educational Toys" className="hover:text-primary">Educational Toys</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-primary">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-primary">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-primary">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-sm text-gray-600 mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <div className="flex">
              <input type="email" placeholder="Enter your email" className="bubble-input rounded-r-none border-r-0 focus:ring-0" />
              <button className="bg-primary text-white px-4 rounded-r-[var(--radius-pill)] font-bold hover:bg-primary-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} PlaycasthubAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

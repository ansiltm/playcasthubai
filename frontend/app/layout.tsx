import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Toaster } from 'react-hot-toast';

import { ThemeProvider } from '../components/ThemeProvider';

export const metadata: Metadata = {
  title: 'PlaycastHub',
  description: 'Discover toys, RC cars, diecast models, puzzles and collectibles for kids and hobby enthusiasts.',
  icons: {
    icon: '/logo.jpeg',
    shortcut: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function purgeNetlifyBadge() {
                  try {
                    var frames = document.querySelectorAll('#nl-badge-frame, #nl-hud-frame, iframe[title="Powered by Netlify"], iframe[title="Netlify"], iframe[id^="nl-"]');
                    frames.forEach(function(f) { f.remove(); });
                  } catch (e) {}
                }
                if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
                  var obs = new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      var m = mutations[i];
                      for (var j = 0; j < m.addedNodes.length; j++) {
                        var node = m.addedNodes[j];
                        if (node.nodeType === 1) {
                          if (node.id === 'nl-badge-frame' || node.id === 'nl-hud-frame' || (node.tagName === 'IFRAME' && (node.title === 'Powered by Netlify' || node.title === 'Netlify' || (node.id && node.id.indexOf('nl-') === 0)))) {
                            node.remove();
                          }
                        }
                      }
                    }
                  });
                  obs.observe(document.documentElement, { childList: true, subtree: true });
                  window.addEventListener('DOMContentLoaded', purgeNetlifyBadge);
                  window.addEventListener('load', purgeNetlifyBadge);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="bg-bubble-bg text-text-main min-h-screen flex flex-col transition-colors duration-300" suppressHydrationWarning>
        <ThemeProvider>
          <Toaster position="top-center" />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

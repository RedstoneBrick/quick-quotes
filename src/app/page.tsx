import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-semibold text-xl">Quick Quotes</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm hover:text-orange-500 transition-colors">
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Quick Quotes for Tradesmen
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-10">
              Generate professional quotes for brickwork, blockwork, and cavity wall constructions in minutes. 
              Includes material calculations, pricing, and PDF export.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-orange-600 transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/dashboard"
                className="border border-gray-300 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need to Quote Jobs
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1: Masonry Calculator */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Masonry Calculator</h3>
                <p className="text-gray-700">
                  Automatically calculate bricks, blocks, mortar, and wall ties needed for any wall size. 
                  Supports brickwork, blockwork, and cavity walls.
                </p>
              </div>

              {/* Feature 2: Materials Pricing */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Materials Pricing</h3>
                <p className="text-gray-700">
                  Track material prices from suppliers. Get real-time pricing updates and maintain 
                  accurate costings for every job.
                </p>
              </div>

              {/* Feature 3: Professional PDFs */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Professional PDFs</h3>
                <p className="text-gray-700">
                  Generate polished, professional PDF quotes with your company branding. 
                  Send directly to customers or print for onsite meetings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Streamline Your Quotes?
            </h2>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
              Join tradesmen who save time and win more jobs with Quick Quotes.
            </p>
            <Link
              href="/dashboard"
              className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-orange-600 transition-colors inline-block"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Q</span>
                </div>
                <span className="font-semibold text-lg">Quick Quotes</span>
              </div>
              <p className="text-sm text-gray-700">
                Professional quote generation for tradesmen.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><Link href="#" className="hover:text-orange-500">Features</Link></li>
                <li><Link href="#" className="hover:text-orange-500">Pricing</Link></li>
                <li><Link href="#" className="hover:text-orange-500">Documentation</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><Link href="#" className="hover:text-orange-500">About</Link></li>
                <li><Link href="#" className="hover:text-orange-500">Blog</Link></li>
                <li><Link href="#" className="hover:text-orange-500">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li><Link href="#" className="hover:text-orange-500">Privacy</Link></li>
                <li><Link href="#" className="hover:text-orange-500">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-700">
            &copy; {new Date().getFullYear()} Quick Quotes. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
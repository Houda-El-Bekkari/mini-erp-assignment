import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 animate-gradient bg-[length:200%_200%] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-subtle"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-subtle animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-subtle animation-delay-4000"></div>
      </div>

      <div className="text-center max-w-4xl relative z-10 animate-fade-in">
        <div className="inline-flex items-center justify-center mb-6 px-4 py-2 bg-blue-50/80 backdrop-blur-sm rounded-full border border-blue-100 shadow-sm animate-slide-up">
          <svg className="w-3 h-3 text-blue-500 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span className="text-sm font-medium text-blue-700">Enterprise Management Solution</span>
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Modern <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ERP</span> System
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
          Streamline your business operations with our intelligent multi-role enterprise platform
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center mb-20 animate-slide-up animation-delay-300">
          <Link 
            href="/admin" 
            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-5 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-500/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Launch Admin Dashboard
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </Link>
          <Link 
            href="/login" 
            className="group bg-white/90 backdrop-blur-sm text-gray-800 border border-gray-200 px-10 py-5 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 shadow-md hover:border-blue-300 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center justify-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Access Login Portal
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mb-16">
          {[
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: "Multi-Role Architecture",
              desc: "Advanced role-based access for Admin, Supervisor, Operator, and Client with customized interfaces.",
              color: "from-blue-500 to-blue-600"
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "Smart Analytics",
              desc: "Real-time insights, predictive analytics, and comprehensive reporting dashboard.",
              color: "from-indigo-500 to-indigo-600"
            },
            {
              icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ),
              title: "Enterprise Security",
              desc: "Military-grade encryption, audit trails, and compliance-ready data protection.",
              color: "from-slate-600 to-slate-700"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/80 backdrop-blur-sm p-7 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-100 animate-slide-up"
              style={{ animationDelay: `${index * 100 + 500}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md flex items-center justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-700 transition-colors pt-2">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 leading-relaxed pl-1">
                {feature.desc}
              </p>
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="text-blue-600 font-medium text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore feature
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 p-7 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 backdrop-blur-sm rounded-2xl border border-blue-100/50 shadow-sm max-w-2xl mx-auto animate-fade-in animation-delay-1000">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-4 h-4 text-green-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <p className="font-bold text-gray-800 text-lg">Live Demo Environment</p>
          </div>
          <p className="text-gray-600">
            Click <span className="font-semibold text-blue-700">Admin Dashboard</span> for instant access. All features are fully functional with pre-configured demo data.
          </p>
          <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-2 h-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span>No registration required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-2 h-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span>Real-time updates</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200/50">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Modern ERP System. Enterprise-grade business management platform.
          </p>
        </div>
      </div>
    </div>
  );
}
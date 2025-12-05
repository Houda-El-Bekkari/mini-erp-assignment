'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, User, LogOut, Home, PlusCircle, MessageSquare, Phone, Mail, Clock } from 'lucide-react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('role');
    const user = localStorage.getItem('user');
    
    if (role !== 'client') {
      router.push('/login');
    }
    
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setUserName(parsedUser.name || 'Client');
        setUserEmail(parsedUser.email || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-cyan-50/20">
      {/* Top Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/client" className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Client Portal</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-600">Connected</span>
                </div>
              </div>
            </Link>
            <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 text-sm font-semibold rounded-full border border-emerald-200">
              Client Account
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">Welcome, {userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-xl hover:border-gray-400 hover:shadow-sm transition-all duration-200"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 min-h-[calc(100vh-81px)] sticky top-[81px]">
          <nav className="p-6">
            <div className="mb-8">
              <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-4">Navigation</h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/client"
                    className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl transition-all duration-200"
                  >
                    <Home className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/client/claims"
                    className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl transition-all duration-200"
                  >
                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    <span className="font-medium">My Claims</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/client/claims/new"
                    className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl transition-all duration-200"
                  >
                    <PlusCircle className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    <span className="font-medium">New Claim</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/client/profile"
                    className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl transition-all duration-200"
                  >
                    <User className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    <span className="font-medium">My Profile</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Section */}
            <div className="mt-12 p-4 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 rounded-xl border border-emerald-100/50">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-gray-700">Need Help?</h3>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-3 h-3" />
                  <span>support@company.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-3 h-3" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-3 h-3" />
                  <span>9AM-6PM EST</span>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
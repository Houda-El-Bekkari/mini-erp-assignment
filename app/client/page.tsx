'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Plus, CheckCircle, Clock, AlertCircle, 
  MessageSquare, Download, Eye, ChevronRight, BarChart3,
  Users, TrendingUp, Shield
} from 'lucide-react';
import Link from 'next/link';

type Claim = {
  id: string;
  title: string;
  description: string;
  status: 'submitted' | 'in_review' | 'resolved';
  clientId: string;
  clientName: string;
  assignedToName: string;
  fileUrl: string | null;
  comments: string;
  createdAt: string;
};

export default function ClientDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState<any>(null);

  const fetchClientInfo = async () => {
    setLoading(true);
    try {
      let clientEmail = '';
      
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          clientEmail = user.email;
        }
      }
      
      if (clientEmail) {
        const clientsRes = await fetch('/api/clients');
        const clientsData = await clientsRes.json();
        const currentClient = clientsData.find((c: any) => c.email === clientEmail);
        
        if (currentClient) {
          setClientInfo(currentClient);
          
          const claimsRes = await fetch(`/api/clients/${currentClient.id}/claims`);
          const claimsData = await claimsRes.json();
          
          if (claimsRes.ok) {
            setClaims(claimsData.claims || []);
          } else {
            console.error('Error fetching client claims:', claimsData.error);
            setClaims([]);
          }
        }
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientInfo();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="text-emerald-500" size={20} />;
      case 'in_review': return <Clock className="text-amber-500" size={20} />;
      default: return <AlertCircle className="text-blue-500" size={20} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'in_review': return 'In Review';
      case 'submitted': return 'Submitted';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'in_review': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'submitted': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const recentClaims = claims.slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Hello{clientInfo?.name ? `, ${clientInfo.name}` : ''} 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your claims and track their progress
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            href="/client/claims/new"
            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Plus size={20} />
            New Claim
            <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Claims</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{claims.length}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-xl">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Submitted</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {claims.filter(c => c.status === 'submitted').length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-xl">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {claims.filter(c => c.status === 'in_review').length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Resolved</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {claims.filter(c => c.status === 'resolved').length}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 rounded-xl">
              <CheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Claims */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Recent Claims</h2>
                  <p className="text-gray-600 text-sm mt-1">Track the progress of your requests</p>
                </div>
                <Link
                  href="/client/claims"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                >
                  View All
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>

            {recentClaims.length > 0 ? (
              <div className="divide-y divide-gray-200/50">
                {recentClaims.map((claim) => (
                  <div key={claim.id} className="p-6 hover:bg-gray-50/50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(claim.status)}`}>
                            {getStatusIcon(claim.status)}
                            <span className="font-medium text-sm">
                              {getStatusLabel(claim.status)}
                            </span>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {new Date(claim.createdAt).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-800 mt-3">{claim.title}</h3>
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                          {claim.description || 'No description'}
                        </p>
                        {claim.comments && (
                          <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                            <MessageSquare size={14} />
                            <span className="truncate">{claim.comments}</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Link
                          href={`/client/claims/${claim.id}`}
                          className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </Link>
                        {claim.fileUrl && (
                          <a
                            href={claim.fileUrl}
                            target="_blank"
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Download File"
                          >
                            <Download size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-block p-4 bg-gradient-to-br from-emerald-50 to-cyan-50 text-emerald-600 rounded-2xl mb-4">
                  <FileText size={48} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Claims Yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any claims yet.
                </p>
                <Link
                  href="/client/claims/new"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus size={20} />
                  Create Your First Claim
                </Link>
              </div>
            )}
            
            {recentClaims.length > 0 && (
              <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 text-sm">
                    {recentClaims.length} recent claim{recentClaims.length > 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={fetchClientInfo}
                    className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
                  >
                    <span>🔄 Refresh</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Quick Guide */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-cyan-50/50 border border-emerald-100/50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">How to proceed?</h3>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  1
                </div>
                <span>Click on "New Claim"</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  2
                </div>
                <span>Fill out the form with details</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  3
                </div>
                <span>Attach documents if needed</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  4
                </div>
                <span>Submit and track status</span>
              </li>
            </ol>
          </div>

          {/* Status Meanings */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Status Meanings</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-lg">
                <AlertCircle className="text-blue-500" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Submitted</p>
                  <p className="text-gray-600 text-sm">Awaiting processing</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-lg">
                <Clock className="text-amber-500" size={20} />
                <div>
                  <p className="font-medium text-gray-800">In Review</p>
                  <p className="text-gray-600 text-sm">Under analysis</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-lg">
                <CheckCircle className="text-emerald-500" size={20} />
                <div>
                  <p className="font-medium text-gray-800">Resolved</p>
                  <p className="text-gray-600 text-sm">Processing completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support */}
          <div className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 border border-cyan-100/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-cyan-600" size={24} />
              <h3 className="font-semibold text-gray-800">24/7 Support</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Our team is available to help you quickly.
            </p>
            <div className="space-y-2">
              <a href="mailto:support@company.com" className="block text-cyan-600 hover:text-cyan-700 text-sm">
                ✉️ support@company.com
              </a>
              <p className="text-gray-500 text-sm">📞 +1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Building, MapPin, Calendar, Shield, Activity, Package, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ClientProfilePage() {
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientInfo();
  }, []);

  const fetchClientInfo = async () => {
    setLoading(true);
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const clientsRes = await fetch('/api/clients');
        const clientsData = await clientsRes.json();
        const currentClient = clientsData.find((c: any) => c.email === user.email);
        setClientInfo(currentClient);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/client"
          className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          <p className="text-gray-600 mt-2">
            View and manage your personal information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 text-emerald-800 text-sm font-semibold rounded-full border border-emerald-200">
            Active Account
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-gray-200/50 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                  {clientInfo?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{clientInfo?.name || 'Client'}</h2>
                  <p className="text-gray-600">Client Account</p>
                </div>
              </div>
            </div>

            {/* Information */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="group">
                    <div className="flex items-center gap-3 text-gray-500 text-sm mb-2">
                      <Mail size={16} />
                      <span>Email Address</span>
                    </div>
                    <p className="text-gray-800 font-medium text-lg">{clientInfo?.email || 'Not provided'}</p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center gap-3 text-gray-500 text-sm mb-2">
                      <Phone size={16} />
                      <span>Phone Number</span>
                    </div>
                    <p className="text-gray-800 font-medium text-lg">{clientInfo?.phone || 'Not provided'}</p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center gap-3 text-gray-500 text-sm mb-2">
                      <Building size={16} />
                      <span>Company</span>
                    </div>
                    <p className="text-gray-800 font-medium text-lg">{clientInfo?.company || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="flex items-center gap-3 text-gray-500 text-sm mb-2">
                      <MapPin size={16} />
                      <span>Address</span>
                    </div>
                    <p className="text-gray-800">{clientInfo?.address || 'Not provided'}</p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center gap-3 text-gray-500 text-sm mb-2">
                      <Shield size={16} />
                      <span>Account Status</span>
                    </div>
                    <p className="text-gray-800 font-medium capitalize">{clientInfo?.status || 'active'}</p>
                  </div>
                  
                  <div className="group">
                    <div className="flex items-center gap-3 text-gray-500 text-sm mb-2">
                      <Calendar size={16} />
                      <span>Member Since</span>
                    </div>
                    <p className="text-gray-800">{clientInfo?.createdAt || 'Date unknown'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="text-emerald-600" size={24} />
              <h3 className="font-semibold text-gray-800">Your Activity</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 rounded-xl border border-emerald-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Claims</p>
                    <p className="text-2xl font-bold text-gray-800">{clientInfo?.activeClaims || 0}</p>
                  </div>
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Activity size={20} />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Products</p>
                    <p className="text-2xl font-bold text-gray-800">{clientInfo?.assignedProducts || 0}</p>
                  </div>
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <Package size={20} />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 rounded-xl border border-amber-100/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Last Activity</p>
                    <p className="text-lg font-bold text-gray-800">
                      {clientInfo?.lastActivity?.substring(0, 10) || 'Never'}
                    </p>
                  </div>
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                    <Clock size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 border border-cyan-100/50 rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Update Information</h3>
            <p className="text-gray-600 text-sm mb-4">
              To modify your personal information, contact our support team.
            </p>
            <button
              onClick={fetchClientInfo}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              🔄 Refresh Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
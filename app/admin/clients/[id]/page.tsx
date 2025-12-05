// app/admin/clients/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowLeft, DollarSign, Package, FileText, MessageSquare, 
  Calendar, Phone, Mail, Building, Globe, User, TrendingUp 
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (clientId) {
      fetchClientDetails();
    }
  }, [clientId]);

  const fetchClientDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      } else {
        console.error('Failed to fetch client details');
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Client not found</h2>
          <p className="text-gray-600 mb-6">The requested client does not exist.</p>
          <Link href="/admin/clients" className="text-blue-600 hover:underline">
            ← Back to list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with navigation */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/clients"
          className="group flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Clients
        </Link>
        <div className="ml-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{client.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-100 to-green-50 text-green-800 rounded-lg text-sm font-medium border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active Client
            </span>
            <span className="text-gray-500 text-sm">Member since {client.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Quick statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-blue-800 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(client.totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-2xl border border-purple-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-purple-800 text-sm font-medium">Products/Services</p>
              <p className="text-2xl font-bold text-purple-900">{client.assignedProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 p-6 rounded-2xl border border-red-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-red-800 text-sm font-medium">Active Claims</p>
              <p className="text-2xl font-bold text-red-900">{client.activeClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-green-800 text-sm font-medium">Last Activity</p>
              <p className="text-2xl font-bold text-green-900">{client.lastActivity}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div>
        <div className="border-b border-gray-200/50">
          <nav className="flex space-x-8">
            {['overview', 'products', 'claims', 'activity', 'financial'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'Overview'}
                {tab === 'products' && 'Products & Services'}
                {tab === 'claims' && 'Claims'}
                {tab === 'activity' && 'Activities'}
                {tab === 'financial' && 'Financial View'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                  <Phone size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{client.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                  <Building size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="text-gray-900 font-medium">{client.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                  <Globe size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <p className="text-gray-900 font-medium">{client.website}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
              <div className="bg-gray-50/50 p-4 rounded-xl">
                <p className="text-gray-700">{client.notes}</p>
              </div>
            </div>

            {/* Recent activities */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {client.activities.slice(0, 3).map((activity: any) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50/30 rounded-xl transition-colors">
                    <div className={`p-2 rounded-xl ${
                      activity.type === 'call' ? 'bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 border border-blue-200' :
                      activity.type === 'email' ? 'bg-gradient-to-br from-green-100 to-green-50 text-green-600 border border-green-200' :
                      activity.type === 'meeting' ? 'bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 border border-purple-200' :
                      'bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      <MessageSquare size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.description}</p>
                      <p className="text-gray-500 text-sm">By {activity.user} • {activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Assigned Products & Services</h3>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-md transition-shadow font-medium">
                Assign Product
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600 text-sm border-b border-gray-200/50">
                    <th className="pb-4 font-semibold">Product/Service</th>
                    <th className="pb-4 font-semibold">Type</th>
                    <th className="pb-4 font-semibold">Price</th>
                    <th className="pb-4 font-semibold">Assignment Date</th>
                    <th className="pb-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {client.products.map((product: any) => (
                    <tr key={product.id} className="border-b border-gray-200/50 hover:bg-gray-50/30">
                      <td className="py-4 font-medium text-gray-900">{product.name}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200">
                          {product.type}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-gray-900">{formatCurrency(product.price)}</td>
                      <td className="py-4 text-gray-600">{product.assignedDate}</td>
                      <td className="py-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Claims</h3>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-md transition-shadow font-medium">
                New Claim
              </button>
            </div>
            
            <div className="space-y-4">
              {client.claims.map((claim: any) => (
                <div key={claim.id} className="border border-gray-200/50 rounded-xl p-4 hover:bg-gray-50/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">{claim.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">
                        Submitted on {claim.date} • Assigned to {claim.assignedTo}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                      claim.status === 'submitted' ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200' :
                      claim.status === 'in_review' ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200' :
                      'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200'
                    }`}>
                      {claim.status === 'submitted' ? 'Submitted' :
                       claim.status === 'in_review' ? 'In Review' : 'Resolved'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial View</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-2xl border border-blue-200/50">
                <p className="text-blue-800 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {formatCurrency(client.totalRevenue)}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-2xl border border-green-200/50">
                <p className="text-green-800 text-sm font-medium">Average per Product</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {formatCurrency(client.totalRevenue / client.assignedProducts)}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 rounded-2xl border border-purple-200/50">
                <p className="text-purple-800 text-sm font-medium">Products/Services</p>
                <p className="text-3xl font-bold text-purple-900 mt-2">
                  {client.assignedProducts}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Product Breakdown</h4>
              <div className="space-y-3">
                {client.products.map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50/30 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-gray-900">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900">{formatCurrency(product.price)}</span>
                      <span className="text-gray-500 text-sm">
                        {Math.round((product.price / client.totalRevenue) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
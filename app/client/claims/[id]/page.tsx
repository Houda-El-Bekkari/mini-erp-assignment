'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, FileText, Clock, CheckCircle, AlertCircle, 
  User, Calendar, MessageSquare, Download, Copy,
  MapPin, Mail, Phone, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function ClaimDetailPage() {
  const params = useParams();
  const router = useRouter();
  const claimId = params.id as string;
  
  const [claim, setClaim] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (claimId) {
      fetchClaimDetails();
    }
  }, [claimId]);

  const fetchClaimDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/claims/${claimId}`);
      const data = await response.json();
      
      if (response.ok) {
        setClaim(data);
      } else {
        setError(data.error || 'Claim not found');
      }
    } catch (error) {
      setError('Error loading details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'resolved':
        return {
          icon: <CheckCircle className="text-emerald-500" size={24} />,
          label: 'Resolved',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          description: 'Your claim has been successfully processed'
        };
      case 'in_review':
        return {
          icon: <Clock className="text-amber-500" size={24} />,
          label: 'In Progress',
          color: 'text-amber-700 bg-amber-50 border-amber-200',
          description: 'Our team is analyzing your request'
        };
      case 'submitted':
        return {
          icon: <AlertCircle className="text-blue-500" size={24} />,
          label: 'Submitted',
          color: 'text-blue-700 bg-blue-50 border-blue-200',
          description: 'Awaiting assignment'
        };
      default:
        return {
          icon: <FileText className="text-gray-500" size={24} />,
          label: 'Unknown',
          color: 'text-gray-700 bg-gray-50 border-gray-200',
          description: 'Unknown status'
        };
    }
  };

  const copyClaimId = () => {
    navigator.clipboard.writeText(claimId);
    alert('ID copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 bg-gradient-to-br from-red-50 to-orange-50 text-red-600 rounded-2xl mb-4">
          <AlertCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Claim Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'This claim does not exist or you do not have access to it.'}</p>
        <Link
          href="/client"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-cyan-600"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(claim.claim.status);

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
      <div className="bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 border border-emerald-200/50 rounded-2xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.color}`}>
                {statusInfo.icon}
                <span className="font-medium">{statusInfo.label}</span>
              </div>
              <button
                onClick={copyClaimId}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm px-3 py-1 bg-white/50 rounded-lg border border-gray-200/50"
                title="Copy ID"
              >
                <Copy size={14} />
                ID: {claimId.substring(0, 8)}...
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">{claim.claim.title}</h1>
            <p className="text-gray-600 mt-2">{statusInfo.description}</p>
          </div>
          
          <div className="lg:text-right">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 p-4">
              <p className="text-gray-500 text-sm">Creation Date</p>
              <p className="text-gray-800 font-medium text-lg">
                {new Date(claim.claim.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-emerald-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Description</h2>
            </div>
            <div className="prose max-w-none">
              <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-6">
                <p className="text-gray-700 whitespace-pre-line">
                  {claim.claim.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Attached Files */}
          {claim.claim.fileUrl && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Download className="text-blue-600" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">Attached File</h2>
              </div>
              <a
                href={claim.claim.fileUrl}
                target="_blank"
                className="group flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 border border-blue-200/50 rounded-xl hover:from-blue-100/50 hover:to-cyan-100/50 transition-all duration-200"
              >
                <FileText size={32} className="text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Attached Document</p>
                  <p className="text-gray-600 text-sm">Click to download</p>
                </div>
                <Download size={20} className="text-gray-500 group-hover:text-blue-600 transition-colors" />
              </a>
            </div>
          )}

          {/* Comments */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="text-amber-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Comments</h2>
            </div>
            {claim.claim.comments ? (
              <div className="bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare size={16} className="text-amber-500" />
                  <span className="text-sm text-amber-600 font-medium">Internal Comment</span>
                </div>
                <p className="text-gray-700">{claim.claim.comments}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-500 italic">No comments at this time.</p>
              </div>
            )}
            <p className="text-gray-500 text-sm mt-6">
              Internal comments are visible to our support team.
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Tracking */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Tracking</h2>
            <div className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 rounded-xl border border-emerald-200/50">
                <p className="text-gray-500 text-sm mb-2">Current Status</p>
                <div className="flex items-center gap-3">
                  {statusInfo.icon}
                  <div>
                    <p className="font-medium text-gray-800">{statusInfo.label}</p>
                    <p className="text-gray-600 text-sm">{statusInfo.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 rounded-xl border border-blue-200/50">
                <p className="text-gray-500 text-sm mb-2">Assigned To</p>
                <div className="flex items-center gap-3">
                  <User size={20} className="text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-800">
                      {claim.assignedTo?.name || 'Not Assigned'}
                    </p>
                    {claim.assignedTo?.email && (
                      <p className="text-gray-600 text-sm">{claim.assignedTo.email}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-200/50">
                <p className="text-gray-500 text-sm mb-2">Last Update</p>
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-purple-500" />
                  <p className="font-medium text-gray-800">
                    {new Date(claim.claim.createdAt).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          {claim.client && (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                  <User size={16} className="text-gray-400" />
                  <p className="text-gray-800">{claim.client.name}</p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                  <Mail size={16} className="text-gray-400" />
                  <p className="text-gray-800">{claim.client.email}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
                  <p className="text-gray-500 text-xs mb-1">Reference</p>
                  <p className="font-mono text-gray-800 text-sm">{claim.client.id.substring(0, 12)}...</p>
                </div>
              </div>
              <Link
                href="/client/profile"
                className="group flex items-center gap-2 mt-6 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                Update My Information
                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={16} />
              </Link>
            </div>
          )}

          {/* Support */}
          <div className="bg-gradient-to-br from-cyan-50/50 to-blue-50/50 border border-cyan-100/50 rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Need Help?</h2>
            <div className="space-y-3 text-gray-700 mb-6">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-cyan-600" />
                <span>support@yourcompany.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-cyan-600" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-cyan-600" />
                <span>Response within 24-48h</span>
              </div>
            </div>
            <button
              onClick={fetchClaimDetails}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-200"
            >
              🔄 Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
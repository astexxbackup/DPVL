"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Trash2,
  ChevronDown,
  CheckCircle,
  XCircle,
  Mail,
  X,
  Eye,
  User,
  MapPin,
  Calendar,
  FileText,
  Phone,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";

const TABS = [
  { id: "pending", label: "Registration Requests" },
  { id: "accepted", label: "Verified Candidates" },
  { id: "rejected", label: "Rejected Candidates" },
  { id: "email", label: "Send Email to Participants" },
];

export default function CandidateDashboard() {
  const [activeTab, setActiveTab] = useState("pending");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [viewingImage, setViewingImage] = useState<{
    url: string;
    title: string;
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/candidates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        console.error("API error:", data.error);
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/candidates", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        alert(`Status updated to ${newStatus}`);
        fetchUsers();
        if (selectedCandidate?._id === id) {
          setSelectedCandidate({ ...selectedCandidate, status: newStatus });
        }
      } else {
        const data = await res.json();
        alert("Failed to update status: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleViewImage = (url: string, title: string) => {
    if (!url) return;
    setViewingImage({ url, title });
  };

  const closeImageModal = () => {
    setViewingImage(null);
  };

  const handleDeleteCandidate = async (id: string) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch(`/api/admin/candidates?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchUsers();
        setDeleteConfirmId(null);
      } else {
        const data = await res.json();
        alert("Failed to delete: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Failed to delete candidate:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadExcel = () => {
    // Filter only accepted candidates for the current filtered data
    const verifiedCandidates = filteredData.filter(u => (u.status || "pending") === "accepted");
    
    if (verifiedCandidates.length === 0) {
      alert("No verified candidates found to download.");
      return;
    }

    const excelData = verifiedCandidates.map((u) => ({
      "Full Name": `${u.firstName || ""} ${u.lastName || ""}`.trim(),
      "Date of Birth": u.dob ? new Date(u.dob).toLocaleDateString() : "N/A",
      "Age": u.age || "N/A",
      "Height": u.height || "N/A",
      "Leading Hand": u.leadingHand || "N/A",
      "Playing Positions": u.playingPosition?.join(", ") || "N/A",
      "Experience": u.experience || "N/A",
      "Leagues Played": u.leaguesPlayed || "N/A",
      "Achievements": u.achievements || "N/A",
      "Dept Representation": u.departmentRepresentation || "N/A",
      "Dept Name": u.departmentName || "N/A",
      "Injury History": u.injuryHistory || "N/A",
      "Injury Specification": u.injurySpecification || "N/A",
      "Phone Number": u.phone || "N/A",
      "WhatsApp Number": u.whatsappNumber || "N/A",
      "Email ID": u.email || "N/A",
      "Aadhar Number": u.aadharNumber || "N/A",
      "Complete Address": u.address || "N/A",
      "District": u.district || "N/A",
      "State": u.state || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Verified Candidates");

    // Set column widths for better formatting
    const wscols = [
      { wch: 25 }, // Full Name
      { wch: 15 }, // DOB
      { wch: 10 }, // Age
      { wch: 10 }, // Height
      { wch: 15 }, // Leading Hand
      { wch: 30 }, // Playing Positions
      { wch: 20 }, // Experience
      { wch: 30 }, // Leagues Played
      { wch: 30 }, // Achievements
      { wch: 20 }, // Dept Representation
      { wch: 20 }, // Dept Name
      { wch: 20 }, // Injury History
      { wch: 30 }, // Injury Specification
      { wch: 15 }, // Phone Number
      { wch: 15 }, // WhatsApp Number
      { wch: 25 }, // Email ID
      { wch: 20 }, // Aadhar Number
      { wch: 40 }, // Address
      { wch: 20 }, // District
      { wch: 20 }, // State
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(workbook, `Verified_Candidates_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredData = users.filter((u) => {
    const status = u.status || "pending";
    const matchesTab =
      activeTab === "email" ? status === "accepted" : status === activeTab;
    const matchesSearch =
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const getCount = (tabId: string) => {
    return users.filter(
      (u) =>
        (u.status || "pending") === (tabId === "email" ? "accepted" : tabId),
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      {/* --- Top Navigation Tabs --- */}
      <div className="flex flex-wrap gap-4 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 rounded-lg border transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#3B3BB7] text-white border-[#1e1b4b] shadow-md"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-sm font-medium">{tab.label}</span>
            <span
              className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.id
                  ? "bg-white text-[#1e1b4b]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {getCount(tab.id)}
            </span>
          </button>
        ))}
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onViewImage={handleViewImage}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {/* Image View Modal (Cloudinary) */}
      {viewingImage && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{viewingImage.title}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={viewingImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#3B3BB7] text-white text-sm font-medium rounded-lg hover:bg-indigo-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Full View
                </a>
                <button
                  onClick={closeImageModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center bg-gray-100/50">
              <img
                src={viewingImage.url}
                alt={viewingImage.title}
                className="max-w-full w-auto h-auto object-contain rounded-lg shadow-xl border border-gray-200"
              />
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeImageModal}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Candidate?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this candidate profile? This
              action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isDeleting}
              >
                No
              </button>
              <button
                onClick={() => handleDeleteCandidate(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {activeTab === "email" ? (
        <EmailComposer data={filteredData} />
      ) : (
        <TableLayout
          data={filteredData}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onStatusUpdate={handleStatusUpdate}
          onDeleteCandidate={setDeleteConfirmId}
          setSelectedCandidate={setSelectedCandidate}
          activeTab={activeTab}
          onDownload={handleDownloadExcel}
        />
      )}

      {/* Modals remain here... */}
    </div>
  );
}

function TableLayout({
  data,
  loading,
  searchTerm,
  setSearchTerm,
  onStatusUpdate,
  onDeleteCandidate,
  setSelectedCandidate,
  activeTab,
  onDownload,
}: {
  data: any[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onDeleteCandidate: (id: string) => void;
  setSelectedCandidate: (candidate: any) => void;
  activeTab: string;
  onDownload: () => void;
}) {
  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6 overflow-hidden flex flex-col max-h-[calc(100vh-250px)]">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-white z-10 border-b border-gray-100">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or mobile..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
          {activeTab === "accepted" && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-bold text-sm shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Excel
            </button>
          )}
        </div>

        <div className="flex-1 overflow-auto min-h-[400px]">
          <div className="min-w-[800px]">
            <div className="sticky top-0 z-20 bg-[#F9FAFB] border-b border-gray-100">
              <div className="grid grid-cols-12 gap-3 px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-3">Candidate</div>
                <div className="col-span-1">Age</div>
                <div className="col-span-2">District</div>
                <div className="col-span-2">State</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                <span>Loading candidates...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white">
                <p className="text-lg font-medium text-gray-500 mb-1">
                  No candidates found
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.map((item) => (
                  <div
                    key={item._id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                  >
                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0 border-2 border-white shadow-sm overflow-hidden">
                          {item.photoUrl ? (
                            <img
                              src={item.photoUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                              IMG
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 leading-tight truncate">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate italic">
                            {item.playingPosition?.join(", ") || "No position"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1">
                      <p className="text-sm text-gray-700 font-bold">
                        {item.age || "N/A"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-gray-700 font-medium">
                        {item.district}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-xs text-gray-700 font-medium">
                        {item.state}
                      </p>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : item.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.status || "pending"}
                      </span>
                    </div>

                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedCandidate(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-[#3B3BB7] text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
                        {item.status !== "accepted" && (
                          <button
                            onClick={() => onStatusUpdate(item._id, "accepted")}
                            className="p-1.5 text-green-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            title="Verify Candidate"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== "rejected" && (
                          <button
                            onClick={() => onStatusUpdate(item._id, "rejected")}
                            className="p-1.5 text-red-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            title="Reject Candidate"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(activeTab === "accepted" ||
                          activeTab === "rejected") && (
                          <button
                            onClick={() => onDeleteCandidate(item._id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function EmailComposer({ data }: { data: any[] }) {
  const [subject, setSubject] = useState("Information Regarding Participation");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  useEffect(() => {
    setSelectedEmails(data.map((u) => u.email));
  }, [data]);

  const toggleSelect = (email: string) => {
    setSelectedEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email],
    );
  };

  const handleSendBatch = async () => {
    if (selectedEmails.length === 0 || !content) {
      alert("Please select recipients and enter message content");
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem("adminToken");
      const res = await fetch("/api/admin/send-bulk-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emails: selectedEmails, subject, content }),
      });
      if (res.ok) {
        alert("Emails sent successfully!");
        setContent("");
      } else {
        const err = await res.json();
        alert("Failed to send: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending emails");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h2 className="text-[#1e1b4b] font-bold text-lg mb-4">
          Send Email to Approved Participants
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <textarea
            className="w-full h-32 p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm text-gray-600"
            placeholder="Write your email here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        <button
          onClick={handleSendBatch}
          disabled={sending}
          className="flex items-center gap-2 bg-[#3B3BB7] text-white px-6 py-2 rounded-lg hover:bg-indigo-800 transition-colors disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send Batch Email"}
          <Mail className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-6 py-3 bg-gray-50/50 flex items-center gap-3 border-b border-gray-100">
          <input
            type="checkbox"
            checked={selectedEmails.length === data.length && data.length > 0}
            onChange={(e) =>
              setSelectedEmails(
                e.target.checked ? data.map((u) => u.email) : [],
              )
            }
            className="w-4 h-4 rounded border-gray-300 text-indigo-900 focus:ring-indigo-500 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">
            Select All ({data.length})
          </span>
        </div>

        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50/30">
          <div className="col-span-1"></div>
          <div className="col-span-4">Name</div>
          <div className="col-span-7">Email</div>
        </div>

        <div className="divide-y divide-gray-100 max-h-[400px] overflow-auto">
          {data.map((u) => (
            <div
              key={u.email}
              className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-gray-50 transition-colors"
            >
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedEmails.includes(u.email)}
                  onChange={() => toggleSelect(u.email)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-900 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
              <div className="col-span-4">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {u.firstName} {u.lastName}
                </p>
              </div>
              <div className="col-span-7">
                <p className="text-sm text-gray-600 truncate">{u.email}</p>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm italic">
              No verified candidates available to email
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateDetailModal({
  candidate,
  onClose,
  onViewImage,
  onStatusUpdate,
}: {
  candidate: any;
  onClose: () => void;
  onViewImage: (url: string, title: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
}) {
  const Section = ({ title, children, icon: Icon }: any) => (
    <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
      <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
        <Icon className="w-4 h-4 text-[#3B3BB7]" />
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  const InfoItem = ({ label, value }: { label: string; value: any }) => (
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-700">
        {value || <span className="text-gray-300 italic">Not provided</span>}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 md:p-8 bg-linear-to-r from-[#1e1b4b] to-[#3B3BB7] text-white flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden shadow-lg">
              {candidate.photoUrl ? (
                <img
                  src={candidate.photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-black">
                  {candidate.firstName?.[0]}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter leading-none">
                {candidate.firstName} {candidate.lastName}
              </h2>
              <p className="text-white/60 text-xs md:text-sm font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    candidate.status === "accepted"
                      ? "bg-green-400"
                      : candidate.status === "rejected"
                        ? "bg-red-400"
                        : "bg-yellow-400"
                  }`}
                />
                {candidate.status || "Pending Review"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8 space-y-8 scrollbar-hide">
          <Section title="Basic Details" icon={User}>
            <InfoItem
              label="Full Name"
              value={`${candidate.firstName} ${candidate.lastName}`}
            />

            <InfoItem
              label="Date of Birth"
              value={
                candidate.dob
                  ? new Date(candidate.dob).toLocaleDateString()
                  : "N/A"
              }
            />
            <InfoItem label="Age" value={candidate.age} />
          </Section>

          <Section title="Physical & Playing Info" icon={Calendar}>
            <InfoItem
              label="Height"
              value={candidate.height ? `${candidate.height} cm` : "N/A"}
            />
            <InfoItem label="Leading Hand" value={candidate.leadingHand} />
            <div className="col-span-1 md:col-span-2">
              <InfoItem
                label="Playing Positions"
                value={candidate.playingPosition?.join(", ")}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <InfoItem label="Experience" value={candidate.experience} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <InfoItem
                label="Leagues Played"
                value={candidate.leaguesPlayed}
              />
            </div>
            <div className="col-span-1 md:col-span-2">
              <InfoItem label="Achievements" value={candidate.achievements} />
            </div>
          </Section>

          <Section title="Medical & Association" icon={FileText}>
            <InfoItem
              label="Dept Representation"
              value={candidate.departmentRepresentation}
            />
            <InfoItem label="Dept Name" value={candidate.departmentName} />
            <InfoItem label="Injury History" value={candidate.injuryHistory} />
            <InfoItem
              label="Injury Specification"
              value={candidate.injurySpecification}
            />
          </Section>

          <Section title="Contact & Identity" icon={Phone}>
            <InfoItem label="Phone Number" value={candidate.phone} />
            <InfoItem
              label="WhatsApp Number"
              value={candidate.whatsappNumber}
            />
            <InfoItem label="Email ID" value={candidate.email} />
            <InfoItem label="Aadhar Number" value={candidate.aadharNumber} />
          </Section>

          <Section title="Residential Address" icon={MapPin}>
            <div className="col-span-1 md:col-span-2">
              <InfoItem label="Complete Address" value={candidate.address} />
            </div>
            <InfoItem label="District" value={candidate.district} />
            <InfoItem label="State" value={candidate.state} />
          </Section>

          {/* Documents */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-gray-900 flex items-center gap-2 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-[#3B3BB7]" />
              Submitted Documents
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() =>
                  onViewImage(candidate.photoUrl, "Passport Photo")
                }
                className="group relative h-40 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#3B3BB7] hover:bg-indigo-50 transition-all overflow-hidden flex flex-col items-center justify-center gap-2"
              >
                {candidate.photoUrl ? (
                  <img
                    src={candidate.photoUrl}
                    alt="Photo"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
                  />
                ) : null}
                <User className="w-6 h-6 text-[#3B3BB7]" />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  Passport Photo
                </span>
                <span className="text-[9px] text-gray-400">Click to view</span>
              </button>

              <button
                onClick={() =>
                  onViewImage(candidate.aadharFrontUrl, "Aadhar Front")
                }
                className="group relative h-40 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#3B3BB7] hover:bg-indigo-50 transition-all overflow-hidden flex flex-col items-center justify-center gap-2"
              >
                {candidate.aadharFrontUrl ? (
                  <img
                    src={candidate.aadharFrontUrl}
                    alt="Aadhar Front"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
                  />
                ) : null}
                <FileText className="w-6 h-6 text-[#3B3BB7]" />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  Aadhar Front
                </span>
                <span className="text-[9px] text-gray-400">Click to view</span>
              </button>

              <button
                onClick={() =>
                  onViewImage(candidate.aadharBackUrl, "Aadhar Back")
                }
                className="group relative h-40 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#3B3BB7] hover:bg-indigo-50 transition-all overflow-hidden flex flex-col items-center justify-center gap-2"
              >
                {candidate.aadharBackUrl ? (
                  <img
                    src={candidate.aadharBackUrl}
                    alt="Aadhar Back"
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
                  />
                ) : null}
                <FileText className="w-6 h-6 text-[#3B3BB7]" />
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  Aadhar Back
                </span>
                <span className="text-[9px] text-gray-400">Click to view</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            {candidate.status !== "accepted" && (
              <button
                onClick={() => onStatusUpdate(candidate._id, "accepted")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all shadow-lg active:scale-95"
              >
                <CheckCircle className="w-5 h-5" />
                APPROVE
              </button>
            )}
            {candidate.status !== "rejected" && (
              <button
                onClick={() => onStatusUpdate(candidate._id, "rejected")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all border-2 border-red-100 active:scale-95"
              >
                <XCircle className="w-5 h-5" />
                REJECT
              </button>
            )}
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center md:text-right">
            Candidate ID: {candidate._id}
          </div>
        </div>
      </div>
    </div>
  );
}

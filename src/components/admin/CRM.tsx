"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Download, UserPlus, Phone, Mail, Calendar, MoreHorizontal, CheckCircle, Clock, MapPin, Megaphone, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';

interface Contact {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    lastContact: string;
    seminarRegistered: boolean;
    seminarScore?: number;
    seminarSignal?: string;
    seminarQuestion?: string;
    newsletterSubscribed?: boolean;
    whatsappNumber?: string;
    whatsappOptIn?: boolean;
    telegramId?: string;
    telegramUsername?: string;
    telegramOptIn?: boolean;
    preferredChannel?: string;
    tags?: string;
    leadSource?: string;
    leadScore?: number;
    message?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmTerm?: string;
    utmContent?: string;
    landingPath?: string;
    lastMessageAt?: string;
    conversationCount?: number;
    createdAt?: string;
}

type FilterTab = 'all' | 'seminar' | 'newsletter' | 'whatsapp' | 'telegram' | 'at_home_test' | 'hot_leads' | 'team' | 'analytics' | 'settings' | 'centers' | 'announcements';

export function CRM() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [channelFilter, setChannelFilter] = useState<string>('all');
    const [tagFilter, setTagFilter] = useState<string>('all');

    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [team, setTeam] = useState<{ id: number, email: string, role: string, createdAt: string }[]>([]);

    useEffect(() => {
        if (activeTab === 'team') {
            fetchTeam();
        } else {
            fetchContacts();
        }
    }, [activeTab]);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/contacts');
            if (res.ok) {
                const data = await res.json();
                setContacts(data.contacts || []);
            }
        } catch (error) {
            console.error("Failed to fetch contacts", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTeam = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/team');
            if (res.ok) {
                const data = await res.json();
                setTeam(data.admins || []);
            }
        } catch (error) {
            console.error("Failed to fetch team", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAdmin = async () => {
        if (!newAdminEmail) return;
        try {
            const res = await fetch('/api/admin/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newAdminEmail })
            });
            if (res.ok) {
                setNewAdminEmail("");
                fetchTeam();
            } else {
                alert("Failed to add admin");
            }
        } catch (error) {
            console.error("Add admin error", error);
        }
    };

    const handleRemoveAdmin = async (email: string) => {
        if (!confirm(`Remove ${email} from admins?`)) return;
        try {
            const res = await fetch(`/api/admin/team?email=${email}`, { method: 'DELETE' });
            if (res.ok) fetchTeam();
        } catch (error) {
            console.error("Remove admin error", error);
        }
    };

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (contact.phone && contact.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (contact.tags && contact.tags.toLowerCase().includes(searchQuery.toLowerCase()));
        
        let matchesTab = true;
        switch (activeTab) {
            case 'seminar':
                matchesTab = contact.seminarRegistered === true;
                break;
            case 'newsletter':
                matchesTab = contact.newsletterSubscribed === true;
                break;
            case 'whatsapp':
                matchesTab = contact.whatsappOptIn === true;
                break;
            case 'telegram':
                matchesTab = contact.telegramOptIn === true;
                break;
            case 'at_home_test':
                matchesTab = contact.tags?.includes('at_home_test') === true;
                break;
            case 'hot_leads':
                matchesTab = (contact.leadScore || 0) >= 50;
                break;
            case 'all':
            default:
                matchesTab = true;
        }

        const matchesChannel = channelFilter === 'all' || contact.preferredChannel === channelFilter;
        const matchesTag = tagFilter === 'all' || contact.tags?.includes(tagFilter) === true;

        return matchesSearch && matchesTab && matchesChannel && matchesTag;
    });

    // Get unique tags for filter dropdown
    const allTags = Array.from(new Set(
        contacts.flatMap(c => c.tags?.split(',').map(t => t.trim()) || [])
    )).filter(Boolean).sort();

    const exportToCSV = (data: Contact[]) => {
        const headers = [
            'Name', 'Email', 'Phone', 'WhatsApp', 'Telegram', 'Lead Score', 
            'Tags', 'Preferred Channel', 'Lead Source', 'Status', 'Message',
            'Newsletter', 'Seminar', 'Last Contact', 'Created At',
            'UTM Source', 'UTM Medium', 'UTM Campaign'
        ];

        const rows = data.map(contact => [
            contact.name,
            contact.email,
            contact.phone || '',
            contact.whatsappNumber || '',
            contact.telegramUsername || '',
            contact.leadScore || 0,
            contact.tags || '',
            contact.preferredChannel || 'email',
            contact.leadSource || '',
            contact.status,
            contact.message || '',
            contact.newsletterSubscribed ? 'Yes' : 'No',
            contact.seminarRegistered ? 'Yes' : 'No',
            contact.lastContact,
            contact.createdAt || '',
            contact.utmSource || '',
            contact.utmMedium || '',
            contact.utmCampaign || '',
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `santaan-contacts-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
            {/* Header Toolbar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder={activeTab === 'team' ? "Search team..." : "Search contacts..."}
                            className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        className="gap-2 text-gray-600 border-gray-200" 
                        onClick={() => exportToCSV(filteredContacts)}
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button variant="outline" className="gap-2 text-gray-600 border-gray-200" onClick={activeTab === 'team' ? fetchTeam : fetchContacts}>
                        <Clock className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 border-b border-gray-100 bg-gray-50/50 flex gap-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'all' ? 'border-santaan-teal text-santaan-teal' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    All ({contacts.length})
                </button>
                <button
                    onClick={() => setActiveTab('hot_leads')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'hot_leads' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    🔥 Hot Leads ({contacts.filter(c => (c.leadScore || 0) >= 50).length})
                </button>
                <button
                    onClick={() => setActiveTab('at_home_test')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'at_home_test' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    🏠 At-Home Test ({contacts.filter(c => c.tags?.includes('at_home_test')).length})
                </button>
                <button
                    onClick={() => setActiveTab('newsletter')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'newsletter' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    📰 Newsletter ({contacts.filter(c => c.newsletterSubscribed).length})
                </button>
                <button
                    onClick={() => setActiveTab('whatsapp')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'whatsapp' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    💬 WhatsApp ({contacts.filter(c => c.whatsappOptIn).length})
                </button>
                <button
                    onClick={() => setActiveTab('telegram')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'telegram' ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    ✈️ Telegram ({contacts.filter(c => c.telegramOptIn).length})
                </button>
                <button
                    onClick={() => setActiveTab('seminar')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'seminar' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    📅 Seminar ({contacts.filter(c => c.seminarRegistered).length})
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Team
                </button>
                <button
                    onClick={() => setActiveTab('centers')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'centers' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    📍 Centers
                </button>
                <button
                    onClick={() => setActiveTab('announcements')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'announcements' ? 'border-amber-600 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    📢 News
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Analytics
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Settings
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                {activeTab === 'team' ? (
                    <TeamTab
                        newAdminEmail={newAdminEmail}
                        setNewAdminEmail={setNewAdminEmail}
                        handleAddAdmin={handleAddAdmin}
                        team={team}
                        isLoading={isLoading}
                        handleRemoveAdmin={handleRemoveAdmin}
                    />
                ) : activeTab === 'analytics' ? (
                    <AnalyticsTab />
                ) : activeTab === 'settings' ? (
                    <SettingsTab />
                ) : activeTab === 'centers' ? (
                    <CentersTab />
                ) : activeTab === 'announcements' ? (
                    <AnnouncementsTab />
                ) : (
                    <ContactsTable
                        activeTab={activeTab}
                        isLoading={isLoading}
                        filteredContacts={filteredContacts}
                        contacts={contacts}
                    />
                )}
            </div>
            {activeTab !== 'team' && activeTab !== 'analytics' && activeTab !== 'settings' && activeTab !== 'centers' && activeTab !== 'announcements' && (
                <div className="p-4 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                    <span>Showing {filteredContacts.length} of {contacts.length} contacts</span>
                    <span>Last synced: Just now</span>
                </div>
            )}
        </div>
    );
}

function TeamTab({ newAdminEmail, setNewAdminEmail, handleAddAdmin, team, isLoading, handleRemoveAdmin }: any) {
    return (
        <div className="p-6">
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    Add New Admin
                </h3>
                <div className="flex gap-4 max-w-lg">
                    <Input
                        placeholder="Enter email address..."
                        value={newAdminEmail}
                        onChange={(e: any) => setNewAdminEmail(e.target.value)}
                        type="email"
                        className="bg-white"
                    />
                    <Button onClick={handleAddAdmin} disabled={!newAdminEmail} className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                        Send Invite
                    </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Added admins will be able to access this dashboard using their Google account.
                </p>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Email Address</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Added On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center py-8">Loading team...</TableCell></TableRow>
                    ) : team.map((admin: any) => (
                        <TableRow key={admin.id}>
                            <TableCell className="font-medium text-gray-900">{admin.email}</TableCell>
                            <TableCell><span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize">{admin.role}</span></TableCell>
                            <TableCell className="text-gray-500">{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleRemoveAdmin(admin.email)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    Remove
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function AnalyticsTab() {
    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Analytics Overview</h2>
                <p className="text-gray-600">Track your website performance and visitor behavior.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Analytics Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#F9AB00"/>
                            <path d="M12 6v6l4 2" stroke="#E37400" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Analytics 4</h3>
                    <p className="text-gray-500 text-sm mb-4">View detailed reports on traffic, user engagement, and conversions.</p>
                    <div className="space-y-2">
                        <a 
                            href="https://analytics.google.com/analytics/web/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                        >
                            <span className="text-sm font-medium text-orange-700">Open GA4 Dashboard</span>
                            <span className="text-orange-500">→</span>
                        </a>
                        <a 
                            href="https://analytics.google.com/analytics/web/#/report/visitors-overview" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-sm text-gray-600">Audience Overview</span>
                            <span className="text-gray-400">→</span>
                        </a>
                        <a 
                            href="https://analytics.google.com/analytics/web/#/realtime" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-sm text-gray-600">Real-time Visitors</span>
                            <span className="text-gray-400">→</span>
                        </a>
                    </div>
                </div>

                {/* Facebook/Meta Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-7 h-7" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5.01 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.5-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z"/>
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Meta Business Suite</h3>
                    <p className="text-gray-500 text-sm mb-4">Track Facebook Pixel events, conversions, and ad performance.</p>
                    <div className="space-y-2">
                        <a 
                            href="https://business.facebook.com/events_manager" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <span className="text-sm font-medium text-blue-700">Events Manager</span>
                            <span className="text-blue-500">→</span>
                        </a>
                        <a 
                            href="https://business.facebook.com/latest/insights" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-sm text-gray-600">Page Insights</span>
                            <span className="text-gray-400">→</span>
                        </a>
                        <a 
                            href="https://adsmanager.facebook.com/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <span className="text-sm text-gray-600">Ads Manager</span>
                            <span className="text-gray-400">→</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* Quick Stats Placeholder */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <p className="text-xs text-green-600 font-medium">Today&apos;s Visitors</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">—</p>
                    <p className="text-xs text-green-500 mt-1">View in GA4</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium">Page Views</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">—</p>
                    <p className="text-xs text-blue-500 mt-1">This week</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium">Conversions</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">—</p>
                    <p className="text-xs text-purple-500 mt-1">Form submissions</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                    <p className="text-xs text-orange-600 font-medium">Bounce Rate</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">—</p>
                    <p className="text-xs text-orange-500 mt-1">Avg. this month</p>
                </div>
            </div>

            <div className="mt-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="flex gap-3">
                    <div className="shrink-0">
                        <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-amber-800">Live Data Coming Soon</h4>
                        <p className="mt-1 text-sm text-amber-700">
                            Stats above will populate once Google Analytics API is connected. See README for setup instructions.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex gap-3">
                    <div className="shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-blue-800">Configuration</h4>
                        <p className="mt-1 text-sm text-blue-700">
                            Analytics Measurement IDs are configured in the <strong>Settings</strong> tab. Make sure GA4 and Facebook Pixel IDs are set correctly.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}


function SettingsTab() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Fetch regular settings
                const settingsRes = await fetch('/api/admin/settings');
                const settingsData = await settingsRes.json();
                
                // Fetch chatbot status
                const chatbotRes = await fetch('/api/admin/chatbot');
                const chatbotData = await chatbotRes.json();
                
                setSettings({
                    ...settingsData,
                    'chatbot_enabled': chatbotData.enabled ? 'true' : 'false'
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSettings();
    }, []);

    const handleSave = async (key: string, value: string) => {
        setSaving(true);
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
            setSettings(prev => ({ ...prev, [key]: value }));
        } catch (error) {
            console.error(error);
            alert('Failed to save setting');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

    return (
        <div className="p-8 max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking & Integrations</h2>
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics Measurement ID</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="G-XXXXXXXXXX"
                                value={settings['google_analytics_id'] || ''}
                                onChange={(e) => setSettings(prev => ({ ...prev, 'google_analytics_id': e.target.value }))}
                            />
                            <Button
                                onClick={() => handleSave('google_analytics_id', settings['google_analytics_id'] || '')}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Example: G-1234567890</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="123456789012345"
                                value={settings['facebook_pixel_id'] || ''}
                                onChange={(e) => setSettings(prev => ({ ...prev, 'facebook_pixel_id': e.target.value }))}
                            />
                            <Button
                                onClick={() => handleSave('facebook_pixel_id', settings['facebook_pixel_id'] || '')}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Your Meta Pixel ID for tracking conversions.</p>
                    </div>
                </div>
            </div>

            {/* Chatbot Health Check */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">System Controls</h2>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900">AI Chatbot</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Enable or disable the AI-powered chatbot widget. 
                                {settings['chatbot_enabled'] === 'true' ? (
                                    <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                                        <span className="w-2 h-2 rounded-full bg-green-600"></span>
                                        Online
                                    </span>
                                ) : (
                                    <span className="ml-2 inline-flex items-center gap-1 text-red-600">
                                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                        Offline
                                    </span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={async () => {
                                const newValue = settings['chatbot_enabled'] === 'true' ? 'false' : 'true';
                                setSaving(true);
                                try {
                                    await fetch('/api/admin/chatbot', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ enabled: newValue === 'true' })
                                    });
                                    setSettings(prev => ({ ...prev, 'chatbot_enabled': newValue }));
                                } catch (error) {
                                    console.error(error);
                                    alert('Failed to toggle chatbot');
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            disabled={saving}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings['chatbot_enabled'] === 'true' ? 'bg-green-600' : 'bg-gray-200'
                            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings['chatbot_enabled'] === 'true' ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        ⚠️ Toggle off if experiencing API errors. Users will see a maintenance message.
                    </p>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Defaults</h2>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600 mb-4">
                        Default SEO metadata is currently managed in the codebase (`src/app/layout.tsx`).
                        To update titles and descriptions dynamically, future updates will expose fields here.
                    </p>
                    <div className="p-3 bg-gray-50 rounded text-xs font-mono text-gray-600">
                        Current Global Title: "Santaan - Where Science Meets Hope"
                    </div>
                </div>
            </div>
        </div>
    )
}

function ContactsTable({ activeTab, isLoading, filteredContacts, contacts }: any) {
    return (
        <div className="space-y-4">
            <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                    <TableRow>
                        <TableHead className="w-12.5"><input type="checkbox" className="rounded border-gray-300" /></TableHead>
                        <TableHead>Contact / Patient</TableHead>
                        <TableHead>Status</TableHead>
                        {activeTab === 'seminar' ? (
                            <>
                                <TableHead>Signal Score</TableHead>
                                <TableHead>Question</TableHead>
                            </>
                        ) : (
                            <TableHead>Role</TableHead>
                        )}
                        <TableHead>Last Activity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading contacts...</TableCell>
                        </TableRow>
                    ) : filteredContacts.length > 0 ? (
                        filteredContacts.map((contact: any) => (
                            <TableRow key={contact.id} className="group hover:bg-gray-50 transition-colors">
                                <TableCell><input type="checkbox" className="rounded border-gray-300" /></TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">{contact.name}</span>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {contact.email}</span>
                                            {contact.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {contact.phone}</span>}
                                        </div>
                                        {(contact.utmSource || contact.utmMedium || contact.utmCampaign || contact.landingPath) && (
                                            <div className="text-[11px] text-gray-400 mt-2">
                                                <span className="font-medium text-gray-500">Attribution:</span>{" "}
                                                {[contact.utmSource, contact.utmMedium, contact.utmCampaign]
                                                    .filter(Boolean)
                                                    .join(" / ") || "-"}
                                                {contact.landingPath && (
                                                    <span className="ml-2">Landing: {contact.landingPath}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${contact.status === 'Active' ? 'bg-green-100 text-green-700' :
                                        contact.status === 'New' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {contact.status}
                                    </span>
                                </TableCell>
                                {activeTab === 'seminar' ? (
                                    <>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold ${contact.seminarSignal === 'Red' ? 'text-red-500' :
                                                    contact.seminarSignal === 'Yellow' ? 'text-amber-500' : 'text-green-500'
                                                    }`}>{contact.seminarScore}</span>
                                                <span className="text-xs text-gray-400 capitalize">({contact.seminarSignal})</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-600 truncate max-w-50 block" title={contact.seminarQuestion}>
                                                {contact.seminarQuestion || '-'}
                                            </span>
                                        </TableCell>
                                    </>
                                ) : (
                                    <TableCell><span className="text-sm text-gray-600">{contact.role}</span></TableCell>
                                )}
                                <TableCell>
                                    <span className="text-sm text-gray-500">{new Date(contact.createdAt || '').toLocaleDateString()}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                No contacts found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {
                activeTab !== 'team' && activeTab !== 'analytics' && activeTab !== 'settings' && (
                    <div className="p-4 border-t border-gray-100 text-xs text-gray-400 flex justify-between">
                        <span>Showing {filteredContacts.length} of {contacts.length} contacts</span>
                        <span>Last synced: Just now</span>
                    </div>
                )
            }
        </div >
    );
}

// ==================== CENTERS TAB ====================
interface Center {
    id: number;
    city: string;
    title: string;
    address: string;
    description: string | null;
    email: string;
    phones: string[];
    mapUrl: string | null;
    isActive: boolean;
    sortOrder: number;
}

function CentersTab() {
    const [centers, setCenters] = useState<Center[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Center>>({
        city: '',
        title: '',
        address: '',
        description: '',
        email: '',
        phones: [],
        sortOrder: 0,
        isActive: true
    });
    const [phonesInput, setPhonesInput] = useState('');

    const fetchCenters = async () => {
        try {
            const res = await fetch('/api/admin/centers?all=true');
            if (res.ok) {
                const data = await res.json();
                setCenters(data.centers || []);
            }
        } catch (error) {
            console.error('Failed to fetch centers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    const handleSave = async () => {
        const phones = phonesInput.split(',').map(p => p.trim()).filter(Boolean);
        
        try {
            if (editingId) {
                // Update existing
                const res = await fetch('/api/admin/centers', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, id: editingId, phones })
                });
                if (!res.ok) throw new Error('Failed to update');
            } else {
                // Create new
                const res = await fetch('/api/admin/centers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, phones })
                });
                if (!res.ok) throw new Error('Failed to create');
            }
            
            setEditingId(null);
            setShowAddForm(false);
            setFormData({ city: '', title: '', address: '', description: '', email: '', phones: [], sortOrder: 0, isActive: true });
            setPhonesInput('');
            fetchCenters();
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save center');
        }
    };

    const handleEdit = (center: Center) => {
        setEditingId(center.id);
        setFormData(center);
        setPhonesInput(center.phones.join(', '));
        setShowAddForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this center?')) return;
        
        try {
            await fetch(`/api/admin/centers?id=${id}`, { method: 'DELETE' });
            fetchCenters();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete center');
        }
    };

    const handleToggleActive = async (center: Center) => {
        try {
            await fetch('/api/admin/centers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: center.id, isActive: !center.isActive })
            });
            fetchCenters();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Manage Centers</h2>
                    <p className="text-sm text-gray-500">Add, edit, or remove clinic locations displayed on the website</p>
                </div>
                <Button onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ city: '', title: '', address: '', description: '', email: '', phones: [], sortOrder: 0, isActive: true }); setPhonesInput(''); }} className="gap-2 bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4" /> Add Center
                </Button>
            </div>

            {showAddForm && (
                <div className="mb-6 bg-teal-50 p-6 rounded-xl border border-teal-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-teal-600" />
                        {editingId ? 'Edit Center' : 'Add New Center'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <Input value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="e.g., Bhubaneswar" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline *</label>
                            <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., The Temple City" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                            <Input value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <Input value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of this center" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <Input value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="center@santaan.in" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers *</label>
                            <Input value={phonesInput} onChange={(e) => setPhonesInput(e.target.value)} placeholder="+91 9337326896, +91 7328839934" />
                            <p className="text-xs text-gray-500 mt-1">Separate multiple numbers with commas</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <Input type="number" value={formData.sortOrder || 0} onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} placeholder="0" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 gap-2">
                            <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'} Center
                        </Button>
                        <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); }}>
                            <X className="w-4 h-4" /> Cancel
                        </Button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading centers...</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>City</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {centers.map((center) => (
                            <TableRow key={center.id} className={!center.isActive ? 'opacity-50' : ''}>
                                <TableCell>
                                    <div>
                                        <span className="font-medium text-gray-900">{center.city}</span>
                                        <span className="block text-xs text-gray-500">{center.title}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-600">{center.address}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs text-gray-500">
                                        <div>{center.email}</div>
                                        <div>{center.phones[0]}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <button onClick={() => handleToggleActive(center)} className={`px-2 py-1 rounded-full text-xs font-medium ${center.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {center.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(center)} className="text-blue-600 hover:text-blue-800">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(center.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

// ==================== ANNOUNCEMENTS TAB ====================
interface Announcement {
    id: number;
    title: string;
    content: string | null;
    type: string;
    imageUrl: string | null;
    linkUrl: string | null;
    linkText: string | null;
    isActive: boolean;
    isPinned: boolean;
    publishDate: string;
    expiryDate: string | null;
}

function AnnouncementsTab() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Partial<Announcement>>({
        title: '',
        content: '',
        type: 'news',
        linkUrl: '',
        linkText: '',
        isPinned: false,
        isActive: true
    });

    const fetchAnnouncements = async () => {
        try {
            const res = await fetch('/api/admin/announcements?all=true');
            if (res.ok) {
                const data = await res.json();
                setAnnouncements(data.announcements || []);
            }
        } catch (error) {
            console.error('Failed to fetch announcements:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSave = async () => {
        try {
            if (editingId) {
                const res = await fetch('/api/admin/announcements', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...formData, id: editingId })
                });
                if (!res.ok) throw new Error('Failed to update');
            } else {
                const res = await fetch('/api/admin/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) throw new Error('Failed to create');
            }
            
            setEditingId(null);
            setShowAddForm(false);
            setFormData({ title: '', content: '', type: 'news', linkUrl: '', linkText: '', isPinned: false, isActive: true });
            fetchAnnouncements();
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save announcement');
        }
    };

    const handleEdit = (announcement: Announcement) => {
        setEditingId(announcement.id);
        setFormData(announcement);
        setShowAddForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        
        try {
            await fetch(`/api/admin/announcements?id=${id}`, { method: 'DELETE' });
            fetchAnnouncements();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete announcement');
        }
    };

    const handleToggleActive = async (announcement: Announcement) => {
        try {
            await fetch('/api/admin/announcements', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: announcement.id, isActive: !announcement.isActive })
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Toggle error:', error);
        }
    };

    const handleTogglePinned = async (announcement: Announcement) => {
        try {
            await fetch('/api/admin/announcements', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: announcement.id, isPinned: !announcement.isPinned })
            });
            fetchAnnouncements();
        } catch (error) {
            console.error('Pin toggle error:', error);
        }
    };

    const typeColors: Record<string, string> = {
        news: 'bg-blue-100 text-blue-700',
        award: 'bg-amber-100 text-amber-700',
        event: 'bg-purple-100 text-purple-700',
        campaign: 'bg-green-100 text-green-700',
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">News & Announcements</h2>
                    <p className="text-sm text-gray-500">Manage news, awards, campaigns, and event announcements</p>
                </div>
                <Button onClick={() => { setShowAddForm(true); setEditingId(null); setFormData({ title: '', content: '', type: 'news', linkUrl: '', linkText: '', isPinned: false, isActive: true }); }} className="gap-2 bg-amber-600 hover:bg-amber-700">
                    <Plus className="w-4 h-4" /> Add Announcement
                </Button>
            </div>

            {showAddForm && (
                <div className="mb-6 bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Megaphone className="w-5 h-5 text-amber-600" />
                        {editingId ? 'Edit Announcement' : 'Add New Announcement'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                            <Input value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Announcement title" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                rows={3}
                                value={formData.content || ''}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                placeholder="Brief description or content"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                value={formData.type || 'news'}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="news">📰 News</option>
                                <option value="award">🏆 Award</option>
                                <option value="event">📅 Event</option>
                                <option value="campaign">📢 Campaign</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isPinned || false}
                                    onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-700">Pin to Featured</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                            <Input value={formData.linkUrl || ''} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                            <Input value={formData.linkText || ''} onChange={(e) => setFormData({ ...formData, linkText: e.target.value })} placeholder="Learn More" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 gap-2">
                            <Save className="w-4 h-4" /> {editingId ? 'Update' : 'Save'} Announcement
                        </Button>
                        <Button variant="outline" onClick={() => { setShowAddForm(false); setEditingId(null); }}>
                            <X className="w-4 h-4" /> Cancel
                        </Button>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading announcements...</div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No announcements yet. Create your first one!</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Published</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {announcements.map((ann) => (
                            <TableRow key={ann.id} className={!ann.isActive ? 'opacity-50' : ''}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {ann.isPinned && <span className="text-amber-500" title="Pinned">📌</span>}
                                        <div>
                                            <span className="font-medium text-gray-900">{ann.title}</span>
                                            {ann.content && <span className="block text-xs text-gray-500 truncate max-w-xs">{ann.content}</span>}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${typeColors[ann.type] || 'bg-gray-100 text-gray-700'}`}>
                                        {ann.type}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-gray-500">
                                        {new Date(ann.publishDate).toLocaleDateString()}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleToggleActive(ann)} className={`px-2 py-1 rounded-full text-xs font-medium ${ann.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {ann.isActive ? 'Live' : 'Hidden'}
                                        </button>
                                        <button onClick={() => handleTogglePinned(ann)} className={`px-2 py-1 rounded text-xs ${ann.isPinned ? 'text-amber-600' : 'text-gray-400 hover:text-amber-500'}`} title={ann.isPinned ? 'Unpin' : 'Pin to Featured'}>
                                            📌
                                        </button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(ann)} className="text-blue-600 hover:text-blue-800">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(ann.id)} className="text-red-500 hover:text-red-700">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

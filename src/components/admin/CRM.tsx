"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Download, UserPlus, Phone, Mail, Calendar, MoreHorizontal, CheckCircle, Clock } from 'lucide-react';
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
    createdAt?: string;
}

export function CRM() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'seminar' | 'team' | 'analytics' | 'settings'>('all');

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
            contact.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'all' ? true : contact.seminarRegistered;
        return matchesSearch && matchesTab;
    });

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
                    <Button variant="outline" className="gap-2 text-gray-600 border-gray-200" onClick={activeTab === 'team' ? fetchTeam : fetchContacts}>
                        <Clock className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 border-b border-gray-100 bg-gray-50/50 flex gap-6">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-santaan-teal text-santaan-teal' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    All Contacts ({contacts.length})
                </button>
                <button
                    onClick={() => setActiveTab('seminar')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'seminar' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Seminar Registrants ({contacts.filter(c => c.seminarRegistered).length})
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'team' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Team & Admins
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Analytics
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'settings' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
                ) : (
                    <ContactsTable
                        activeTab={activeTab}
                        isLoading={isLoading}
                        filteredContacts={filteredContacts}
                        contacts={contacts}
                    />
                )}
            </div>
            {activeTab !== 'team' && activeTab !== 'analytics' && activeTab !== 'settings' && (
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Overview</h2>
                <p className="text-gray-600">Track your website performance and visitor behavior.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 text-orange-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5z" /></svg> {/* Placeholder icon */}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Analytics 4</h3>
                    <p className="text-gray-500 text-sm mb-6">View detailed reports on traffic, user engagement, and conversions.</p>
                    <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                        Open Dashboard &rarr;
                    </a>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5.01 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.5-3.89 3.77-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" /></svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Meta Business Suite</h3>
                    <p className="text-gray-500 text-sm mb-6">Track Facebook and Instagram ad performance and pixel events.</p>
                    <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
                        Open Business Suite &rarr;
                    </a>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-blue-800">Connection Status</h4>
                        <p className="mt-1 text-sm text-blue-700">
                            Analytics scripts are injected based on the IDs configured in the Settings tab. Ensure you have added your Google Analytics Measurement ID and Facebook Pixel ID.
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
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
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
                        <TableHead className="w-[50px]"><input type="checkbox" className="rounded border-gray-300" /></TableHead>
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
                                            <span className="text-sm text-gray-600 truncate max-w-[200px] block" title={contact.seminarQuestion}>
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

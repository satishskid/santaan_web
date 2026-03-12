"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import CampaignAnalytics from './CampaignAnalytics';
import CeoCommandCenter from './CeoCommandCenter';
import TeamManagement from './TeamManagement';
import SettingsManagement from './SettingsManagement';
import CentersManagement from './CentersManagement';
import AnnouncementsManagement from './AnnouncementsManagement';
import SpendManagement from './SpendManagement';
import OpsInputsManagement from './OpsInputsManagement';
import OpsWorkboard from './OpsWorkboard';
import DailyCommandCenter from './DailyCommandCenter';
import ReviewsManagement from './ReviewsManagement';
import ContentIntelligenceManagement from './ContentIntelligenceManagement';
import NeoDoveShadowManagement from './NeoDoveShadowManagement';
import { Search, Download, UserPlus, Phone, Mail, Calendar, CheckCircle, Clock, MapPin, Megaphone, Trash2, Edit, Save, X, BookOpen, IndianRupee, Target, AlertTriangle, Sparkles, Activity } from 'lucide-react';
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

type FilterTab = 'daily_command' | 'workboard' | 'all' | 'seminar' | 'newsletter' | 'whatsapp' | 'telegram' | 'at_home_test' | 'hot_leads' | 'team' | 'analytics' | 'ceo_command' | 'settings' | 'centers' | 'announcements' | 'spend' | 'ops_inputs' | 'reviews' | 'content_intelligence' | 'neodove_shadow';

interface RoleGuide {
    heading: string;
    why: string;
    sla: string;
    mustUpdate: string[];
    quickTabs: FilterTab[];
}

const ROLE_LABELS: Record<string, string> = {
    admin: 'CEO / CRM Admin',
    ceo: 'CEO',
    crm_ops_admin: 'CRM Ops Admin',
    agency_ops: 'Agency Ops',
    marketing_manager: 'Marketing Manager',
    performance_marketer: 'Performance Marketer',
    content_writer: 'Content Writer',
    social_media_exec: 'Social Media Executive',
    field_exec: 'Field Executive',
    ivr_manager: 'IVR Manager',
    telecaller_manager: 'Telecalling Lead',
    telecaller: 'Telecaller',
    counselor: 'Counselor',
};

const TAB_LABELS: Record<FilterTab, string> = {
    daily_command: 'Daily Command',
    workboard: 'Workboard',
    all: 'All Contacts',
    seminar: 'Seminar',
    newsletter: 'Newsletter',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    at_home_test: 'At-Home Test',
    hot_leads: 'Hot Leads',
    team: 'Team',
    analytics: 'Analytics',
    ceo_command: 'CEO Command',
    settings: 'Settings',
    centers: 'Centers',
    announcements: 'Announcements',
    spend: 'Spend',
    ops_inputs: 'Ops Inputs',
    reviews: 'Reviews',
    content_intelligence: 'Content Intelligence',
    neodove_shadow: 'NeoDove Shadow',
};

function roleGuideFor(role: string): RoleGuide {
    if (role === 'admin' || role === 'ceo' || role === 'crm_ops_admin') {
        return {
            heading: 'Network command and owner accountability',
            why: 'Run a short weekly control loop: quality of leads, speed to action, ROI, leakage, and owner assignments.',
            sla: 'Weekly review complete with named owners and deadlines.',
            mustUpdate: [
                'Confirm Daily Command completion and blocked tasks.',
                'Review CEO Command and assign fix owners for each leakage.',
                'Ensure Spend entries are updated and CPL/CPA are visible.',
                'Review NeoDove Shadow mapping coverage before trusting call attribution.',
                'Review low-rated pending reviews and assign response owners.',
            ],
            quickTabs: ['daily_command', 'ceo_command', 'spend', 'neodove_shadow', 'reviews', 'content_intelligence', 'analytics'],
        };
    }

    if (role === 'agency_ops' || role === 'marketing_manager' || role === 'performance_marketer') {
        return {
            heading: 'Campaign quality and spend discipline',
            why: 'Agency data should enter once, in standard fields, so ROI is clear to CEO without manual reconciliation.',
            sla: 'Daily spend + campaign performance updates completed by 11:00 AM.',
            mustUpdate: [
                'Enter/verify Meta and Google campaign spend.',
                'Update Agency input rows in Ops Inputs with attribution fields.',
                'Review NeoDove Shadow daily and close unmapped campaigns before claiming lead attribution.',
                'Flag underperforming campaigns within 24 hours.',
                'Track new Google/Meta reviews and mark featured trust signals.',
                'Register new reels/pages and convert feedback into next-topic recommendations.',
            ],
            quickTabs: ['spend', 'ops_inputs', 'neodove_shadow', 'reviews', 'content_intelligence', 'analytics', 'daily_command'],
        };
    }

    if (role === 'content_writer' || role === 'social_media_exec') {
        return {
            heading: 'Publish adaptive content from real demand signals',
            why: 'Use reviews, telecalling objections, and search demand to decide what Santaan publishes next instead of guessing topics.',
            sla: 'Register every new asset and close high-priority feedback items on the same day.',
            mustUpdate: [
                'Register every new blog, reel, social post, or FAQ in Content Intelligence.',
                'Review patient questions, review themes, and campaign comments before planning the next asset.',
                'Mark refresh targets and next recommended action clearly for agency and leadership.',
            ],
            quickTabs: ['content_intelligence', 'reviews', 'analytics', 'daily_command', 'workboard'],
        };
    }

    if (role === 'field_exec') {
        return {
            heading: 'Offline activity to digital attribution',
            why: 'Doctor visits, camps, and hoardings must be logged fast, otherwise lead source attribution breaks.',
            sla: 'All field activities logged within 24 hours with map/asset proof.',
            mustUpdate: [
                'Add field activity rows in Ops Inputs (location + asset + UTM/QR).',
                'Check Daily Command and clear pending action items.',
                'Escalate missing center-level QR/source tags to CRM Ops.',
            ],
            quickTabs: ['ops_inputs', 'daily_command', 'workboard'],
        };
    }

    if (role === 'ivr_manager' || role === 'telecaller_manager' || role === 'telecaller') {
        return {
            heading: 'Speed-to-lead and clean handoff',
            why: 'Fast first response and consistent disposition logging drives conversion quality for counselors.',
            sla: 'Hot leads in 10 min, all new leads within 2 hours.',
            mustUpdate: [
                'Work Hot Leads first; update status and next follow-up time.',
                'For qualified leads, add clear handoff notes for counselor.',
                'For lost leads, select standardized reason code.',
                'Escalate unmapped NeoDove campaigns or routing issues to the telecalling lead the same day.',
            ],
            quickTabs: ['hot_leads', 'all', 'neodove_shadow', 'daily_command', 'workboard'],
        };
    }

    if (role === 'counselor') {
        return {
            heading: 'Lead-to-registration closure',
            why: 'Counselor updates are the final truth for registration and conversion reporting.',
            sla: 'Qualified leads actioned same day with outcome updated.',
            mustUpdate: [
                'Update consult outcome and registration status on every touched lead.',
                'Capture loss/deferral reason for non-converted cases.',
                'Close Daily Command tasks before day-end.',
            ],
            quickTabs: ['all', 'hot_leads', 'daily_command', 'workboard'],
        };
    }

    return {
        heading: 'Complete your role-aligned daily updates',
        why: 'Use only standardized fields so reporting remains consistent across centers.',
        sla: 'Finish assigned daily updates before day-end.',
        mustUpdate: [
            'Open Daily Command and complete pending tasks.',
            'Update records only via standard forms and status picklists.',
            'Escalate missing fields/data blockers to CRM Ops.',
        ],
        quickTabs: ['daily_command', 'workboard'],
    };
}

export default function CRM() {
    const { data: session } = useSession();
    const currentRole = String((session?.user as { role?: string } | undefined)?.role || '').trim().toLowerCase();
    const leadershipRoles = new Set(['admin', 'ceo', 'crm_ops_admin']);
    const opsInputRoles = new Set(['admin', 'ceo', 'crm_ops_admin', 'agency_ops', 'marketing_manager', 'performance_marketer', 'field_exec']);
    const contactRoles = new Set(['admin', 'ceo', 'crm_ops_admin', 'ivr_manager', 'telecaller_manager', 'telecaller', 'counselor']);
    const spendRoles = new Set(['admin', 'ceo', 'crm_ops_admin', 'agency_ops', 'marketing_manager', 'performance_marketer']);
    const analyticsRoles = new Set(['admin', 'ceo', 'crm_ops_admin', 'agency_ops', 'marketing_manager', 'performance_marketer', 'content_writer', 'social_media_exec', 'ivr_manager', 'telecaller_manager']);

    const canAccessLeadership = leadershipRoles.has(currentRole);
    const canAccessOpsInputs = opsInputRoles.has(currentRole) || canAccessLeadership;
    const canAccessContacts = contactRoles.has(currentRole) || canAccessLeadership;
    const canDeleteContacts = canAccessLeadership;
    const canAccessSpend = spendRoles.has(currentRole) || canAccessLeadership;
    const canAccessAnalytics = analyticsRoles.has(currentRole) || canAccessLeadership;
    const canAccessCeoCommand = canAccessLeadership;
    const canAccessReviews = canAccessLeadership || new Set(['agency_ops', 'marketing_manager', 'performance_marketer', 'content_writer', 'social_media_exec', 'counselor']).has(currentRole);
    const canAccessContentIntelligence = canAccessLeadership || new Set(['agency_ops', 'marketing_manager', 'performance_marketer', 'content_writer', 'social_media_exec', 'telecaller_manager', 'ivr_manager', 'counselor', 'field_exec']).has(currentRole);
    const canAccessNeoDoveShadow = canAccessLeadership || new Set(['agency_ops', 'marketing_manager', 'performance_marketer', 'ivr_manager', 'telecaller_manager']).has(currentRole);

    const [activeTab, setActiveTab] = useState<FilterTab>('daily_command');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [editForm, setEditForm] = useState<Partial<Contact>>({});
    const [statusFilter, setStatusFilter] = useState('all');
    const [channelFilter, setChannelFilter] = useState('all');
    const [tagFilter, setTagFilter] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newContact, setNewContact] = useState<Partial<Contact>>({});
    const contactTabs: FilterTab[] = ['all', 'seminar', 'newsletter', 'whatsapp', 'telegram', 'at_home_test', 'hot_leads'];
    const isContactTab = contactTabs.includes(activeTab);
    const shouldLoadContacts = isContactTab && canAccessContacts;

    useEffect(() => {
        if (shouldLoadContacts) {
            fetchContacts();
        }
        setSelectedContacts([]);
    }, [activeTab, shouldLoadContacts]);

    const fetchContacts = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/contacts');
            const data = await response.json();
            setContacts(data.contacts || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filterContacts = useCallback(() => {
        let filtered = contacts;

        if (activeTab === 'seminar') {
            filtered = filtered.filter((contact) => Boolean(contact.seminarRegistered));
        } else if (activeTab === 'newsletter') {
            filtered = filtered.filter((contact) => Boolean(contact.newsletterSubscribed));
        } else if (activeTab === 'whatsapp') {
            filtered = filtered.filter((contact) => Boolean(contact.whatsappOptIn) || contact.preferredChannel === 'whatsapp');
        } else if (activeTab === 'telegram') {
            filtered = filtered.filter((contact) => Boolean(contact.telegramOptIn) || contact.preferredChannel === 'telegram');
        } else if (activeTab === 'at_home_test') {
            filtered = filtered.filter((contact) => contact.tags?.includes('at_home_test') || contact.leadSource === 'at_home_page');
        } else if (activeTab === 'hot_leads') {
            filtered = filtered.filter((contact) => (contact.leadScore || 0) >= 70 || contact.tags?.includes('hot_lead'));
        }

        if (searchTerm) {
            filtered = filtered.filter(contact =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.phone.includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(contact => contact.status === statusFilter);
        }

        if (channelFilter !== 'all') {
            filtered = filtered.filter(contact => {
                if (channelFilter === 'seminar') return contact.seminarRegistered;
                if (channelFilter === 'newsletter') return contact.newsletterSubscribed;
                if (channelFilter === 'whatsapp') return contact.whatsappOptIn;
                if (channelFilter === 'telegram') return contact.telegramOptIn;
                return true;
            });
        }

        if (tagFilter !== 'all') {
            filtered = filtered.filter(contact => contact.tags?.includes(tagFilter));
        }

        setFilteredContacts(filtered);
    }, [contacts, searchTerm, statusFilter, channelFilter, tagFilter, activeTab]);

    useEffect(() => {
        filterContacts();
    }, [filterContacts]);

    const handleContactUpdate = async (contact: Contact) => {
        try {
            const response = await fetch(`/api/admin/contacts/${contact.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contact)
            });
            if (response.ok) {
                fetchContacts();
                setEditingContact(null);
                setEditForm({});
            }
        } catch (error) {
            console.error('Error updating contact:', error);
        }
    };

    const handleContactDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this contact?')) {
            try {
                const response = await fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    fetchContacts();
                }
            } catch (error) {
                console.error('Error deleting contact:', error);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedContacts.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
            try {
                await Promise.all(selectedContacts.map(id =>
                    fetch(`/api/admin/contacts/${id}`, { method: 'DELETE' })
                ));
                setSelectedContacts([]);
                fetchContacts();
            } catch (error) {
                console.error('Error bulk deleting contacts:', error);
            }
        }
    };

    const handleAddContact = async () => {
        try {
            const response = await fetch('/api/admin/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContact)
            });
            if (response.ok) {
                fetchContacts();
                setShowAddModal(false);
                setNewContact({});
            }
        } catch (error) {
            console.error('Error adding contact:', error);
        }
    };

    const exportContacts = () => {
        const csvContent = [
            ['Name', 'Email', 'Phone', 'Role', 'Status', 'Last Contact', 'Seminar Registered', 'Newsletter Subscribed', 'WhatsApp Opt-in', 'Telegram Opt-in', 'Tags', 'Lead Source', 'Lead Score', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Landing Path', 'Last Message At', 'Created At'].join(','),
            ...filteredContacts.map(contact => [
                contact.name,
                contact.email,
                contact.phone,
                contact.role,
                contact.status,
                contact.lastContact,
                contact.seminarRegistered,
                contact.newsletterSubscribed,
                contact.whatsappOptIn,
                contact.telegramOptIn,
                contact.tags,
                contact.leadSource,
                contact.leadScore,
                contact.utmSource,
                contact.utmMedium,
                contact.utmCampaign,
                contact.landingPath,
                contact.lastMessageAt,
                contact.createdAt
            ].map(field => `"${field || ''}"`)).join(',')
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tabs = useMemo(() => {
        const nextTabs: { id: FilterTab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
            { id: 'daily_command', label: 'Daily Command', icon: Target },
            { id: 'workboard', label: 'Workboard', icon: Clock },
        ];

        if (canAccessContacts) {
            nextTabs.push(
                { id: 'all', label: 'All Contacts', icon: Search },
                { id: 'seminar', label: 'Seminar', icon: Calendar, count: contacts.filter(c => c.seminarRegistered).length },
                { id: 'newsletter', label: 'Newsletter', icon: Mail, count: contacts.filter(c => c.newsletterSubscribed).length },
                { id: 'whatsapp', label: 'WhatsApp', icon: Phone, count: contacts.filter(c => c.whatsappOptIn).length },
                { id: 'telegram', label: 'Telegram', icon: Phone, count: contacts.filter(c => c.telegramOptIn).length },
                { id: 'at_home_test', label: 'At-Home Test', icon: CheckCircle, count: contacts.filter(c => c.tags?.includes('at_home_test') || c.leadSource === 'at_home_page').length },
                { id: 'hot_leads', label: 'Hot Leads', icon: Megaphone, count: contacts.filter(c => (c.leadScore || 0) >= 70 || c.tags?.includes('hot_lead')).length }
            );
        }

        if (canAccessAnalytics) {
            nextTabs.push({ id: 'analytics', label: 'Analytics', icon: Search });
        }
        if (canAccessCeoCommand) {
            nextTabs.push({ id: 'ceo_command', label: 'CEO Command', icon: Clock });
        }
        if (canAccessOpsInputs) {
            nextTabs.push({ id: 'ops_inputs', label: 'Ops Inputs', icon: Clock });
        }
        if (canAccessSpend) {
            nextTabs.push({ id: 'spend', label: 'Spend', icon: IndianRupee });
        }
        if (canAccessReviews) {
            nextTabs.push({ id: 'reviews', label: 'Reviews', icon: BookOpen });
        }
        if (canAccessContentIntelligence) {
            nextTabs.push({ id: 'content_intelligence', label: 'Content Intelligence', icon: Sparkles });
        }
        if (canAccessNeoDoveShadow) {
            nextTabs.push({ id: 'neodove_shadow', label: 'NeoDove Shadow', icon: Activity });
        }
        if (canAccessLeadership) {
            nextTabs.push(
                { id: 'team', label: 'Team', icon: UserPlus },
                { id: 'settings', label: 'Settings', icon: Search },
                { id: 'centers', label: 'Centers', icon: MapPin },
                { id: 'announcements', label: 'Announcements', icon: Megaphone }
            );
        }

        return nextTabs;
    }, [
        canAccessAnalytics,
        canAccessCeoCommand,
        canAccessContacts,
        canAccessLeadership,
        canAccessNeoDoveShadow,
        canAccessOpsInputs,
        canAccessContentIntelligence,
        canAccessReviews,
        canAccessSpend,
        contacts,
    ]);

    useEffect(() => {
        if (tabs.some((tab) => tab.id === activeTab)) return;
        setActiveTab(tabs[0]?.id || 'workboard');
    }, [activeTab, tabs]);

    const statusOptions = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost'];
    const channelOptions = ['all', 'seminar', 'newsletter', 'whatsapp', 'telegram'];
    const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [])));
    const roleLabel = ROLE_LABELS[currentRole] || currentRole || 'Team user';
    const guide = roleGuideFor(currentRole);
    const availableQuickTabs = guide.quickTabs.filter((tabId) => tabs.some((tab) => tab.id === tabId));

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">CRM Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Signed in role: {currentRole || 'unknown'}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/manual-screenshots">
                        <Button variant="outline" className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50">
                            <BookOpen className="w-4 h-4" /> Screenshot Guide
                        </Button>
                    </Link>
                    <Link href="/admin/marketing-manual">
                        <Button variant="outline" className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50">
                            <BookOpen className="w-4 h-4" /> Training Manual
                        </Button>
                    </Link>
                    <Link href="/admin/training-deck">
                        <Button variant="outline" className="flex items-center gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                            <Target className="w-4 h-4" /> Training Deck
                        </Button>
                    </Link>
                    {isContactTab && (
                        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Add Contact
                        </Button>
                    )}
                    {isContactTab && (
                        <Button onClick={exportContacts} variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" /> Export
                        </Button>
                    )}
                    {isContactTab && canDeleteContacts && selectedContacts.length > 0 && (
                        <Button onClick={handleBulkDelete} variant="destructive" className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete Selected ({selectedContacts.length})
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <Button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        variant={activeTab === tab.id ? 'default' : 'outline'}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count && <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-xs">{tab.count}</span>}
                    </Button>
                ))}
            </div>

            <div className="mb-6 border border-emerald-100 bg-emerald-50/40 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{roleLabel}</p>
                        <h2 className="text-lg font-semibold text-gray-900 mt-1">{guide.heading}</h2>
                        <p className="text-sm text-gray-700 mt-1">{guide.why}</p>
                        <p className="text-sm text-emerald-800 mt-2 font-medium">SLA: {guide.sla}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Use only dropdown/select fields. No free-form tracking outside CRM.
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Today you must update</h3>
                        <div className="space-y-2">
                            {guide.mustUpdate.map((item) => (
                                <div key={item} className="text-sm text-gray-700 flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-600" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick actions</h3>
                        <div className="flex flex-wrap gap-2">
                            {availableQuickTabs.map((tabId) => (
                                <Button
                                    key={tabId}
                                    size="sm"
                                    variant={activeTab === tabId ? 'default' : 'outline'}
                                    onClick={() => setActiveTab(tabId)}
                                >
                                    {TAB_LABELS[tabId]}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {isContactTab && (
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    {statusOptions.map(option => (
                        <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                    ))}
                </select>
                <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    {channelOptions.map(option => (
                        <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}</option>
                    ))}
                </select>
                <select
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="all">All Tags</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>
            )}

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {activeTab === 'workboard' ? (
                    <div className="p-6">
                        <OpsWorkboard />
                    </div>
                ) : activeTab === 'daily_command' ? (
                    <div className="p-6">
                        <DailyCommandCenter />
                    </div>
                ) : activeTab === 'analytics' ? (
                    <div className="p-6">
                        <CampaignAnalytics contacts={contacts} />
                    </div>
                ) : activeTab === 'ceo_command' ? (
                    <div className="p-6">
                        <CeoCommandCenter contacts={contacts} />
                    </div>
                ) : activeTab === 'team' ? (
                    <div className="p-6">
                        <TeamManagement />
                    </div>
                ) : activeTab === 'settings' ? (
                    <div className="p-6">
                        <SettingsManagement />
                    </div>
                ) : activeTab === 'centers' ? (
                    <div className="p-6">
                        <CentersManagement />
                    </div>
                ) : activeTab === 'announcements' ? (
                    <div className="p-6">
                        <AnnouncementsManagement />
                    </div>
                ) : activeTab === 'spend' ? (
                    <div className="p-6">
                        <SpendManagement />
                    </div>
                ) : activeTab === 'ops_inputs' ? (
                    <div className="p-6">
                        <OpsInputsManagement userRole={currentRole} />
                    </div>
                ) : activeTab === 'reviews' ? (
                    <div className="p-6">
                        <ReviewsManagement />
                    </div>
                ) : activeTab === 'content_intelligence' ? (
                    <div className="p-6">
                        <ContentIntelligenceManagement />
                    </div>
                ) : activeTab === 'neodove_shadow' ? (
                    <div className="p-6">
                        <NeoDoveShadowManagement />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedContacts(filteredContacts.map(c => c.id));
                                            } else {
                                                setSelectedContacts([]);
                                            }
                                        }}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Contact</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">Loading contacts...</TableCell>
                                </TableRow>
                            ) : filteredContacts.length > 0 ? (
                                filteredContacts.map((contact) => (
                                    <TableRow key={contact.id} className="group hover:bg-gray-50 transition-colors">
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                checked={selectedContacts.includes(contact.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedContacts((prev) => [...prev, contact.id]);
                                                    } else {
                                                        setSelectedContacts((prev) => prev.filter((id) => id !== contact.id));
                                                    }
                                                }}
                                            />
                                        </TableCell>
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
                                                        {[contact.utmSource, contact.utmMedium, contact.utmCampaign, contact.landingPath].filter(Boolean).join(' → ')}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{contact.email}</TableCell>
                                        <TableCell className="text-gray-600">{contact.phone}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                {contact.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${contact.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                contact.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                                                    contact.status === 'qualified' ? 'bg-green-100 text-green-700' :
                                                        contact.status === 'converted' ? 'bg-emerald-100 text-emerald-700' :
                                                            contact.status === 'lost' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                }`}>
                                                {contact.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{contact.lastContact}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    onClick={() => {
                                                        setEditingContact(contact);
                                                        setEditForm(contact);
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-1"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                {canDeleteContacts ? (
                                                    <Button
                                                        onClick={() => handleContactDelete(contact.id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="p-1 text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">No contacts found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {editingContact && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Contact</h2>
                        <div className="space-y-4">
                            <Input
                                placeholder="Name"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                            <Input
                                placeholder="Email"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                            <Input
                                placeholder="Phone"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                            <select
                                value={editForm.status || ''}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                {statusOptions.slice(1).map(option => (
                                    <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button onClick={() => handleContactUpdate({ ...editingContact, ...editForm })}>
                                <Save className="w-4 h-4 mr-2" /> Save
                            </Button>
                            <Button onClick={() => setEditingContact(null)} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Contact</h2>
                        <div className="space-y-4">
                            <Input
                                placeholder="Name"
                                value={newContact.name || ''}
                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                            />
                            <Input
                                placeholder="Email"
                                value={newContact.email || ''}
                                onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            />
                            <Input
                                placeholder="Phone"
                                value={newContact.phone || ''}
                                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            />
                            <Input
                                placeholder="Role"
                                value={newContact.role || ''}
                                onChange={(e) => setNewContact({ ...newContact, role: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2 mt-6">
                            <Button onClick={handleAddContact}>
                                <Save className="w-4 h-4 mr-2" /> Add Contact
                            </Button>
                            <Button onClick={() => setShowAddModal(false)} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

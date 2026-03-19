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
import { Search, Download, UserPlus, Phone, Mail, Calendar, CheckCircle, Clock, MapPin, Megaphone, Trash2, Edit, Save, X, BookOpen, IndianRupee, Target, Copy } from 'lucide-react';
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
    ownerName?: string;
    ownerEmail?: string;
    nextFollowUpAt?: string;
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

type FilterTab =
    | 'today'
    | 'daily_command'
    | 'workboard'
    | 'all'
    | 'seminar'
    | 'newsletter'
    | 'whatsapp'
    | 'telegram'
    | 'at_home_test'
    | 'hot_leads'
    | 'followups'
    | 'team'
    | 'analytics'
    | 'ceo_command'
    | 'settings'
    | 'centers'
    | 'announcements'
    | 'spend'
    | 'ops_inputs';

function normalizeStatusToken(value: unknown) {
    const token = String(value || '').trim().toLowerCase();
    if (!token) return 'new';
    if (token === 'hot lead' || token === 'hot_lead' || token === 'hot-lead') return 'new';
    if (token.includes('convert') || token.includes('won')) return 'converted';
    if (token.includes('lost') || token.includes('dispose') || token.includes('drop') || token.includes('closed')) return 'lost';
    if (token.includes('qualif')) return 'qualified';
    if (token.includes('contact') || token.includes('progress')) return 'contacted';
    if (token === 'new' || token === 'contacted' || token === 'qualified' || token === 'converted' || token === 'lost') return token;
    return token;
}

function toStoredStatus(value: unknown) {
    const normalized = normalizeStatusToken(value);
    if (normalized === 'new') return 'New';
    if (normalized === 'contacted') return 'Contacted';
    if (normalized === 'qualified') return 'Qualified';
    if (normalized === 'converted') return 'Converted';
    if (normalized === 'lost') return 'Lost';
    if (!normalized) return 'New';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function CRM() {
    const { data: session } = useSession();
    const currentRole = String((session?.user as { role?: string } | undefined)?.role || '').trim().toLowerCase();
    const leadershipRoles = new Set(['admin', 'ceo', 'crm_ops_admin']);
    const opsInputRoles = new Set(['admin', 'ceo', 'crm_ops_admin', 'agency_ops', 'marketing_manager', 'performance_marketer', 'field_exec']);
    const contactRoles = new Set(['admin', 'ceo', 'crm_ops_admin', 'ivr_manager', 'telecaller_manager', 'telecaller', 'counselor']);
    const spendRoles = new Set(['admin', 'ceo', 'crm_ops_admin', 'agency_ops', 'marketing_manager', 'performance_marketer']);
    const analyticsRoles = new Set([
        'admin',
        'ceo',
        'crm_ops_admin',
        'agency_ops',
        'marketing_manager',
        'performance_marketer',
        'content_manager',
        'ivr_manager',
        'telecaller_manager',
    ]);

    const canAccessLeadership = leadershipRoles.has(currentRole);
    const canAccessOpsInputs = opsInputRoles.has(currentRole) || canAccessLeadership;
    const canAccessContacts = contactRoles.has(currentRole) || canAccessLeadership;
    const canDeleteContacts = canAccessLeadership;
    const canAccessSpend = spendRoles.has(currentRole) || canAccessLeadership;
    const canAccessAnalytics = analyticsRoles.has(currentRole) || canAccessLeadership;
    const canAccessCeoCommand = canAccessLeadership;

    const isCeoPortal = canAccessLeadership;
    const isAdsPortal = ['agency_ops', 'marketing_manager', 'performance_marketer'].includes(currentRole);
    const isContentPortal = currentRole === 'content_manager';
    const isTelecallerManagerPortal = ['telecaller_manager', 'ivr_manager'].includes(currentRole);
    const isCounselorPortal = currentRole === 'counselor' || currentRole === 'telecaller';

    const [activeTab, setActiveTab] = useState<FilterTab>('today');
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
    const contactTabs: FilterTab[] = ['all', 'seminar', 'newsletter', 'whatsapp', 'telegram', 'at_home_test', 'hot_leads', 'followups'];
    const isContactTab = contactTabs.includes(activeTab);
    const shouldLoadContacts =
        (isContactTab && canAccessContacts) ||
        (activeTab === 'analytics' && canAccessAnalytics) ||
        (activeTab === 'today' && (canAccessContacts || canAccessAnalytics));

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
        } else if (activeTab === 'followups') {
            const now = Date.now();
            const in24h = now + 24 * 60 * 60 * 1000;
            filtered = filtered.filter((contact) => {
                if (!contact.nextFollowUpAt) return false;
                const ts = Date.parse(contact.nextFollowUpAt);
                if (Number.isNaN(ts)) return false;
                const status = String(contact.status || '').toLowerCase();
                if (status === 'converted' || status === 'lost') return false;
                return ts <= in24h;
            });
        }

        if (searchTerm) {
            filtered = filtered.filter(contact =>
                contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.phone.includes(searchTerm)
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(contact => normalizeStatusToken(contact.status) === statusFilter);
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
            const payload = {
                ...contact,
                status: toStoredStatus(contact.status),
            };
            const response = await fetch(`/api/admin/contacts/${contact.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
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
            ['Name', 'Email', 'Phone', 'Role', 'Status', 'Owner', 'Next Follow-up', 'Last Contact', 'Seminar Registered', 'Newsletter Subscribed', 'WhatsApp Opt-in', 'Telegram Opt-in', 'Tags', 'Lead Source', 'Lead Score', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Landing Path', 'Last Message At', 'Created At'].join(','),
            ...filteredContacts.map(contact => [
                contact.name,
                contact.email,
                contact.phone,
                contact.role,
                contact.status,
                contact.ownerEmail || contact.ownerName,
                contact.nextFollowUpAt,
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
            { id: 'today', label: 'Today', icon: Target },
        ];

        const hotLeadCount = contacts.filter((c) => (c.leadScore || 0) >= 70 || c.tags?.includes('hot_lead')).length;
        const followupCount = contacts.filter((c) => Boolean(c.nextFollowUpAt)).length;

        if (isCeoPortal) {
            if (canAccessAnalytics) nextTabs.push({ id: 'analytics', label: 'Analytics', icon: Search });
            if (canAccessSpend) nextTabs.push({ id: 'spend', label: 'Spend', icon: IndianRupee });
            nextTabs.push({ id: 'workboard', label: 'Workboard', icon: Clock });
            nextTabs.push({ id: 'daily_command', label: 'Daily Command', icon: Target });
            if (canAccessContacts) {
                nextTabs.push(
                    { id: 'hot_leads', label: 'Hot Leads', icon: Megaphone, count: hotLeadCount },
                    { id: 'followups', label: 'Follow-ups', icon: Clock, count: followupCount },
                    { id: 'all', label: 'All Contacts', icon: Search }
                );
            }
            if (canAccessCeoCommand) nextTabs.push({ id: 'ceo_command', label: 'CEO Command', icon: Clock });
            if (canAccessOpsInputs) nextTabs.push({ id: 'ops_inputs', label: 'Ops Inputs', icon: Clock });
            nextTabs.push(
                { id: 'team', label: 'Team', icon: UserPlus },
                { id: 'centers', label: 'Centers', icon: MapPin },
                { id: 'announcements', label: 'Announcements', icon: Megaphone },
                { id: 'settings', label: 'Settings', icon: Search }
            );
            return nextTabs;
        }

        if (isAdsPortal) {
            if (canAccessSpend) nextTabs.push({ id: 'spend', label: 'Spend', icon: IndianRupee });
            if (canAccessAnalytics) nextTabs.push({ id: 'analytics', label: 'Analytics', icon: Search });
            nextTabs.push({ id: 'workboard', label: 'Workboard', icon: Clock });
            if (canAccessOpsInputs) nextTabs.push({ id: 'ops_inputs', label: 'Ops Inputs', icon: Clock });
            return nextTabs;
        }

        if (isContentPortal) {
            if (canAccessAnalytics) nextTabs.push({ id: 'analytics', label: 'Analytics', icon: Search });
            nextTabs.push({ id: 'workboard', label: 'Workboard', icon: Clock });
            return nextTabs;
        }

        if (isTelecallerManagerPortal) {
            nextTabs.push({ id: 'daily_command', label: 'Daily Command', icon: Target });
            if (canAccessContacts) {
                nextTabs.push(
                    { id: 'hot_leads', label: 'Hot Leads', icon: Megaphone, count: hotLeadCount },
                    { id: 'followups', label: 'Follow-ups', icon: Clock, count: followupCount },
                    { id: 'all', label: 'All Contacts', icon: Search }
                );
            }
            return nextTabs;
        }

        if (isCounselorPortal) {
            if (canAccessContacts) {
                nextTabs.push(
                    { id: 'hot_leads', label: 'Hot Leads', icon: Megaphone, count: hotLeadCount },
                    { id: 'followups', label: 'Follow-ups', icon: Clock, count: followupCount },
                    { id: 'all', label: 'All Contacts', icon: Search }
                );
            }
            return nextTabs;
        }

        nextTabs.push({ id: 'workboard', label: 'Workboard', icon: Clock });
        nextTabs.push({ id: 'daily_command', label: 'Daily Command', icon: Target });
        if (canAccessAnalytics) nextTabs.push({ id: 'analytics', label: 'Analytics', icon: Search });
        if (canAccessSpend) nextTabs.push({ id: 'spend', label: 'Spend', icon: IndianRupee });
        if (canAccessContacts) nextTabs.push({ id: 'all', label: 'All Contacts', icon: Search });
        return nextTabs;
    }, [
        canAccessAnalytics,
        canAccessCeoCommand,
        canAccessContacts,
        canAccessOpsInputs,
        canAccessSpend,
        contacts,
        isAdsPortal,
        isContentPortal,
        isCounselorPortal,
        isCeoPortal,
        isTelecallerManagerPortal,
    ]);

    useEffect(() => {
        if (tabs.some((tab) => tab.id === activeTab)) return;
        setActiveTab(tabs[0]?.id || 'workboard');
    }, [activeTab, tabs]);

    const statusOptions = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost'];
    const channelOptions = ['all', 'seminar', 'newsletter', 'whatsapp', 'telegram'];
    const allTags = Array.from(new Set(contacts.flatMap(contact => contact.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [])));

    const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const contactOps = useMemo(() => {
        const totalLeads = contacts.length;
        const byStatus = contacts.reduce((acc, contact) => {
            const status = normalizeStatusToken(contact.status);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const now = Date.now();
        const in24h = now + 24 * 60 * 60 * 1000;
        const pendingStatuses = new Set(['new', 'contacted', 'qualified']);

        const followupsDue = contacts.filter((contact) => {
            if (!contact.nextFollowUpAt) return false;
            const ts = Date.parse(contact.nextFollowUpAt);
            if (Number.isNaN(ts)) return false;
            const status = normalizeStatusToken(contact.status);
            if (status === 'converted' || status === 'lost') return false;
            return ts <= in24h;
        }).length;

        const staleLeads = contacts.filter((contact) => {
            const status = normalizeStatusToken(contact.status);
            if (!pendingStatuses.has(status)) return false;
            const anchor = Date.parse(contact.lastContact || '') || Date.parse(contact.createdAt || '');
            if (!Number.isFinite(anchor)) return false;
            const ageHours = (now - anchor) / (1000 * 60 * 60);
            return ageHours >= 24;
        }).length;

        const hotLeads = contacts.filter((contact) => (contact.leadScore || 0) >= 70 || contact.tags?.includes('hot_lead')).length;

        return {
            totalLeads,
            converted: byStatus.converted || 0,
            qualified: byStatus.qualified || 0,
            staleLeads,
            followupsDue,
            hotLeads,
        };
    }, [contacts]);

    const riderDefinition = useMemo(() => {
        if (isCeoPortal) {
            return {
                title: 'CEO Standup Dashboard',
                tasks: [
                    { id: 'review_efficiency', label: 'Review campaign efficiency + bottlenecks (Analytics)' },
                    { id: 'lock_decisions', label: 'Lock today’s decisions (scale/pause + theme + ops focus)' },
                    { id: 'handoff_tasks', label: 'Share handoff with team (copy decisions)' },
                ],
                actions: [
                    { id: 'open_analytics', label: 'Open Analytics', tab: 'analytics' as const },
                    { id: 'open_spend', label: 'Open Spend', tab: 'spend' as const },
                    { id: 'open_workboard', label: 'Open Workboard', tab: 'workboard' as const },
                ],
            };
        }
        if (isAdsPortal) {
            return {
                title: 'Ads Operator — Today Rider',
                tasks: [
                    { id: 'log_spend', label: 'Log yesterday’s spend for every running campaign (Spend)' },
                    { id: 'utm_check', label: 'Confirm UTM campaign tokens match Spend + Ads' },
                    { id: 'apply_changes', label: 'Apply CEO scale/pause decisions in ad accounts' },
                ],
                actions: [
                    { id: 'open_spend', label: 'Open Spend', tab: 'spend' as const },
                    { id: 'open_analytics', label: 'Open Analytics', tab: 'analytics' as const },
                    { id: 'open_ops_inputs', label: 'Open Ops Inputs', tab: 'ops_inputs' as const },
                ],
            };
        }
        if (isContentPortal) {
            return {
                title: 'Content Manager — Today Rider',
                tasks: [
                    { id: 'check_readiness', label: 'Check data readiness (avoid hunch posting)' },
                    { id: 'copy_prompt', label: 'Copy Gemini prompt with UTMs and generate assets' },
                    { id: 'publish_assets', label: 'Publish with correct tracked links + asset ids' },
                ],
                actions: [
                    { id: 'open_analytics_agency', label: 'Open Agency Feedback', tab: 'analytics' as const, section: 'agency-feedback' },
                    { id: 'open_analytics_windows', label: 'Open Posting Windows', tab: 'analytics' as const, section: 'best-posting-windows' },
                    { id: 'open_workboard', label: 'Open Workboard', tab: 'workboard' as const },
                ],
            };
        }
        if (isTelecallerManagerPortal) {
            return {
                title: 'Telecaller Manager — Today Rider',
                tasks: [
                    { id: 'work_hot', label: `Assign/work hot leads (${contactOps.hotLeads})` },
                    { id: 'work_followups', label: `Clear follow-ups due in 24h (${contactOps.followupsDue})` },
                    { id: 'fix_sla', label: `Fix stale leads older than 24h (${contactOps.staleLeads})` },
                ],
                actions: [
                    { id: 'open_hot', label: 'Open Hot Leads', tab: 'hot_leads' as const },
                    { id: 'open_followups', label: 'Open Follow-ups', tab: 'followups' as const },
                    { id: 'open_daily', label: 'Open Daily Command', tab: 'daily_command' as const },
                ],
            };
        }
        if (isCounselorPortal) {
            return {
                title: 'Counselor — Today Rider',
                tasks: [
                    { id: 'work_qualified', label: `Work qualified leads (${contactOps.qualified})` },
                    { id: 'update_outcomes', label: 'Update outcomes (Qualified/Converted/Lost) + notes' },
                    { id: 'schedule_next', label: 'Set next follow-up time for every active lead' },
                ],
                actions: [
                    { id: 'open_hot', label: 'Open Hot Leads', tab: 'hot_leads' as const },
                    { id: 'open_followups', label: 'Open Follow-ups', tab: 'followups' as const },
                    { id: 'open_all', label: 'Open All Contacts', tab: 'all' as const },
                ],
            };
        }

        return {
            title: 'Today',
            tasks: [
                { id: 'check_dashboard', label: 'Check dashboard and action items' },
                { id: 'do_primary_work', label: 'Complete primary work for your role' },
                { id: 'update_crm', label: 'Update CRM status/notes so analytics stays accurate' },
            ],
            actions: [
                { id: 'open_analytics', label: 'Open Analytics', tab: 'analytics' as const },
                { id: 'open_workboard', label: 'Open Workboard', tab: 'workboard' as const },
                { id: 'open_daily', label: 'Open Daily Command', tab: 'daily_command' as const },
            ],
        };
    }, [contactOps.followupsDue, contactOps.hotLeads, contactOps.qualified, contactOps.staleLeads, currentRole, isAdsPortal, isContentPortal, isCounselorPortal, isCeoPortal, isTelecallerManagerPortal]);

    const riderStorageKey = useMemo(() => `crm_rider_${currentRole || 'unknown'}_${todayKey}`, [currentRole, todayKey]);
    const [riderState, setRiderState] = useState<Record<string, boolean>>(() => {
        if (typeof window === 'undefined') return {};
        try {
            const raw = window.localStorage.getItem(riderStorageKey);
            return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(riderStorageKey);
            setRiderState(raw ? (JSON.parse(raw) as Record<string, boolean>) : {});
        } catch {
            setRiderState({});
        }
    }, [riderStorageKey]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(riderStorageKey, JSON.stringify(riderState));
        } catch {
            // ignore
        }
    }, [riderState, riderStorageKey]);

    const ceoDecisionStorageKey = useMemo(() => `crm_ceo_decisions_${todayKey}`, [todayKey]);
    const [ceoDecisions, setCeoDecisions] = useState(() => {
        if (typeof window === 'undefined') return '';
        try {
            return window.localStorage.getItem(ceoDecisionStorageKey) || '';
        } catch {
            return '';
        }
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!isCeoPortal) return;
        try {
            window.localStorage.setItem(ceoDecisionStorageKey, ceoDecisions);
        } catch {
            // ignore
        }
    }, [ceoDecisionStorageKey, ceoDecisions, isCeoPortal]);

    const openTab = useCallback((tab: FilterTab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const openAnalyticsSection = useCallback((sectionId: string) => {
        setActiveTab('analytics');
        window.setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    const copyCeoHandoff = useCallback(async () => {
        const text = [
            `CEO Handoff — ${todayKey}`,
            '',
            `Leads: ${contactOps.totalLeads} | Qualified: ${contactOps.qualified} | Converted: ${contactOps.converted}`,
            `Hot leads: ${contactOps.hotLeads} | Follow-ups due: ${contactOps.followupsDue} | Stale >24h: ${contactOps.staleLeads}`,
            '',
            ceoDecisions.trim() ? `Decisions:\n${ceoDecisions.trim()}` : 'Decisions: (not filled)',
        ].join('\n');

        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // ignore
        }
    }, [ceoDecisions, contactOps.converted, contactOps.followupsDue, contactOps.hotLeads, contactOps.qualified, contactOps.staleLeads, contactOps.totalLeads, todayKey]);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">CRM Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Signed in role: {currentRole || 'unknown'}</p>
                </div>
                <div className="flex gap-2">
                    {canAccessLeadership ? (
                        <Link href="/admin/marketing-manual">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                            >
                                <BookOpen className="w-4 h-4" /> Manual & SLA
                            </Button>
                        </Link>
                    ) : null}
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
                {activeTab === 'today' ? (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Today</p>
                                        <h2 className="text-lg font-bold text-gray-900 mt-1">{riderDefinition.title}</h2>
                                        <p className="text-xs text-gray-500 mt-1">Follow the rider. Update CRM so decisions stay data-based.</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Date</p>
                                        <p className="text-sm font-semibold text-gray-800">{todayKey}</p>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                    {riderDefinition.tasks.map((task) => {
                                        const checked = Boolean(riderState[task.id]);
                                        return (
                                            <button
                                                key={task.id}
                                                type="button"
                                                onClick={() => setRiderState((prev) => ({ ...prev, [task.id]: !checked }))}
                                                className={`w-full text-left rounded-lg border px-3 py-3 text-sm flex items-start gap-3 ${
                                                    checked ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300'}`}>
                                                    {checked ? <CheckCircle className="w-3 h-3 text-white" /> : null}
                                                </span>
                                                <span className="leading-snug">{task.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {riderDefinition.actions.map((action) => (
                                        <Button
                                            key={action.id}
                                            variant="outline"
                                            className="text-xs"
                                            onClick={() => ('section' in action && action.section ? openAnalyticsSection(action.section) : openTab(action.tab))}
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Snapshot</p>
                                        <h3 className="text-lg font-bold text-gray-900 mt-1">What’s happening right now</h3>
                                    </div>
                                    {isCeoPortal ? (
                                        <Button onClick={copyCeoHandoff} className="flex items-center gap-2">
                                            <Copy className="w-4 h-4" /> Copy CEO handoff
                                        </Button>
                                    ) : null}
                                </div>

                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/40">
                                        <p className="text-xs text-gray-500">Leads</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">{contactOps.totalLeads}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/40">
                                        <p className="text-xs text-gray-500">Qualified</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">{contactOps.qualified}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/40">
                                        <p className="text-xs text-gray-500">Converted</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">{contactOps.converted}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/40">
                                        <p className="text-xs text-gray-500">Hot leads</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">{contactOps.hotLeads}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/40">
                                        <p className="text-xs text-gray-500">Follow-ups (24h)</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">{contactOps.followupsDue}</p>
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/40">
                                        <p className="text-xs text-gray-500">Stale &gt;24h</p>
                                        <p className="text-xl font-semibold text-gray-900 mt-1">{contactOps.staleLeads}</p>
                                    </div>
                                </div>

                                {isCeoPortal ? (
                                    <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4">
                                        <p className="text-sm font-semibold text-gray-900">CEO decisions (today)</p>
                                        <p className="text-xs text-gray-500 mt-1">Write the decisions taken in the standup. Copy handoff shares this with the team.</p>
                                        <textarea
                                            value={ceoDecisions}
                                            onChange={(e) => setCeoDecisions(e.target.value)}
                                            placeholder="Budget: ...&#10;Creative theme: ...&#10;Ops focus: ...&#10;Risks/issues: ..."
                                            className="mt-3 w-full min-h-[140px] rounded-md border border-gray-200 px-3 py-2 text-sm"
                                        />
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Button variant="outline" onClick={() => openTab('analytics')} className="text-xs">Open Analytics</Button>
                                            <Button variant="outline" onClick={() => openTab('spend')} className="text-xs">Open Spend</Button>
                                            <Button variant="outline" onClick={() => openTab('workboard')} className="text-xs">Open Workboard</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-5 rounded-lg border border-gray-100 bg-gray-50/40 p-4">
                                        <p className="text-sm font-semibold text-gray-900">Do your work from the rider</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Use the buttons on the left to jump straight to your working screens. The rider stays saved for today on this machine.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isCeoPortal && canAccessAnalytics ? (
                            <div className="rounded-xl border border-gray-200 bg-white p-6">
                                <CampaignAnalytics contacts={contacts} />
                            </div>
                        ) : null}
                    </div>
                ) : activeTab === 'workboard' ? (
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
                                <TableHead>Owner</TableHead>
                                <TableHead>Follow-up</TableHead>
                                <TableHead>Last Contact</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">Loading contacts...</TableCell>
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
                                            <span className={`px-2 py-1 rounded-full text-xs ${normalizeStatusToken(contact.status) === 'new' ? 'bg-blue-100 text-blue-700' :
                                                normalizeStatusToken(contact.status) === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                                                    normalizeStatusToken(contact.status) === 'qualified' ? 'bg-green-100 text-green-700' :
                                                        normalizeStatusToken(contact.status) === 'converted' ? 'bg-emerald-100 text-emerald-700' :
                                                            normalizeStatusToken(contact.status) === 'lost' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                }`}>
                                                {toStoredStatus(contact.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{contact.ownerEmail || contact.ownerName || ''}</TableCell>
                                        <TableCell className="text-gray-600">{contact.nextFollowUpAt || ''}</TableCell>
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
                                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">No contacts found</TableCell>
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
                            <Input
                                placeholder="Owner Name"
                                value={editForm.ownerName || ''}
                                onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                            />
                            <Input
                                placeholder="Owner Email"
                                value={editForm.ownerEmail || ''}
                                onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })}
                            />
                            <Input
                                type="datetime-local"
                                value={editForm.nextFollowUpAt ? String(editForm.nextFollowUpAt).replace('Z', '').slice(0, 16) : ''}
                                onChange={(e) => setEditForm({ ...editForm, nextFollowUpAt: e.target.value })}
                            />
                            <select
                                value={normalizeStatusToken(editForm.status) || ''}
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

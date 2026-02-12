export interface Contact {
    id: string;
    name: string;
    email: string;
    phone: string;
    whatsappNumber?: string;
    telegramId?: string;
    role: string;
    status: string;
    tags?: string;
    leadScore: number;
    leadSource: string;
    preferredChannel?: string;
    message?: string;
    lastContact?: string;
    lastMessageAt?: string;
    conversationCount: number;
    whatsappOptIn: boolean;
    telegramOptIn: boolean;
    newsletterSubscribed: boolean;
    seminarRegistered: boolean;
    atHomeTest: boolean;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    createdAt: string;
}

export interface ContactsTableProps {
    activeTab: string;
    isLoading: boolean;
    filteredContacts: Contact[];
    contacts: Contact[];
}

export interface AdminUser {
    id: string;
    email: string;
    role: string;
    createdAt: string;
}

export interface TeamTabProps {
    newAdminEmail: string;
    setNewAdminEmail: (email: string) => void;
    handleAddAdmin: () => void;
    team: AdminUser[];
    isLoading: boolean;
    handleRemoveAdmin: (email: string) => void;
}
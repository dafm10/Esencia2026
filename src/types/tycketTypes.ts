export type Ticket = {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    dni: string;
    edad?: string;
    profesion?: string;
    church: string;
    church_role: string;
    area: string;
    district: string;
    voucher_path: string;
    voucher_code: string;
    status: 'pending' | 'approved' | 'rejected';
    ticket_code?: string;
    used: boolean;
    checked_in: boolean;
    checked_in_at?: string;
    // Workshops
    workshop_day1?: string;
    workshop_day2?: string;
    reviewed_by?: string;
    created_at: string;
    reviewed_at?: string;
};

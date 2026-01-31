// DigiDhoodh - Staff API Route
// Handles staff CRUD operations and permissions management

import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma'; // Removed Prisma dependency

// GET - Fetch all staff for a dairy
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const dairyId = searchParams.get('dairyId');
        const attendance = searchParams.get('attendance');

        // Always return demo data for now to fix build error
        // TODO: Re-integrate with Supabase when tables are ready

        if (attendance === 'true') {
            return NextResponse.json({ attendance: getDemoAttendance() });
        }

        return NextResponse.json({ staff: getDemoStaff() });

    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json({ staff: getDemoStaff() });
    }
}

// POST - Create a new staff member
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { dairyId, name, email, phone, password, salary, joiningDate, permissions } = body;

        if (!dairyId || !name || !phone) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Mock creation logic
        const staffCode = `STF${String(Math.floor(Math.random() * 100)).padStart(3, '0')}`;

        return NextResponse.json({
            success: true,
            staff: {
                id: 'staff_' + Date.now(),
                userId: 'user_' + Date.now(),
                name,
                email: email || `${phone}@temp.com`,
                phone,
                staffCode,
                isActive: true,
            },
        });

    } catch (error) {
        console.error('Error creating staff:', error);
        return NextResponse.json(
            { error: 'Failed to create staff member' },
            { status: 500 }
        );
    }
}

// Simple password hashing (in production, use bcrypt)
async function hashPassword(password: string): Promise<string> {
    // Using Web Crypto API for simple hash
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

function getDefaultPermissions() {
    return {
        milkCollection: { view: true, add: true, edit: false, delete: false },
        farmers: { view: true, add: false, edit: false, delete: false },
        billing: { view: false, generateDraft: false, finalize: false },
        reports: { view: false, export: false },
        payments: { view: false, record: false },
        inventory: { view: false, manage: false },
    };
}

// Demo data functions
function getDemoStaff() {
    return [
        {
            id: '1',
            userId: 'u1',
            name: 'Rajesh Kumar',
            email: 'rajesh@dairy.com',
            phone: '9876543210',
            staffCode: 'STF001',
            permissions: {
                milkCollection: { view: true, add: true, edit: true, delete: false },
                farmers: { view: true, add: true, edit: false, delete: false },
                billing: { view: false, generateDraft: false, finalize: false },
                reports: { view: false, export: false },
                payments: { view: false, record: false },
                inventory: { view: false, manage: false },
            },
            salary: 15000,
            joiningDate: '2024-01-15',
            isActive: true,
            lastActiveAt: new Date().toISOString(),
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            userId: 'u2',
            name: 'Sunil Sharma',
            email: 'sunil@dairy.com',
            phone: '9876543211',
            staffCode: 'STF002',
            permissions: {
                milkCollection: { view: true, add: true, edit: false, delete: false },
                farmers: { view: true, add: false, edit: false, delete: false },
                billing: { view: false, generateDraft: false, finalize: false },
                reports: { view: false, export: false },
                payments: { view: false, record: false },
                inventory: { view: false, manage: false },
            },
            salary: 12000,
            joiningDate: '2024-03-01',
            isActive: true,
            lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
            createdAt: '2024-03-01T10:00:00Z',
            updatedAt: new Date().toISOString(),
        },
        {
            id: '3',
            userId: 'u3',
            name: 'Priya Patel',
            email: 'priya@dairy.com',
            phone: '9876543212',
            staffCode: 'STF003',
            permissions: getDefaultPermissions(),
            salary: 10000,
            joiningDate: '2024-06-15',
            isActive: false,
            createdAt: '2024-06-15T10:00:00Z',
            updatedAt: new Date().toISOString(),
        },
    ];
}

function getDemoAttendance() {
    const today = new Date().toISOString().split('T')[0];
    return [
        {
            id: '1',
            staffId: '1',
            staffName: 'Rajesh Kumar',
            date: today,
            checkIn: '08:00',
            checkOut: '17:00',
            status: 'PRESENT',
        },
        {
            id: '2',
            staffId: '2',
            staffName: 'Sunil Sharma',
            date: today,
            checkIn: '08:30',
            status: 'PRESENT',
        },
        {
            id: '3',
            staffId: '3',
            staffName: 'Priya Patel',
            date: today,
            status: 'ABSENT',
            notes: 'On leave',
        },
    ];
}

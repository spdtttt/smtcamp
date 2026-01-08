import { prisma } from '@/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const body = await req.json();
    const { camp_id } = body;

    const camp = await prisma.camp.findUnique({
        where: {
            id: camp_id
        }
    })

    if (!camp) {
        return NextResponse.json(
            { availableStudents: [] },
            { status: 404 }
        );
    }

    const rooms = await prisma.room.findMany({
        where: {
            camp_id: camp_id
        },
        select: {
            member_ids: true
        }
    })

    const notAvailableStudentsID = rooms.flatMap((r) => r.member_ids);

    const availableStudents = await prisma.student.findMany({
        where: {
            class: camp.class,
            id: { notIn: notAvailableStudentsID },
        },
        orderBy: [
            { gender: 'desc' },
            { student_id: 'asc' }
        ],
        select: {
            id: true,
            student_id: true,
            national_id: false,
            name: true,
            gender: true,
            class: true
        }
    });

    return NextResponse.json(
        { availableStudents: availableStudents },
        { status: 200 }
    );
}
import { prisma } from "@/prisma"
import { NextResponse, NextRequest } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { camp_id, student_id } = body;

        if (!camp_id || !student_id) {
            return NextResponse.json(
                { error: 'Missing CampID or StudentID'},
                { status: 400 }
            )
        }

        // ดึงข้อมูล room ทั้งหมดที่เกี่ยวข้องกับ camp_id
        const rooms = await prisma.room.findMany({
            where: {
                camp_id: camp_id
            }
        })

        // กรองห้องที่มี student_id อยู่ใน array ของนักเรียนในห้องนั้น
        const roomSelected = rooms.filter((room: any) => {
            return room.member_ids && room.member_ids.includes(student_id);
        })

        // roomSelected[0].member_ids

        // ดึงนักเรียนทั้งหมดที่อยู่ใน Array roomSelected
        const members = await prisma.student.findMany({
            where: {
                id: {
                    in: roomSelected[0].member_ids
                }
            }
        })

        const membersName = members.map((member: any) => member.name);
        return NextResponse.json(membersName);
    } catch(err) {
        console.error('Error fetching room:', err);
        return NextResponse.json(
            { error: 'Internal server error', details: err },
            { status: 500 }
        )
    }
}
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { student_id, national_id } = body;

        // แปลง student_id เป็น integer
        const studentIdInt = parseInt(student_id, 10);

        const student = await prisma.student.findUnique({
            where: {
                student_id: studentIdInt
            },
            select: {
                id: true,
                student_id: true,
                national_id: true,
                name: true,
                gender: true,
                class: true
            }
        })

        if (!student) {
            return NextResponse.json({ message: "ไม่พบเลขประจำตัวนักเรียน" }, { status: 404 });
        }

        if (student.national_id !== national_id) {
            return NextResponse.json({ message: "เลขบัตรประจำตัวประชาชนไม่ถูกต้อง" }, { status: 401 });
        }

        const { national_id: _, ...studentWithoutNationalId } = student;

        return NextResponse.json({
            message: 'เข้าสู่ระบบสำเร็จ!',
            student: studentWithoutNationalId
        }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ message: "Someting went wrong from API/login" }, { status: 500 });
    }
}
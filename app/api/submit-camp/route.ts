import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { camp_id, members, note } = body;

    // เช็คว่ามีข้อมูลครบหรือไม่
    if (!camp_id || !members || !Array.isArray(members)) {
      return NextResponse.json(
        { error: "Missing or invalid camp_id or member_ids" },
        { status: 400 }
      );
    }

    // แปลงเป็น number array
    const validMemberIds = members
      .map((id: any) => {
        const numId = typeof id === "string" ? parseInt(id, 10) : id;
        return numId;
      })
      .filter((id: number) => !isNaN(id) && id > 0);

    if (validMemberIds.length === 0) {
      return NextResponse.json(
        { error: "No valid member IDs provided" },
        { status: 400 }
      );
    }

    // ดึง Room ทั้งหมดของ camp_id นี้
    const rooms = await prisma.room.findMany({
      where: { camp_id: parseInt(camp_id, 10) },
    });

    // รวม member_ids ที่มีอยู่แล้ว
    const existingMembers = rooms.flatMap((room) => room.member_ids);

    // เช็คว่า member_ids ที่ส่งมาซ้ำหรือไม่
    const duplicateMembers = validMemberIds.filter((id: number) =>
      existingMembers.includes(id)
    );

    if (duplicateMembers.length > 0) {
      // หา room ที่มี duplicate members
      const conflictRooms = rooms.filter((room) =>
        room.member_ids.some((id: number) => duplicateMembers.includes(id))
      );

      return NextResponse.json(
        {
          error: "Some members are already assigned",
          message:
            "มีสมาชิกบางคนถูกจัดห้องไปแล้ว ไม่สามารถบันทึกได้",
          duplicateMembers,
          conflictRooms,
        },
        { status: 400 }
      );
    }

    // ถ้าไม่มีซ้ำ ให้สร้าง room ใหม่
    const room = await prisma.room.create({
      data: {
        camp_id: parseInt(camp_id, 10),
        member_ids: validMemberIds,
        note: note,
      },
    });

    return NextResponse.json(room);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save room" }, { status: 500 });
  }
}

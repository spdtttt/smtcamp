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

    const campIdNumber = parseInt(camp_id, 10);

    // 🔹 ดึงข้อมูล Camp เพื่อเช็ค roomTypes
    const camp = await prisma.camp.findUnique({
      where: { id: campIdNumber },
      include: { Room: true }
    });

    if (!camp) {
      return NextResponse.json(
        { error: "Camp not found" },
        { status: 404 }
      );
    }

    // 🔹 จำนวนสมาชิกที่ต้องการสร้างห้อง
    const requestedPeopleCount = validMemberIds.length;

    // 🔹 หา roomType ที่ตรงกับจำนวนคนที่ส่งมา
    const matchingRoomType = (camp.roomTypes as any[]).find(
      (rt: any) => rt.peoplePerRoom === requestedPeopleCount
    );

    if (!matchingRoomType) {
      return NextResponse.json(
        {
          error: "Invalid room size",
          message: `ไม่มีห้องสำหรับ ${requestedPeopleCount} คน ในค่ายนี้`,
          availableRoomTypes: camp.roomTypes
        },
        { status: 400 }
      );
    }

    // 🔹 นับจำนวนห้องที่มีอยู่แล้วสำหรับ roomType นี้
    const existingRoomsOfThisType = camp.Room.filter(
      (room: any) => room.member_ids.length === requestedPeopleCount
    );

    const currentRoomCount = existingRoomsOfThisType.length;
    const maxRoomCount = matchingRoomType.roomCount;

    // 🔹 เช็คว่าครบโควตาแล้วหรือยัง
    if (currentRoomCount >= maxRoomCount) {
      return NextResponse.json(
        {
          error: "Room quota exceeded",
          message: `ห้องสำหรับ ${requestedPeopleCount} คนเต็มแล้ว (${currentRoomCount}/${maxRoomCount} ห้อง)`,
          currentRoomCount,
          maxRoomCount,
          roomType: matchingRoomType
        },
        { status: 400 }
      );
    }

    // 🔹 รวม member_ids ที่มีอยู่แล้วทั้งหมด
    const existingMembers = camp.Room.flatMap((room: any) => room.member_ids);

    // 🔹 เช็คว่า member_ids ที่ส่งมาซ้ำหรือไม่
    const duplicateMembers = validMemberIds.filter((id: number) =>
      existingMembers.includes(id)
    );

    if (duplicateMembers.length > 0) {
      // หา room ที่มี duplicate members
      const conflictRooms = camp.Room.filter((room: any) =>
        room.member_ids.some((id: number) => duplicateMembers.includes(id))
      );

      return NextResponse.json(
        {
          error: "Some members are already assigned",
          message: "มีสมาชิกบางคนถูกจัดห้องไปแล้ว ไม่สามารถบันทึกได้",
          duplicateMembers,
          conflictRooms,
        },
        { status: 400 }
      );
    }

    // 🔹 ถ้าผ่านทุกการตรวจสอบ ให้สร้าง room ใหม่
    const room = await prisma.room.create({
      data: {
        camp_id: campIdNumber,
        member_ids: validMemberIds,
        note: note,
      },
    });

    return NextResponse.json({
      success: true,
      room,
      message: `สร้างห้อง ${requestedPeopleCount} คนสำเร็จ (${currentRoomCount + 1}/${maxRoomCount} ห้อง)`,
      quota: {
        current: currentRoomCount + 1,
        max: maxRoomCount,
        remaining: maxRoomCount - currentRoomCount - 1
      }
    });

  } catch (err) {
    console.error("Error creating room:", err);
    return NextResponse.json(
      { error: "Failed to save room", details: String(err) },
      { status: 500 }
    );
  }
}
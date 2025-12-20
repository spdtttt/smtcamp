import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ student_id: string }> }
) {
  try {
    const { student_id } = await context.params;
    const id = parseInt(student_id, 10);

    const result = await prisma.room.deleteMany({
        where: {
            member_ids: {
                has: id
            }
        }
    })

    console.log("deleted count:", result.count);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}

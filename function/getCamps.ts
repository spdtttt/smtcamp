import { prisma } from "@/prisma";

export async function getCamps(
  studentClass: number,
  studentId: number
) {
  const camps = await prisma.camp.findMany({
    where: {
      class: studentClass,
    },
  });

  const campsWithData = await Promise.all(
    camps.map(async (camp) => {
      // ดึงทุกห้องของค่ายนี้
      const rooms = await prisma.room.findMany({
        where: {
          camp_id: camp.id,
        },
        select: {
          member_ids: true,
        },
      });

      // รวมจำนวนสมาชิกทั้งหมด
      const assignedStudents = rooms.reduce(
        (sum, room) => sum + room.member_ids.length,
        0
      );

      // เช็กว่านักเรียนคนนี้อยู่ในค่ายแล้วหรือยัง
      const isJoined = rooms.some(room =>
        room.member_ids.includes(studentId)
      );

      const classStudents = await prisma.student.findMany({
        where: {
            class: camp.class
        }
      })
      const countStudents = classStudents.length
      const percentage = camp.max
        ? (assignedStudents / countStudents) * 100
        : 0;

      return {
        ...camp,
        assignedStudents,
        percentage: Math.round(percentage * 100) / 100,
        isJoined,
      };
    })
  );

  return campsWithData;
}

export default getCamps;

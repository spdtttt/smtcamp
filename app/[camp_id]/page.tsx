import Navbar from "../components/Navbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAvailableStudents } from "@/function/getAvailableStudents";
import CampForm from "../components/CampForm";
import { prisma } from "@/prisma";

interface Student {
  id: number;
  student_id: number;
  name: string | null;
  gender: string | null;
  class: number | null;
}

const CampData = async ({
  camp_id,
  student,
  campInfo,
}: {
  camp_id: number;
  student: Student;
  campInfo: any;
}) => {
  const availableStudents = await getAvailableStudents(camp_id);

  const existingRooms = await prisma.room.findMany({
    where: { camp_id: camp_id },
    select: {
      id: true,
      member_ids: true,
    },
  });

  return (
    <CampForm
      availableStudents={availableStudents}
      campInfo={campInfo}
      student={student}
      existingRooms={existingRooms}
    />
  );
};

const AboutCamp = async ({
  params,
}: {
  params: Promise<{ camp_id: string }>;
}) => {
  const cookieStore = await cookies();
  const studentData = cookieStore.get("token")?.value;

  let student: Student;

  // ถ้าไม่มีข้อมูลนักเรียนในคุกกี้ ให้กลับไปหน้า login
  if (!studentData) {
    redirect("/login");
  }

  try {
    student = JSON.parse(studentData);
  } catch (error) {
    console.error("Error parsing student data:", error);
    redirect("/login");
  }

  const { camp_id } = await params; // เปลี่ยนจาก id เป็น camp_id
  const idNum = parseInt(camp_id, 10);

  const campInfo = await prisma.camp.findMany({
    where: {
      id: idNum,
    },
  });

  return (
    <>
      <Navbar student={student} />
      <CampData camp_id={idNum} student={student} campInfo={campInfo} />
    </>
  );
};

export default AboutCamp;

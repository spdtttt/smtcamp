import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navbar from "./components/Navbar";
import CampList from "./components/CampList";
import getCamps from "@/function/getCamps";
import PastCamp from "./components/PastCampTable";
import { getPastCamps } from "@/function/getPastCamps";

interface Student {
  id: number;
  national_id: number;
  student_id: number;
  name: string | null;
  gender: string | null;
  class: number | null;
}

const page = async () => {
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

  const allcamps = await getCamps(student.class || 0, student.id);
  const pastCamps = await getPastCamps(student.class || 0);

  const upComingCamps = allcamps.filter((camp) => {
    return !pastCamps.some((pastCamp) => pastCamp.id === camp.id);
  });

  return (
    <>
      <Navbar student={student} />
      <CampList camps={upComingCamps} student={student} />
      <div className="mt-20 opacity-75 mb-25">
        <PastCamp pastCamps={pastCamps as any} />
      </div>
      <div className="flex flex-col mb-5 font-[Prompt] text-gray-500 font-medium text-center">
        <div className="bg-gray-300 w-[85%] self-center h-0.5"></div>
        <p className="mt-2">Created by Mos 6/9 Last Updated: 7 January 2026</p>
      </div>
    </>
  );
};
export default page;
"use client";
import Logo from "@/public/smt_logo.jpg";
import Image from "next/image";
import { LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const Navbar = ({ student }: any) => {
  const router = useRouter();

  async function deleteCookie() {
    Cookies.remove("token");
    router.push("/login");
  }

  return (
    <nav className="bg-blue-900 text-white sticky top-0 z-50 shadow-md font-[Prompt] mb-10">
      <div className="container mx-auto py-5 px-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Image
            src={Logo}
            alt="SMT Logo"
            width={45}
            height={45}
            className="rounded-full"
          />
          <span className="text-2xl font-semibold tracking-wide">
            SMT Camp Manage
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">{student.name}</p>
            <p className="text-xs text-blue-200">
              นักเรียนชั้น ม.
              {student.class === 409
                ? "4/9"
                : student.class === 509
                ? "5/9"
                : "6/9"}
            </p>
          </div>
          <button onClick={deleteCookie} className="group bg-blue-800 hover:bg-blue-700 cursor-pointer duration-300 px-5 py-3  rounded-lg text-sm transition">
            <LogOut className="group-hover:-translate-x-1 inline-block mr-2 h-4 w-4 duration-300" />
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;

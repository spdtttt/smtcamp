"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { User, CreditCard, LogIn } from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import axios from "axios";
import BeatLoader from "react-spinners/BeatLoader";

const LoginForm = () => {
  const [studentId, setStudentId] = useState(""); // รหัสนักเรียน
  const [nationalId, setNationalId] = useState(""); // เลขบัตรประชาชน
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  // ฟังก์ชันเข้าสู่ระบบ
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    setMessage("");
    setError("");

    try {
      const response = await axios.post("/api/login", {
        student_id: studentId,
        national_id: nationalId,
      });

      if (response.status === 200) {
        const student = response.data.student;

        // เก็บข้อมูลนักเรียนในคุกกี้
        Cookies.set("token", JSON.stringify(student), { expires: 1 });
        setMessage(response.data.message);
      }

      router.push("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        setError(message || "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      } else {
        console.error("Login failed:", error);
        setError("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-self-center">
        <BeatLoader color="#0a0a4f" />
      </div>
    );
  }

  return (
    <>
      {/* ส่วนแจ้งเตือนผลการเข้าสู่ระบบ */}
      {(message || error) && (
        <div className="-mt-4 mb-4">
          {message && (
            <div className="px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600">{message}</p>
            </div>
          )}
          {error && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="studentId"
            className="font-medium text-md text-gray-700"
          >
            เลขประจำตัวนักเรียน
          </Label>
          <div className="relative text-gray-700">
            <User className="text-gray-700 absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
            <input
              autoComplete="off"
              type="text"
              id="studentId"
              placeholder="เลขประจำตัวนักเรียน"
              maxLength={5}
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="pl-12 py-3 w-full border-gray-300 border-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="nationalId"
            className="font-medium text-md text-gray-700"
          >
            เลขบัตรประจำตัวประชาชน
          </Label>
          <div className="relative text-gray-700">
            <CreditCard className="text-gray-700 absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" />
            <input
              autoComplete="off"
              type="text"
              id="nationalId"
              placeholder="X-XXXX-XXXXX-XX-X"
              maxLength={13}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              className="pl-12 py-3 w-full border-gray-300 border-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          className="group w-full bg-blue-900 cursor-pointer justify-center items-center flex py-3 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          {/* ถ้ากำลังเข้าสู่ระบบ */}
          {isLoading ? (
            <span className="flex items-center text-white text-xl">
              กำลังเข้าสู่ระบบ...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-white text-xl">
              <LogIn className="group-hover:-translate-x-2 duration-300 w-5 h-5" />
              เข้าสู่ระบบ
            </span>
          )}
        </button>
      </form>
    </>
  );
};

export default LoginForm;

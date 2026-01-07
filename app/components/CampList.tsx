"use client";
import { Calendar, ArrowRight } from "lucide-react";
import { formatDateRange } from "@/function/formatDateRange";
import Link from "next/link";
import { useState } from "react";
import axios from "axios";

const CampList = ({ camps, student }: { camps: any; student: any }) => {
  const [loading, setLoading] = useState(false);

  const deleteRoom = async (studentId: number) => {
    setLoading(true);
    try {
      const response = await axios.delete(`/api/delete-room/${studentId}`);

      if (!response.data.success) {
        alert("ลบห้องพักไม่สำเร็จ อาจไม่มีห้องนี้อยู่อีกต่อไป");
        return;
      }

      window.location.reload();
    } catch (error) {
      console.log("Error from call API:", error);
      alert("เกิดข้อผิดพลาด ไม่สามารถลบได้");
      return;
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแสดงรูปแบบห้อง
  const formatRoomTypes = (roomTypes: any) => {
    if (!roomTypes) return "-";

    // ถ้าเป็น array ของ objects
    if (Array.isArray(roomTypes)) {
      return roomTypes
        .map((rt: any) => `${rt.peoplePerRoom} คน/ห้อง (${rt.roomCount} ห้อง)`)
        .join(", ");
    }

    // ถ้าเป็นค่าเดี่ยว (backward compatibility)
    return `${roomTypes} คน/ห้อง`;
  };

  return (
    <>
      <div className="container mx-auto px-4 font-[Prompt]">
        {/* Title */}
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-blue-500 pl-3">
            ค่ายและกิจกรรมที่เปิดให้บันทึก
          </h2>
        </div>

        {/* Camps Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {camps.length === 0 ? (
            <div className="col-span-full text-center py-3 text-gray-500">
              ไม่มีค่ายหรือกิจกรรมที่เปิดให้บันทึกในขณะนี้
            </div>
          ) : (
            camps.map((camp: any, index: number) => (
              <div
                key={camp.id}
                className="bg-white py-5 px-7 rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 leading-tight">
                    {camp.title}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    {/* Progress Bar */}
                    <div className="w-20 h-2.5 bg-gray-200 rounded-xl overflow-hidden">
                      <div
                        className="h-full bg-green-600 rounded-xl transition-all duration-300"
                        style={{ width: `${camp.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-green-600">{camp.percentage}%</p>
                  </div>
                </div>
                <div className="space-y-2 text-md text-gray-600">
                  <p className="flex text-center items-center gap-3">
                    <Calendar className="text-blue-500 w-5" />
                    {formatDateRange(camp.dateStart, camp.dateEnd)}
                  </p>
                  <p className="flex text-center items-center gap-3">
                    <i className="fa-solid fa-school text-red-500 w-5"></i>
                    ม.
                    {camp.class === 409
                      ? "4/9"
                      : camp.class === 509
                      ? "5/9"
                      : "6/9"}
                  </p>
                  <p className="flex text-center items-center gap-3">
                    <i className="fa-solid fa-user text-green-500 w-5"></i>
                    {formatRoomTypes(camp.roomTypes)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center">
                    ● เปิดให้บันทึก
                  </span>
                  <div className="flex gap-2">
                    {camp.isJoined === false ? (
                      <Link href={`/${camp.id}`}>
                        <button className="group flex gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-md font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/30">
                          บันทึกห้องพัก
                          <ArrowRight className="w-5 group-hover:translate-x-1 transition-all duration-300" />
                        </button>
                      </Link>
                    ) : (
                      <div className="flex gap-2  ">
                        <button
                          disabled={loading}
                          onClick={() => deleteRoom(student.id)}
                          className="disabled:opacity-50 group flex gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white text-md font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/30"
                        >
                          ลบห้องเดิม
                        </button>
                        <button
                          disabled={true}
                          className="flex gap-2 bg-gray-500 text-white text-md font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/30 cursor-not-allowed opacity-60"
                        >
                          บันทึกแล้ว
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
export default CampList;
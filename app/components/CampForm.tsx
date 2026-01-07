"use client";
import { Calendar } from "lucide-react";
import formatDateRange from "@/function/formatDateRange";
import Select from "react-select";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import axios from "axios";
import { useRouter } from "next/navigation";

const CampForm = ({ availableStudents, campInfo, student, existingRooms }: any) => {
  const [selectedRoomType, setSelectedRoomType] = useState<any>(null);
  const [selectedRoommates, setSelectedRoommates] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  // ฟังก์ชันคำนวณจำนวนห้องที่ใช้ไปแล้วสำหรับแต่ละรูปแบบ
  const calculateUsedRooms = (peoplePerRoom: number) => {
    if (!existingRooms || !Array.isArray(existingRooms)) return 0;

    // นับห้องที่มีจำนวนสมาชิกตรงกับ peoplePerRoom
    return existingRooms.filter(
      (room: any) => room.member_ids && room.member_ids.length === peoplePerRoom
    ).length;
  };

  // สร้าง options สำหรับเลือกรูปแบบห้อง
  const roomTypeOptions =
    campInfo[0]?.roomTypes && Array.isArray(campInfo[0].roomTypes)
      ? campInfo[0].roomTypes
          .map((rt: any, index: number) => {
            const usedRooms = calculateUsedRooms(rt.peoplePerRoom);
            const remainingRooms = rt.roomCount - usedRooms;

            return {
              value: index,
              label: `${rt.peoplePerRoom} คน/ห้อง (เหลือ ${remainingRooms} ห้อง)`,
              peoplePerRoom: rt.peoplePerRoom,
              roomCount: rt.roomCount,
              remainingRooms: remainingRooms,
              isDisabled: remainingRooms <= 0, // ปิดการเลือกถ้าห้องเต็ม
            };
          })
          .filter((option: any) => !option.isDisabled) // แสดงเฉพาะรูปแบบที่ยังมีห้องว่าง
      : [];

  // กรองรายชื่อนักเรียนให้เลือกได้เฉพาะเพศเดียวกัน และไม่นับผู้ที่ใช้งานหรือเข้าสู่ระบบอยู่
  const filteredStudents = availableStudents.filter((availableStudent: any) => {
    return (
      availableStudent.gender === student.gender &&
      availableStudent.id !== student.id
    );
  });

  // กรองให้อยู่ในรูปแบบเพื่อนำไปใช้ใน Select
  const studentOptions = filteredStudents.map((student: any) => ({
    value: student.id,
    label: `${student.name}`,
  }));

  // ฟังก์ชันกรอง options สำหรับแต่ละ Select (ไม่แสดงคนที่ถูกเลือกไปแล้ว)
  const getAvailableOptions = (currentIndex: number) => {
    const selectedIds = selectedRoommates
      .map((roommate, index) =>
        index !== currentIndex && roommate ? roommate.value : null
      )
      .filter((id) => id !== null);

    return studentOptions.filter(
      (option: any) => !selectedIds.includes(option.value)
    );
  };

  // ฟังก์ชันจัดการเมื่อเลือกรูปแบบห้อง
  const handleRoomTypeChange = (selectedOption: any) => {
    setSelectedRoomType(selectedOption);
    // Reset roommates เมื่อเปลี่ยนรูปแบบห้อง
    const requiredRoommates = selectedOption
      ? selectedOption.peoplePerRoom - 1
      : 0;
    setSelectedRoommates(Array(requiredRoommates).fill(null));
  };

  // ฟังก์ชันจัดการเมื่อเลือก roommate
  const handleRoommateChange = (selectedOption: any, index: number) => {
    const newSelectedRoommates = [...selectedRoommates];
    newSelectedRoommates[index] = selectedOption;
    setSelectedRoommates(newSelectedRoommates);
  };

  const resetOptions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setSelectedRoomType(null);
    setSelectedRoommates([]);
    setNote("");

    // รอให้ state อัพเดทเสร็จแล้วค่อย setLoading(false)
    setTimeout(() => {
      setLoading(false);
    }, 0);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ตรวจสอบว่าเลือกรูปแบบห้องแล้วหรือยัง
      if (!selectedRoomType) {
        setError("กรุณาเลือกรูปแบบห้อง");
        setLoading(false);
        return;
      }

      // แปลง selectedRoommates ให้เป็น array ของ id เท่านั้น (กรองค่า null ออก)
      const roommateIds = selectedRoommates
        .filter((roommate) => roommate !== null)
        .map((roommate) => roommate.value);

      // เช็คว่าเลือกครบหรือไม่
      const requiredRoommates = selectedRoomType.peoplePerRoom - 1;
      if (roommateIds.length < requiredRoommates) {
        setError(`กรุณาเลือกเพื่อนร่วมห้องให้ครบ ${requiredRoommates} คน`);
        setLoading(false);
        return;
      }

      // รวมผู้บันทึกกับ roommates ใน array เดียวกัน
      const allMembers = [student.id, ...roommateIds];

      // เรียก API
      const response = await axios.post("/api/submit-camp", {
        camp_id: campInfo[0]?.id,
        members: allMembers,
        note: note,
        roomTypeIndex: selectedRoomType.value, // ส่ง index ของรูปแบบห้องที่เลือก
      });

      // แสดงข้อความสำเร็จ
      alert("บันทึกห้องพักเรียบร้อย");

      // Reset form
      setSelectedRoomType(null);
      setSelectedRoommates([]);
      setNote("");
      router.push("/");
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแสดงรูปแบบห้องทั้งหมด
  const formatAllRoomTypes = (roomTypes: any) => {
    if (!roomTypes || !Array.isArray(roomTypes)) return "-";

    return roomTypes
      .map((rt: any) => {
        const usedRooms = calculateUsedRooms(rt.peoplePerRoom);
        const remainingRooms = rt.roomCount - usedRooms;
        return `${rt.peoplePerRoom} คน/ห้อง (เหลือ ${remainingRooms}/${rt.roomCount} ห้อง)`;
      })
      .join(", ");
  };

  return (
    <div className="container mx-auto px-4 font-[Prompt]">
      {/* Title */}
      <div className="sm:flex items-center mb-6 justify-between">
        <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-blue-500 pl-3">
          {campInfo[0]?.title}
        </h2>
        <div className="mt-2.5 sm:mt-0 w-fit bg-blue-500 px-4 py-2 font-semibold text-white rounded-xl">
          ม.{" "}
          {campInfo[0]?.class === 409
            ? "4/9"
            : campInfo[0]?.class === 509
            ? "5/9"
            : "6/9"}
        </div>
      </div>

      {error && (
        <Alert severity="error" className="mb-2">
          <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Details */}
      <div className="bg-white rounded-xl shadow border border-gray-100">
        <div className="p-5 space-y-8">
          <div className="text-black font-semibold text-xl mb-4">
            รายละเอียดกิจกรรม
          </div>
          <div className="pl-4">
            <div className="text-gray-600 font-semibold text-md flex gap-2.5 flex-col">
              <div className="sm:flex gap-3.5">
                <div className="flex gap-3 ">
                  <Calendar className="text-blue-500 w-5" />
                  <p>วันที่จัดกิจกรรม : </p>
                </div>
                {formatDateRange(campInfo[0]?.dateStart, campInfo[0]?.dateEnd)}
              </div>

              <div className="sm:flex gap-3.5">
                <div className="flex gap-3">
                  <i className="fa-solid fa-user text-green-500 w-5"></i>
                  <p>รูปแบบห้อง : </p>
                </div>
                {formatAllRoomTypes(campInfo[0]?.roomTypes)}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit}>
            <div className="text-xl font-semibold flex gap-5 mb-4">
              <div>
                <h3>ผู้บันทึก</h3>
              </div>
              <h3 className="text-gray-600 font-medium">{student.name}</h3>
            </div>

            {/* เลือกรูปแบบห้อง */}
            <div className="mb-7">
              <label className="block text-gray-700 font-semibold mb-2">
                เลือกรูปแบบห้อง <span className="text-red-500">*</span>
              </label>
              <Select
                instanceId="room-type-select"
                options={roomTypeOptions}
                value={selectedRoomType}
                onChange={handleRoomTypeChange}
                className="w-full"
                placeholder="กรุณาเลือกรูปแบบห้องก่อน..."
                isClearable
                isOptionDisabled={(option) => option.isDisabled}
                noOptionsMessage={() =>
                  roomTypeOptions.length === 0
                    ? "ไม่มีห้องว่าง (เต็มทุกรูปแบบ)"
                    : "ไม่พบตัวเลือก"
                }
              />
              {selectedRoomType && (
                <p className="text-sm text-gray-500 mt-2">
                  คุณเลือกห้องแบบ {selectedRoomType.peoplePerRoom} คน/ห้อง
                  (ต้องเลือกเพื่อนร่วมห้องอีก{" "}
                  {selectedRoomType.peoplePerRoom - 1} คน)
                </p>
              )}
              {roomTypeOptions.length === 0 && (
                <Alert severity="warning" className="mt-2">
                  <AlertTitle>แจ้งเตือน</AlertTitle>
                  ห้องเต็มทุกรูปแบบแล้ว ไม่สามารถบันทึกห้องพักได้
                </Alert>
              )}
            </div>

            {/* เลือกเพื่อนร่วมห้อง - แสดงเฉพาะเมื่อเลือกรูปแบบห้องแล้ว */}
            {selectedRoomType && (
              <div className="gap-2 flex flex-col mb-7">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  เลือกเพื่อนร่วมห้อง
                </h3>
                {Array.from(
                  { length: selectedRoomType.peoplePerRoom - 1 },
                  (_, i) => (
                    <div
                      key={`roommate-${i}`}
                      className="sm:flex gap-5 items-center"
                    >
                      <div className="text-gray-600 min-w-[250px]">
                        <h3>
                          เพื่อนร่วมห้อง (Roommate) คนที่ {i + 1} :{" "}
                          <span className="text-red-500">*</span>
                        </h3>
                      </div>
                      <Select
                        instanceId={`roommate-select-${i}`}
                        options={getAvailableOptions(i)}
                        value={selectedRoommates[i]}
                        onChange={(selectedOption) =>
                          handleRoommateChange(selectedOption, i)
                        }
                        className="w-full"
                        placeholder="เลือกเพื่อนร่วมห้อง..."
                        isClearable
                      />
                    </div>
                  )
                )}
              </div>
            )}

            {/* หมายเหตุ */}
            <div className="mb-7">
              <label
                htmlFor="note"
                className="block text-gray-700 font-semibold mb-2"
              >
                หมายเหตุ (Note)
              </label>
              <textarea
                autoComplete="off"
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="กรอกสิ่งที่ต้องการ (เช่น ขอห้องไม่ติดทางหนีไฟ ขอห้องชั้นไม่สูงมาก)"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* ปุ่มบันทึก/ล้างค่า */}
            <div className="flex gap-3 justify-center font-semibold">
              <button
                type="button"
                onClick={resetOptions}
                disabled={loading}
                className="disabled:opacity-50 hover:bg-gray-600 transition-colors duration-300 cursor-pointer text-white py-2 px-4 bg-gray-500 rounded-lg"
              >
                ล้างค่า
              </button>
              <button
                type="submit"
                disabled={loading || roomTypeOptions.length === 0}
                className="disabled:opacity-50 cursor-pointer text-white py-2 px-4 bg-blue-800 hover:bg-blue-600 transition-colors duration-300 rounded-lg"
              >
                {loading ? "กำลังบันทึก..." : "บันทึกห้องพัก"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CampForm;
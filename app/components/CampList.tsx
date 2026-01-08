"use client";
import { Calendar, ArrowRight } from "lucide-react";
import { formatDateRange } from "@/function/formatDateRange";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { BeatLoader } from 'react-spinners'

const ShowModal = ({ camp_id, isShowModal, setIsShowModal, student }: {
  camp_id: number | null,
  isShowModal: boolean,
  setIsShowModal: any,
  student: any,
}) => {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isShowModal && camp_id && student?.student_id) {
      fetchMembers();
    }
  }, [isShowModal, camp_id, student]);

  const fetchMembers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.post('/api/getMembersRoom', {
        camp_id: camp_id,
        student_id: student.id
      });

      if (Array.isArray(response.data)) {
        setMembers(response.data);
      } else {
        setError("ข้อมูลไม่ถูกต้อง");
      }
    } catch (err: any) {
      console.error("Error fetching members:", err);
      setError(err.response?.data?.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setIsShowModal(false);
    setMembers([]);
    setError("");
  };

  if (!isShowModal || !camp_id) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn font-[Prompt]"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all animate-scaleIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-800">รายชื่อรูมเมท</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Members List */}
          {!loading && !error && members.length > 0 && (
            <div className="space-y-3">
              {members.map((memberName, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${memberName === student.name
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {memberName}
                        {memberName === student.name && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                            คุณ
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <i className="fa-solid fa-users text-4xl mb-3 text-gray-300"></i>
              <p>ไม่พบข้อมูลสมาชิกในห้อง</p>
            </div>
          )}

          {/* Footer */}
          {!loading && members.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                จำนวนสมาชิกทั้งหมด: {members.length} คน
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ShowAvailableStudentsModal = ({ camp_id, isShowAvailable, setIsShowAvailable }: {
  camp_id: number | null,
  isShowAvailable: boolean,
  setIsShowAvailable: any
}) => {
  const [unAssignedStudents, setUnAssignedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isShowAvailable && camp_id) {
      fetchUnAssignedStudents();
    }
  }, [isShowAvailable, camp_id]);

  if (!isShowAvailable) return null;

  const fetchUnAssignedStudents = async () => {
    if (!camp_id) return;
    setLoading(true);
    try {
      const response = await axios.post('/api/getAvailableStudents', {
        camp_id: camp_id
      })

      setUnAssignedStudents(response.data?.availableStudents)
    } catch (err) {
      console.error('Error fetching unassigned students:', err);
    } finally {
      setLoading(false)
    }
  }

  const onClose = () => {
    setIsShowAvailable(false);
    setUnAssignedStudents([]);
  };
  return (
    <>
      <div
        className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl h-300 max-h-[80vh] shadow-2xl overflow-hidden transform transition-all flex flex-col animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-2xl font-semibold font-[Prompt]">
              รายชื่อนักเรียนที่ยังไม่ได้ลงบันทึกห้องพัก
            </h2>
            <div>
              <button
                onClick={async () => {
                  try {
                    const text = unAssignedStudents
                      .map((s: any) => s.name)
                      .join("\n");
                    await navigator.clipboard.writeText(text);
                    alert("คัดลอกเรียบร้อย");
                  } catch (e) {
                    // fallback
                    try {
                      const text = unAssignedStudents
                        .map((s: any) => s.name)
                        .join("\n");
                      const ta = document.createElement("textarea");
                      ta.value = text;
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand("copy");
                      document.body.removeChild(ta);
                      alert("คัดลอกเรียบร้อย");
                    } catch (err) {
                      alert("ไม่สามารถคัดลอกได้");
                    }
                  }
                }}
                className="cursor-pointer font-medium px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-[Prompt] transition-all duration-300"
              >
                คัดลอกทั้งหมด
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <BeatLoader color="#5a5c7e" size={18} />
              </div>
            ) : unAssignedStudents.length === 0 ? (
              <div className="text-gray-500 text-center py-10 font-[Prompt]">
                ไม่มีนักเรียนที่ยังไม่ได้ลงบันทึกห้องพัก
              </div>
            ) : (
              <div className="overflow-x-auto">
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="Rooms Table">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          align="center"
                          style={{
                            fontFamily: "Prompt",
                            width: "60px",
                            color: "#65758b",
                            fontWeight: "bold",
                            fontSize: "17px",
                          }}
                        >
                          ที่
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            fontFamily: "Prompt",
                            width: "150px",
                            color: "#65758b",
                            fontWeight: "bold",
                            fontSize: "17px",
                          }}
                        >
                          รหัสนักเรียน
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            fontFamily: "Prompt",
                            color: "#65758b",
                            fontWeight: "bold",
                            fontSize: "17px",
                            width: "300px",
                          }}
                        >
                          ชื่อ - สกุล
                        </TableCell>
                        <TableCell
                          align="center"
                          style={{
                            fontFamily: "Prompt",
                            color: "#65758b",
                            fontWeight: "bold",
                            fontSize: "17px",
                            width: "200px",
                          }}
                        >
                          เพศ
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {unAssignedStudents.map((student, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell
                            align="center"
                            style={{
                              fontFamily: "Prompt",
                              color: "#65758b",
                              fontSize: "15px",
                            }}
                            component="th"
                            scope="row"
                          >
                            {index + 1}
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              fontFamily: "Prompt",
                              color: "black",
                              fontSize: "15px",
                            }}
                          >
                            {student.student_id}
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              fontFamily: "Prompt",
                              color: "black",
                              fontSize: "15px",
                            }}
                          >
                            {student.name}
                          </TableCell>
                          <TableCell
                            align="center"
                            style={{
                              fontFamily: "Prompt",
                              color: "black",
                              fontSize: "15px",
                            }}
                          >
                            {student.gender === "male" ? "ชาย" : "หญิง"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )}
          </div>

          <div className="font-[Prompt] font-semibold px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const CampList = ({ camps, student }: { camps: any; student: any }) => {
  const [loading, setLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [selectedCampId, setSelectedCampId] = useState<number | null>(null);
  const [isShowAvailable, setIsShowAvailable] = useState(false);

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

  const formatRoomTypes = (roomTypes: any) => {
    if (!roomTypes) return "-";

    if (Array.isArray(roomTypes)) {
      return roomTypes
        .map((rt: any) => `${rt.peoplePerRoom} คน/ห้อง (${rt.roomCount} ห้อง)`)
        .join(", ");
    }

    return `${roomTypes} คน/ห้อง`;
  };

  const handleShowModal = (campId: number) => {
    setSelectedCampId(campId);
    setIsShowModal(true);
  };

  const handleShowAvailableModal = (campId: number) => {
    setSelectedCampId(campId);
    setIsShowAvailable(true);
  }

  return (
    <>
      <div className="container mx-auto px-4 font-[Prompt]">
        <div className="flex items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-blue-500 pl-3">
            ค่ายและกิจกรรมที่เปิดให้บันทึก
          </h2>
        </div>

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
                  {camp.isJoined === false ? (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center">
                      ● เปิดให้บันทึก
                    </span>
                  ) : student.student_id === 29258 ? (
                    <button
                      onClick={() => handleShowAvailableModal(camp.id)}
                      className="group flex gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/30">
                      ดูเพื่อนที่ยังไม่ลง
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full flex items-center">
                      ● บันทึกแล้ว
                    </span>
                  )}
                  <div className="flex gap-2">
                    {camp.isJoined === false ? (
                      <Link href={`/${camp.id}`}>
                        <button className="group flex gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-md font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/30">
                          บันทึกห้องพัก
                          <ArrowRight className="w-5 group-hover:translate-x-1 transition-all duration-300" />
                        </button>
                      </Link>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          disabled={loading}
                          onClick={() => deleteRoom(student.id)}
                          className="disabled:opacity-50 group flex gap-2 cursor-pointer bg-red-600 hover:bg-red-700 text-white text-md font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/30"
                        >
                          ลบห้องเดิม
                        </button>
                        <button
                          onClick={() => handleShowModal(camp.id)}
                          className="flex gap-2 bg-yellow-600 hover:bg-yellow-700 cursor-pointer text-white text-md font-medium px-4 py-2 rounded-lg transition shadow-lg shadow-blue-500/30"
                        >
                          ดูรูมเมท
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

      <ShowModal
        camp_id={selectedCampId}
        isShowModal={isShowModal}
        setIsShowModal={setIsShowModal}
        student={student}
      />

      <ShowAvailableStudentsModal
        camp_id={selectedCampId}
        isShowAvailable={isShowAvailable}
        setIsShowAvailable={setIsShowAvailable}
      />
    </>
  );
};
export default CampList;
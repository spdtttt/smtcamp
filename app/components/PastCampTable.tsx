"use client";
import formatDateRange from "@/function/formatDateRange";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";

interface Camp {
  id: number;
  title: string;
  class: number;
  dateStart: string;
  dateEnd: string;
}

const PastCamp = ({ pastCamps }: { pastCamps: Camp[] }) => {
  return (
    <div className="container flex flex-col items-start mb-6 font-[Prompt] mx-auto px-4">
      <h2 className="text-2xl font-bold text-gray-500 border-l-4 border-gray-300 pl-3 mb-4">
        ค่ายและกิจกรรมที่ผ่านมาแล้ว
      </h2>
      <Table
        aria-label="ตารางค่ายที่ผ่านมา"
        classNames={{
          table: "rounded-lg overflow-hidden w-full shadow-sm text-sm",
          th: "bg-gray-50 text-gray-500 font-medium p-2.5 pl-6 border-b",
          td: "bg-white p-4 pl-6 border-b text-gray-700",
        }}
      >
        <TableHeader>
          <TableColumn className="text-left" width="50%">
            ชื่อกิจกรรม
          </TableColumn>
          <TableColumn className="text-left" width="15%">
            ห้องเรียน
          </TableColumn>
          <TableColumn width="35%">วันที่จัด</TableColumn>
        </TableHeader>
        <TableBody>
          {pastCamps.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-5">
                <p className="text-gray-500 font-medium">ไม่มีค่ายที่ผ่านมา</p>
              </TableCell>
            </TableRow>
          ) : (
            pastCamps.map((camp) => (
              <TableRow key={camp.id}>
                <TableCell className="font-bold">{camp.title}</TableCell>
                <TableCell>
                  ม.
                  {camp.class === 409
                    ? "4/9"
                    : camp.class === 509
                    ? "5/9"
                    : "6/9"}
                </TableCell>
                <TableCell className="text-center">
                  {formatDateRange(camp.dateStart, camp.dateEnd)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PastCamp;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Student } from '../types';
import { Plus, Edit2, Trash2, Search, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import ConfirmModal from './ConfirmModal';

export default function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showTroubleshooter, setShowTroubleshooter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await axios.get('/api/db-status');
      setIsDemo(res.data.isDemo);
    } catch (err) {
      console.error(err);
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ Name: '', DateOfBirth: '', Class: '' });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Lỗi không xác định';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await axios.put(`/api/students/${editingStudent.StudentID}`, formData);
      } else {
        await axios.post('/api/students', formData);
      }
      setIsModalOpen(false);
      setEditingStudent(null);
      setFormData({ Name: '', DateOfBirth: '', Class: '' });
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    setStudentToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (studentToDelete === null) return;
    try {
      await axios.delete(`/api/students/${studentToDelete}`);
      fetchStudents();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.Class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý sinh viên</h1>
        <div className="flex gap-3">
          {isDemo && (
            <button 
              onClick={() => setShowTroubleshooter(true)}
              className="bg-amber-100 text-amber-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2 border border-amber-200 hover:bg-amber-200 transition"
            >
              <span className="animate-pulse text-amber-500">●</span> Chế độ Demo (Click để sửa lỗi kết nối)
            </button>
          )}
          <button 
            onClick={() => { setIsModalOpen(true); setEditingStudent(null); setFormData({ Name: '', DateOfBirth: '', Class: '' }); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <UserPlus size={20} /> Thêm sinh viên
          </button>
        </div>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Tìm kiếm theo tên hoặc lớp..." 
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex flex-col gap-2">
          <p className="font-semibold">Lỗi kết nối Database:</p>
          <p className="text-sm font-mono break-all">{error}</p>
          <p className="text-xs mt-2 italic">
            * Lưu ý: Nếu bạn đang dùng SQL Server tại máy cá nhân, Cloud App không thể kết nối trực tiếp tới 'localhost' hoặc tên máy tính của bạn.
          </p>
          <button 
            onClick={fetchStudents}
            className="mt-2 text-xs bg-red-100 hover:bg-red-200 px-3 py-1 rounded w-fit transition"
          >
            Thử lại
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-bottom">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Họ tên</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Ngày sinh</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Lớp</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Đang tải...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Không tìm thấy sinh viên nào</td></tr>
            ) : filteredStudents.map(student => (
              <tr key={student.StudentID} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-600">{student.StudentID}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{student.Name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {student.DateOfBirth ? format(new Date(student.DateOfBirth), 'dd/MM/yyyy') : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.Class}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { setEditingStudent(student); setFormData({ Name: student.Name, DateOfBirth: student.DateOfBirth.split('T')[0], Class: student.Class }); setIsModalOpen(true); }}
                    className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(student.StudentID)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingStudent ? 'Sửa sinh viên' : 'Thêm sinh viên mới'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                <input 
                  required
                  type="date" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.DateOfBirth}
                  onChange={(e) => setFormData({ ...formData, DateOfBirth: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lớp</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.Class}
                  onChange={(e) => setFormData({ ...formData, Class: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingStudent ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Xóa sinh viên"
        message="Bạn có chắc chắn muốn xóa sinh viên này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />

      {showTroubleshooter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-red-600">Tại sao không kết nối được SQL Server?</h2>
              <button onClick={() => setShowTroubleshooter(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <div className="space-y-6 text-gray-700">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="font-semibold text-red-800 mb-2">Nguyên nhân chính:</p>
                <p>Ứng dụng này đang chạy trên <strong>Cloud (Internet)</strong>, còn SQL Server của bạn đang ở <strong>Local (Máy tính cá nhân)</strong>. Cloud không thể nhìn thấy máy của bạn qua địa chỉ <code>localhost</code>.</p>
              </div>

              <div>
                <p className="font-bold mb-2">Cách 1: Chạy ứng dụng tại máy cá nhân (Khuyên dùng)</p>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Nhấn vào biểu tượng <strong>Settings (Bánh răng)</strong> ở góc trên bên phải màn hình này.</li>
                  <li>Chọn <strong>Export to ZIP</strong> để tải mã nguồn về máy.</li>
                  <li>Giải nén, mở Terminal tại thư mục đó và chạy:
                    <pre className="bg-gray-100 p-2 mt-1 rounded text-sm">npm install{"\n"}npm run dev</pre>
                  </li>
                  <li>Lúc này ứng dụng chạy tại máy bạn sẽ kết nối được tới <code>localhost</code>.</li>
                </ol>
              </div>

              <div>
                <p className="font-bold mb-2">Cách 2: Sử dụng Ngrok để "thông" cổng (Dành cho chuyên gia)</p>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Tải <strong>Ngrok</strong> về máy.</li>
                  <li>Chạy lệnh: <code className="bg-gray-100 px-1 rounded">ngrok tcp 1433</code>.</li>
                  <li>Ngrok sẽ cho bạn một địa chỉ (ví dụ: <code>0.tcp.ngrok.io:12345</code>).</li>
                  <li>Copy địa chỉ đó vào biến <code>DB_SERVER</code> và <code>DB_PORT</code> trong file <code>.env</code>.</li>
                </ol>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm">
                <p><strong>Mẹo:</strong> Bạn có thể tiếp tục dùng <strong>Chế độ Demo</strong> ngay tại đây để kiểm tra giao diện và tính năng mà không cần cài đặt gì thêm!</p>
              </div>
            </div>

            <button 
              onClick={() => setShowTroubleshooter(false)}
              className="mt-8 w-full py-3 bg-gray-800 text-white rounded-lg font-bold hover:bg-black transition"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Subject } from '../types';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function SubjectList() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ SubjectName: '' });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubject) {
        await axios.put(`/api/subjects/${editingSubject.SubjectID}`, formData);
      } else {
        await axios.post('/api/subjects', formData);
      }
      setIsModalOpen(false);
      setEditingSubject(null);
      setFormData({ SubjectName: '' });
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    setSubjectToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (subjectToDelete === null) return;
    try {
      await axios.delete(`/api/subjects/${subjectToDelete}`);
      fetchSubjects();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý môn học</h1>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingSubject(null); setFormData({ SubjectName: '' }); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
        >
          <Plus size={20} /> Thêm môn học
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden max-w-2xl">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-bottom">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">ID</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Tên môn học</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-10 text-gray-500">Đang tải...</td></tr>
            ) : subjects.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-10 text-gray-500">Chưa có môn học nào</td></tr>
            ) : subjects.map(subject => (
              <tr key={subject.SubjectID} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-600">{subject.SubjectID}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-800 flex items-center gap-2">
                  <BookOpen size={16} className="text-gray-400" /> {subject.SubjectName}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { setEditingSubject(subject); setFormData({ SubjectName: subject.SubjectName }); setIsModalOpen(true); }}
                    className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(subject.SubjectID)}
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
            <h2 className="text-xl font-bold mb-4">{editingSubject ? 'Sửa môn học' : 'Thêm môn học mới'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên môn học</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-2 border rounded-lg"
                  value={formData.SubjectName}
                  onChange={(e) => setFormData({ ...formData, SubjectName: e.target.value })}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingSubject ? 'Cập nhật' : 'Thêm mới'}
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
        title="Xóa môn học"
        message="Bạn có chắc chắn muốn xóa môn học này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />
    </div>
  );
}

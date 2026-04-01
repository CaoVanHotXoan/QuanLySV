import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Score, Student, Subject } from '../types';
import { Plus, Edit2, Trash2, Calculator, Filter } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function ScoreList() {
  const [scores, setScores] = useState<Score[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScore, setEditingScore] = useState<Score | null>(null);
  const [formData, setFormData] = useState({ StudentID: '', SubjectID: '', Score: '' });
  const [filterSubject, setFilterSubject] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [scoreToDelete, setScoreToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scoresRes, studentsRes, subjectsRes] = await Promise.all([
        axios.get('/api/scores'),
        axios.get('/api/students'),
        axios.get('/api/subjects')
      ]);
      setScores(scoresRes.data);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScore) {
        await axios.put(`/api/scores/${editingScore.ScoreID}`, { Score: parseFloat(formData.Score) });
      } else {
        await axios.post('/api/scores', {
          StudentID: parseInt(formData.StudentID),
          SubjectID: parseInt(formData.SubjectID),
          Score: parseFloat(formData.Score)
        });
      }
      setIsModalOpen(false);
      setEditingScore(null);
      setFormData({ StudentID: '', SubjectID: '', Score: '' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    setScoreToDelete(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (scoreToDelete === null) return;
    try {
      await axios.delete(`/api/scores/${scoreToDelete}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredScores = filterSubject 
    ? scores.filter(s => s.SubjectID === parseInt(filterSubject))
    : scores;

  const calculateAverage = () => {
    if (filteredScores.length === 0) return 0;
    const sum = filteredScores.reduce((acc, curr) => acc + curr.Score, 0);
    return (sum / filteredScores.length).toFixed(2);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý điểm số</h1>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingScore(null); setFormData({ StudentID: '', SubjectID: '', Score: '' }); }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition"
        >
          <Plus size={20} /> Nhập điểm
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
            <Calculator size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Điểm trung bình</p>
            <p className="text-2xl font-bold text-gray-800">{calculateAverage()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow md:col-span-2 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <Filter size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">Lọc theo môn học</p>
            <select 
              className="w-full p-2 border rounded-lg outline-none"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="">Tất cả môn học</option>
              {subjects.map(sub => (
                <option key={sub.SubjectID} value={sub.SubjectID}>{sub.SubjectName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-bottom">
            <tr>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Sinh viên</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Môn học</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600">Điểm</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">Đang tải...</td></tr>
            ) : filteredScores.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">Chưa có dữ liệu điểm</td></tr>
            ) : filteredScores.map(score => (
              <tr key={score.ScoreID} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{score.StudentName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{score.SubjectName}</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-600">{score.Score}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { setEditingScore(score); setFormData({ StudentID: score.StudentID.toString(), SubjectID: score.SubjectID.toString(), Score: score.Score.toString() }); setIsModalOpen(true); }}
                    className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(score.ScoreID)}
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
            <h2 className="text-xl font-bold mb-4">{editingScore ? 'Sửa điểm' : 'Nhập điểm mới'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingScore && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sinh viên</label>
                    <select 
                      required
                      className="w-full p-2 border rounded-lg"
                      value={formData.StudentID}
                      onChange={(e) => setFormData({ ...formData, StudentID: e.target.value })}
                    >
                      <option value="">Chọn sinh viên</option>
                      {students.map(s => (
                        <option key={s.StudentID} value={s.StudentID}>{s.Name} ({s.Class})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                    <select 
                      required
                      className="w-full p-2 border rounded-lg"
                      value={formData.SubjectID}
                      onChange={(e) => setFormData({ ...formData, SubjectID: e.target.value })}
                    >
                      <option value="">Chọn môn học</option>
                      {subjects.map(sub => (
                        <option key={sub.SubjectID} value={sub.SubjectID}>{sub.SubjectName}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {editingScore && (
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                  <p><strong>Sinh viên:</strong> {editingScore.StudentName}</p>
                  <p><strong>Môn học:</strong> {editingScore.SubjectName}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Điểm số (0-10)</label>
                <input 
                  required
                  type="number" 
                  step="0.1"
                  min="0"
                  max="10"
                  className="w-full p-2 border rounded-lg"
                  value={formData.Score}
                  onChange={(e) => setFormData({ ...formData, Score: e.target.value })}
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingScore ? 'Cập nhật' : 'Lưu điểm'}
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
        title="Xóa điểm số"
        message="Bạn có chắc chắn muốn xóa điểm số này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
      />
    </div>
  );
}

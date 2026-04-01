import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, BookOpen, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';

export default function Navbar({ onLogout }: { onLogout: () => void }) {
  return (
    <nav className="bg-white border-r w-64 h-screen fixed left-0 top-0 flex flex-col shadow-sm">
      <div className="p-6 flex items-center gap-3 border-bottom">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <GraduationCap size={24} />
        </div>
        <span className="font-bold text-xl text-gray-800">EduGrade</span>
      </div>

      <div className="flex-1 p-4 space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Users size={20} /> Sinh viên
        </NavLink>
        <NavLink 
          to="/subjects" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <BookOpen size={20} /> Môn học
        </NavLink>
        <NavLink 
          to="/scores" 
          className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <LayoutDashboard size={20} /> Quản lý điểm
        </NavLink>
      </div>

      <div className="p-4 border-t">
        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition"
        >
          <LogOut size={20} /> Đăng xuất
        </button>
      </div>
    </nav>
  );
}

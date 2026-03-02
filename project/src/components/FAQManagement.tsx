import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Navbar from './Navbar';

interface FAQCategory {
  id: string;
  name_zh: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  name_es: string;
  display_order: number;
  is_active: boolean;
}

interface FAQ {
  id: string;
  category_id: string | null;
  question_zh: string;
  question_en: string;
  question_fr: string;
  question_ar: string;
  question_es: string;
  answer_zh: string;
  answer_en: string;
  answer_fr: string;
  answer_ar: string;
  answer_es: string;
  display_order: number;
  is_active: boolean;
  category_name_zh?: string;
  category_name_en?: string;
}

export default function FAQManagement() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [activeTab, setActiveTab] = useState<'faqs' | 'categories'>('faqs');

  const [categoryForm, setCategoryForm] = useState({
    name_zh: '',
    name_en: '',
    name_fr: '',
    name_ar: '',
    name_es: '',
    display_order: 0,
  });

  const [faqForm, setFAQForm] = useState({
    category_id: '',
    question_zh: '',
    question_en: '',
    question_fr: '',
    question_ar: '',
    question_es: '',
    answer_zh: '',
    answer_en: '',
    answer_fr: '',
    answer_ar: '',
    answer_es: '',
    display_order: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchFAQs();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/faq/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchFAQs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/faq');
      const data = await response.json();
      setFAQs(data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/faq/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        fetchCategories();
        setShowCategoryModal(false);
        resetCategoryForm();
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/faq/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        fetchCategories();
        setShowCategoryModal(false);
        setEditingCategory(null);
        resetCategoryForm();
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/faq/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCreateFAQ = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(faqForm),
      });

      if (response.ok) {
        fetchFAQs();
        setShowFAQModal(false);
        resetFAQForm();
      }
    } catch (error) {
      console.error('Error creating FAQ:', error);
    }
  };

  const handleUpdateFAQ = async () => {
    if (!editingFAQ) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/faq/${editingFAQ.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(faqForm),
      });

      if (response.ok) {
        fetchFAQs();
        setShowFAQModal(false);
        setEditingFAQ(null);
        resetFAQForm();
      }
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!confirm('确定要删除这个FAQ吗?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/faq/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        fetchFAQs();
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    }
  };

  const openEditCategory = (category: FAQCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name_zh: category.name_zh,
      name_en: category.name_en,
      name_fr: category.name_fr,
      name_ar: category.name_ar,
      name_es: category.name_es,
      display_order: category.display_order,
    });
    setShowCategoryModal(true);
  };

  const openEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFAQForm({
      category_id: faq.category_id || '',
      question_zh: faq.question_zh,
      question_en: faq.question_en,
      question_fr: faq.question_fr,
      question_ar: faq.question_ar,
      question_es: faq.question_es,
      answer_zh: faq.answer_zh,
      answer_en: faq.answer_en,
      answer_fr: faq.answer_fr,
      answer_ar: faq.answer_ar,
      answer_es: faq.answer_es,
      display_order: faq.display_order,
    });
    setShowFAQModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name_zh: '',
      name_en: '',
      name_fr: '',
      name_ar: '',
      name_es: '',
      display_order: 0,
    });
  };

  const resetFAQForm = () => {
    setFAQForm({
      category_id: '',
      question_zh: '',
      question_en: '',
      question_fr: '',
      question_ar: '',
      question_es: '',
      answer_zh: '',
      answer_en: '',
      answer_fr: '',
      answer_ar: '',
      answer_es: '',
      display_order: 0,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">FAQ管理</h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            返回管理面板
          </button>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'faqs' ? 'border-blue-500 text-blue-500' : 'border-transparent'
              }`}
            >
              FAQ列表
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'categories' ? 'border-blue-500 text-blue-500' : 'border-transparent'
              }`}
            >
              分类管理
            </button>
          </div>
        </div>

        {activeTab === 'faqs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light">FAQ列表</h2>
              <button
                onClick={() => {
                  setEditingFAQ(null);
                  resetFAQForm();
                  setShowFAQModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus size={20} className="mr-2" />
                添加FAQ
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">问题(中文)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排序</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {faqs.map((faq) => (
                    <tr key={faq.id}>
                      <td className="px-6 py-4">{faq.question_zh}</td>
                      <td className="px-6 py-4">{faq.category_name_zh || '无分类'}</td>
                      <td className="px-6 py-4">{faq.display_order}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditFAQ(faq)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light">分类管理</h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  resetCategoryForm();
                  setShowCategoryModal(true);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus size={20} className="mr-2" />
                添加分类
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">中文名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">英文名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排序</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4">{category.name_zh}</td>
                      <td className="px-6 py-4">{category.name_en}</td>
                      <td className="px-6 py-4">{category.display_order}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditCategory(category)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light">{editingCategory ? '编辑分类' : '添加分类'}</h2>
              <button onClick={() => setShowCategoryModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">中文名称 *</label>
                <input
                  type="text"
                  value={categoryForm.name_zh}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_zh: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">英文名称 *</label>
                <input
                  type="text"
                  value={categoryForm.name_en}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">法语名称</label>
                <input
                  type="text"
                  value={categoryForm.name_fr}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_fr: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">阿拉伯语名称</label>
                <input
                  type="text"
                  value={categoryForm.name_ar}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_ar: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">西班牙语名称</label>
                <input
                  type="text"
                  value={categoryForm.name_es}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_es: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">排序</label>
                <input
                  type="number"
                  value={categoryForm.display_order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-6 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingCategory ? '更新' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFAQModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light">{editingFAQ ? '编辑FAQ' : '添加FAQ'}</h2>
              <button onClick={() => setShowFAQModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">分类</label>
                <select
                  value={faqForm.category_id}
                  onChange={(e) => setFAQForm({ ...faqForm, category_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded"
                >
                  <option value="">无分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_zh}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">问题 (中文) *</label>
                  <input
                    type="text"
                    value={faqForm.question_zh}
                    onChange={(e) => setFAQForm({ ...faqForm, question_zh: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">问题 (英文) *</label>
                  <input
                    type="text"
                    value={faqForm.question_en}
                    onChange={(e) => setFAQForm({ ...faqForm, question_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">问题 (法语)</label>
                  <input
                    type="text"
                    value={faqForm.question_fr}
                    onChange={(e) => setFAQForm({ ...faqForm, question_fr: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">问题 (阿拉伯语)</label>
                  <input
                    type="text"
                    value={faqForm.question_ar}
                    onChange={(e) => setFAQForm({ ...faqForm, question_ar: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">问题 (西班牙语)</label>
                  <input
                    type="text"
                    value={faqForm.question_es}
                    onChange={(e) => setFAQForm({ ...faqForm, question_es: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">答案 (中文) *</label>
                  <textarea
                    value={faqForm.answer_zh}
                    onChange={(e) => setFAQForm({ ...faqForm, answer_zh: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">答案 (英文) *</label>
                  <textarea
                    value={faqForm.answer_en}
                    onChange={(e) => setFAQForm({ ...faqForm, answer_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">答案 (法语)</label>
                  <textarea
                    value={faqForm.answer_fr}
                    onChange={(e) => setFAQForm({ ...faqForm, answer_fr: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">答案 (阿拉伯语)</label>
                  <textarea
                    value={faqForm.answer_ar}
                    onChange={(e) => setFAQForm({ ...faqForm, answer_ar: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">答案 (西班牙语)</label>
                  <textarea
                    value={faqForm.answer_es}
                    onChange={(e) => setFAQForm({ ...faqForm, answer_es: e.target.value })}
                    className="w-full px-4 py-2 border rounded"
                    rows={4}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">排序</label>
                <input
                  type="number"
                  value={faqForm.display_order}
                  onChange={(e) => setFAQForm({ ...faqForm, display_order: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => {
                    setShowFAQModal(false);
                    setEditingFAQ(null);
                  }}
                  className="px-6 py-2 border rounded hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={editingFAQ ? handleUpdateFAQ : handleCreateFAQ}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingFAQ ? '更新' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

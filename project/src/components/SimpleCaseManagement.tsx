import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Trash2, Plus, X } from 'lucide-react';

interface SimpleCase {
  id: string;
  before_image_url: string;
  after_image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export default function SimpleCaseManagement() {
  const [cases, setCases] = useState<SimpleCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCase, setNewCase] = useState({
    before_image_url: '',
    after_image_url: '',
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const data = await api.getAllSimpleCases();
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCase = async () => {
    try {
      await api.createSimpleCase(newCase);

      setShowAddModal(false);
      setNewCase({
        before_image_url: '',
        after_image_url: '',
        is_active: true,
        display_order: 0
      });
      fetchCases();
    } catch (error) {
      console.error('Error adding case:', error);
      alert('添加失败,请检查权限');
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (!confirm('确定要删除这个案例吗?')) return;

    try {
      await api.deleteSimpleCase(id);
      fetchCases();
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('删除失败,请检查权限');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.updateSimpleCase(id, { is_active: !currentStatus });
      fetchCases();
    } catch (error) {
      console.error('Error updating case:', error);
      alert('更新失败,请检查权限');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-light" style={{color: '#1F1F1F'}}>
          简单案例管理
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 text-white text-sm"
          style={{backgroundColor: '#1C2B3A'}}
        >
          <Plus size={18} />
          添加案例
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((caseItem) => (
          <div key={caseItem.id} className="border p-4" style={{borderColor: '#E5E7EB'}}>
            <div className="flex gap-2 mb-4">
              <div className="flex-1">
                <p className="text-xs mb-1" style={{color: '#6B7280'}}>术前</p>
                <img
                  src={caseItem.before_image_url}
                  alt="术前"
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs mb-1" style={{color: '#6B7280'}}>术后</p>
                <img
                  src={caseItem.after_image_url}
                  alt="术后"
                  className="w-full h-40 object-cover"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleToggleActive(caseItem.id, caseItem.is_active)}
                className="flex-1 px-3 py-1 text-xs border"
                style={{
                  backgroundColor: caseItem.is_active ? '#10B981' : '#EF4444',
                  color: 'white',
                  borderColor: caseItem.is_active ? '#10B981' : '#EF4444'
                }}
              >
                {caseItem.is_active ? '已激活' : '未激活'}
              </button>
              <button
                onClick={() => handleDeleteCase(caseItem.id)}
                className="px-3 py-1 text-xs border"
                style={{borderColor: '#EF4444', color: '#EF4444'}}
              >
                <Trash2 size={14} />
              </button>
            </div>
            <p className="text-xs mt-2" style={{color: '#6B7280'}}>
              排序: {caseItem.display_order}
            </p>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-light">添加简单案例</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">术前图片URL</label>
                <input
                  type="text"
                  value={newCase.before_image_url}
                  onChange={(e) => setNewCase({ ...newCase, before_image_url: e.target.value })}
                  className="w-full border px-3 py-2"
                  placeholder="/path/to/before-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">术后图片URL</label>
                <input
                  type="text"
                  value={newCase.after_image_url}
                  onChange={(e) => setNewCase({ ...newCase, after_image_url: e.target.value })}
                  className="w-full border px-3 py-2"
                  placeholder="/path/to/after-image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">显示顺序</label>
                <input
                  type="number"
                  value={newCase.display_order}
                  onChange={(e) => setNewCase({ ...newCase, display_order: parseInt(e.target.value) })}
                  className="w-full border px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCase.is_active}
                  onChange={(e) => setNewCase({ ...newCase, is_active: e.target.checked })}
                  id="is_active"
                />
                <label htmlFor="is_active" className="text-sm">激活显示</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAddCase}
                  className="flex-1 px-6 py-2 text-white"
                  style={{backgroundColor: '#1C2B3A'}}
                >
                  添加
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-2 border"
                  style={{borderColor: '#E5E7EB'}}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

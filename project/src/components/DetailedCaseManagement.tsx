import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Trash2, Plus, X } from 'lucide-react';

interface DetailedCase {
  id: string;
  surgery_name: string;
  before_image_url: string;
  after_image_url: string;
  before_features: Array<{ feature: string }>;
  after_features: Array<{ feature: string }>;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const categories = [
  { value: 'facial_contour', label: '面部轮廓' },
  { value: 'body_sculpting', label: '身体塑形' },
  { value: 'injection_lifting', label: '注射提升' },
  { value: 'dental', label: '牙科美容' },
  { value: 'hair_transplant', label: '植发' }
];

export default function DetailedCaseManagement() {
  const [cases, setCases] = useState<DetailedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCase, setNewCase] = useState({
    surgery_name: '',
    before_image_url: '',
    after_image_url: '',
    before_features: [{ feature: '' }],
    after_features: [{ feature: '' }],
    category: 'facial_contour',
    is_featured: false,
    is_active: true,
    display_order: 0
  });

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const data = await api.getAllDetailedCases();
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCase = async () => {
    try {
      const caseData = {
        ...newCase,
        before_features: newCase.before_features.filter(f => f.feature.trim() !== ''),
        after_features: newCase.after_features.filter(f => f.feature.trim() !== '')
      };

      await api.createDetailedCase(caseData);

      setShowAddModal(false);
      setNewCase({
        surgery_name: '',
        before_image_url: '',
        after_image_url: '',
        before_features: [{ feature: '' }],
        after_features: [{ feature: '' }],
        category: 'facial_contour',
        is_featured: false,
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
      await api.deleteDetailedCase(id);
      fetchCases();
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('删除失败,请检查权限');
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await api.updateDetailedCase(id, { is_active: !currentStatus });
      fetchCases();
    } catch (error) {
      console.error('Error updating case:', error);
      alert('更新失败,请检查权限');
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await api.updateDetailedCase(id, { is_featured: !currentStatus });
      fetchCases();
    } catch (error) {
      console.error('Error updating case:', error);
      alert('更新失败,请检查权限');
    }
  };

  const addFeature = (type: 'before' | 'after') => {
    if (type === 'before') {
      setNewCase({
        ...newCase,
        before_features: [...newCase.before_features, { feature: '' }]
      });
    } else {
      setNewCase({
        ...newCase,
        after_features: [...newCase.after_features, { feature: '' }]
      });
    }
  };

  const removeFeature = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      const features = newCase.before_features.filter((_, i) => i !== index);
      setNewCase({ ...newCase, before_features: features });
    } else {
      const features = newCase.after_features.filter((_, i) => i !== index);
      setNewCase({ ...newCase, after_features: features });
    }
  };

  const updateFeature = (type: 'before' | 'after', index: number, value: string) => {
    if (type === 'before') {
      const features = [...newCase.before_features];
      features[index].feature = value;
      setNewCase({ ...newCase, before_features: features });
    } else {
      const features = [...newCase.after_features];
      features[index].feature = value;
      setNewCase({ ...newCase, after_features: features });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-light" style={{color: '#1F1F1F'}}>
          详细案例管理
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

      <div className="space-y-6">
        {cases.map((caseItem) => (
          <div key={caseItem.id} className="border p-6" style={{borderColor: '#E5E7EB'}}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">{caseItem.surgery_name}</h3>
                <p className="text-sm mb-2" style={{color: '#6B7280'}}>
                  分类: {categories.find(c => c.value === caseItem.category)?.label}
                </p>
                <div className="flex gap-2 mb-4">
                  <div className="flex-1">
                    <p className="text-xs mb-1">术前</p>
                    <img src={caseItem.before_image_url} alt="术前" className="w-full h-32 object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs mb-1">术后</p>
                    <img src={caseItem.after_image_url} alt="术后" className="w-full h-32 object-cover" />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">术前特征:</p>
                  <ul className="text-xs space-y-1" style={{color: '#6B7280'}}>
                    {caseItem.before_features.map((f, i) => (
                      <li key={i}>• {f.feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1">术后特征:</p>
                  <ul className="text-xs space-y-1" style={{color: '#6B7280'}}>
                    {caseItem.after_features.map((f, i) => (
                      <li key={i}>• {f.feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(caseItem.id, caseItem.is_active)}
                    className="px-3 py-1 text-xs"
                    style={{
                      backgroundColor: caseItem.is_active ? '#10B981' : '#EF4444',
                      color: 'white'
                    }}
                  >
                    {caseItem.is_active ? '已激活' : '未激活'}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(caseItem.id, caseItem.is_featured)}
                    className="px-3 py-1 text-xs"
                    style={{
                      backgroundColor: caseItem.is_featured ? '#F59E0B' : '#9CA3AF',
                      color: 'white'
                    }}
                  >
                    {caseItem.is_featured ? '精选' : '非精选'}
                  </button>
                  <button
                    onClick={() => handleDeleteCase(caseItem.id)}
                    className="px-3 py-1 text-xs border"
                    style={{borderColor: '#EF4444', color: '#EF4444'}}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-light">添加详细案例</h3>
              <button onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2">手术名称</label>
                <input
                  type="text"
                  value={newCase.surgery_name}
                  onChange={(e) => setNewCase({ ...newCase, surgery_name: e.target.value })}
                  className="w-full border px-3 py-2"
                  placeholder="例如: 面部轮廓综合手术"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">术前图片URL</label>
                  <input
                    type="text"
                    value={newCase.before_image_url}
                    onChange={(e) => setNewCase({ ...newCase, before_image_url: e.target.value })}
                    className="w-full border px-3 py-2"
                    placeholder="/path/to/before.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">术后图片URL</label>
                  <input
                    type="text"
                    value={newCase.after_image_url}
                    onChange={(e) => setNewCase({ ...newCase, after_image_url: e.target.value })}
                    className="w-full border px-3 py-2"
                    placeholder="/path/to/after.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">分类</label>
                <select
                  value={newCase.category}
                  onChange={(e) => setNewCase({ ...newCase, category: e.target.value })}
                  className="w-full border px-3 py-2"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm">术前特征</label>
                  <button
                    onClick={() => addFeature('before')}
                    className="text-xs px-2 py-1 border"
                    style={{borderColor: '#1C2B3A', color: '#1C2B3A'}}
                  >
                    + 添加特征
                  </button>
                </div>
                <div className="space-y-2">
                  {newCase.before_features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature.feature}
                        onChange={(e) => updateFeature('before', index, e.target.value)}
                        className="flex-1 border px-3 py-2 text-sm"
                        placeholder="输入特征描述"
                      />
                      {newCase.before_features.length > 1 && (
                        <button
                          onClick={() => removeFeature('before', index)}
                          className="px-2 border"
                          style={{borderColor: '#EF4444', color: '#EF4444'}}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm">术后特征</label>
                  <button
                    onClick={() => addFeature('after')}
                    className="text-xs px-2 py-1 border"
                    style={{borderColor: '#1C2B3A', color: '#1C2B3A'}}
                  >
                    + 添加特征
                  </button>
                </div>
                <div className="space-y-2">
                  {newCase.after_features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature.feature}
                        onChange={(e) => updateFeature('after', index, e.target.value)}
                        className="flex-1 border px-3 py-2 text-sm"
                        placeholder="输入特征描述"
                      />
                      {newCase.after_features.length > 1 && (
                        <button
                          onClick={() => removeFeature('after', index)}
                          className="px-2 border"
                          style={{borderColor: '#EF4444', color: '#EF4444'}}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">显示顺序</label>
                  <input
                    type="number"
                    value={newCase.display_order}
                    onChange={(e) => setNewCase({ ...newCase, display_order: parseInt(e.target.value) })}
                    className="w-full border px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newCase.is_active}
                    onChange={(e) => setNewCase({ ...newCase, is_active: e.target.checked })}
                    id="is_active_detailed"
                  />
                  <label htmlFor="is_active_detailed" className="text-sm">激活显示</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newCase.is_featured}
                    onChange={(e) => setNewCase({ ...newCase, is_featured: e.target.checked })}
                    id="is_featured"
                  />
                  <label htmlFor="is_featured" className="text-sm">设为精选</label>
                </div>
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

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import Navbar from './Navbar';
import Footer from './Footer';
import ImageCompareSlider from './ImageCompareSlider';
import CTASection from './CTASection';
import { useLanguage } from '../contexts/LanguageContext';

interface DetailedCase {
  id: string;
  surgery_name: string;
  category: string;
  before_image_url: string;
  after_image_url: string;
  before_features: Array<{ feature: string }>;
  after_features: Array<{ feature: string }>;
  is_featured: boolean;
  created_at: string;
}

const categoryMap: Record<string, string> = {
  'facial_contour': '面部轮廓',
  'body_sculpting': '身体塑形',
  'injection_lifting': '注射提升',
  'dental': '牙科美容',
  'hair_transplant': '植发'
};

const categoryMapReverse: Record<string, string> = {
  '面部轮廓': 'facial_contour',
  '身体塑形': 'body_sculpting',
  '注射提升': 'injection_lifting',
  '牙科美容': 'dental',
  '植发': 'hair_transplant'
};

function CasesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [cases, setCases] = useState<DetailedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');

  const categories = ['全部', '面部轮廓', '身体塑形', '注射提升', '植发', '牙科美容'];

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await api.getDetailedCases();
      setCases(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = selectedCategory === '全部'
    ? cases
    : cases.filter(c => c.category === categoryMapReverse[selectedCategory]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-20 px-6 md:px-12 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-light mb-6 tracking-wide" style={{color: '#1F1F1F'}}>
              {t('cases.title')}
            </h1>
            <p className="text-base md:text-lg tracking-wide mb-8" style={{color: '#6B7280'}}>
              {t('cases.subtitle')}
            </p>
            <button
              onClick={() => navigate('/booking')}
              className="px-10 py-3 text-white text-sm transition tracking-wider"
              style={{backgroundColor: '#1C2B3A'}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#101D29'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2B3A'}
            >
              预约咨询
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className="px-6 py-2 text-sm transition-all duration-300 border"
                style={{
                  color: selectedCategory === category ? 'white' : '#1F1F1F',
                  backgroundColor: selectedCategory === category ? '#1C2B3A' : 'white',
                  borderColor: selectedCategory === category ? '#1C2B3A' : '#E5E7EB'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = '#1C2B3A';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600">加载中...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg mb-8" style={{color: '#6B7280'}}>暂无案例</p>
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 text-white text-sm transition"
                style={{backgroundColor: '#1C2B3A'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#101D29'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C2B3A'}
              >
                返回首页
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {filteredCases.map((caseItem, index) => (
                <div key={caseItem.id} className="bg-white border" style={{borderColor: '#E5E7EB'}}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="p-6 md:p-8 min-h-[500px] md:min-h-[600px] flex items-center">
                      <ImageCompareSlider
                        beforeImage={caseItem.before_image_url}
                        afterImage={caseItem.after_image_url}
                        altBefore={`${caseItem.surgery_name} - 术前`}
                        altAfter={`${caseItem.surgery_name} - 术后`}
                      />
                    </div>

                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="mb-4">
                        <span
                          className="inline-block px-4 py-1 text-xs font-light tracking-wider"
                          style={{backgroundColor: '#1C2B3A', color: 'white'}}
                        >
                          {categoryMap[caseItem.category]}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-light mb-4" style={{color: '#1F1F1F'}}>
                        案例 {String(index + 1).padStart(2, '0')}
                      </h3>
                      <h4 className="text-lg md:text-xl font-normal mb-6" style={{color: '#1F1F1F'}}>
                        {caseItem.surgery_name}
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-sm font-medium mb-3" style={{color: '#1F1F1F'}}>术前特征</p>
                          <ul className="space-y-2">
                            {caseItem.before_features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm" style={{color: '#6B7280'}}>
                                <span className="mt-1">•</span>
                                <span>{f.feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-3" style={{color: '#1F1F1F'}}>术后特征</p>
                          <ul className="space-y-2">
                            {caseItem.after_features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm" style={{color: '#6B7280'}}>
                                <span className="mt-1">•</span>
                                <span>{f.feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {caseItem.is_featured && (
                        <div className="mt-4">
                          <span className="inline-block px-3 py-1 text-xs" style={{backgroundColor: '#FEF3C7', color: '#92400E'}}>
                            精选案例
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />

      <Footer />
    </div>
  );
}

export default CasesPage;

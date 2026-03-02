import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQCategory {
  id: string;
  name_zh: string;
  name_en: string;
  name_fr: string;
  name_ar: string;
  name_es: string;
}

interface FAQItem {
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
  category_name_zh?: string;
  category_name_en?: string;
  category_name_fr?: string;
  category_name_ar?: string;
  category_name_es?: string;
}

export default function FAQPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, faqsRes] = await Promise.all([
        fetch('http://localhost:3001/api/faq/categories'),
        fetch('http://localhost:3001/api/faq')
      ]);

      const categoriesData = await categoriesRes.json();
      const faqsData = await faqsRes.json();

      setCategories(categoriesData);
      setFaqs(faqsData);
    } catch (error) {
      console.error('Error fetching FAQ data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category: FAQCategory) => {
    switch (language) {
      case 'zh': return category.name_zh;
      case 'en': return category.name_en;
      case 'fr': return category.name_fr;
      case 'ar': return category.name_ar;
      case 'es': return category.name_es;
      default: return category.name_zh;
    }
  };

  const getQuestion = (faq: FAQItem) => {
    switch (language) {
      case 'zh': return faq.question_zh;
      case 'en': return faq.question_en;
      case 'fr': return faq.question_fr;
      case 'ar': return faq.question_ar;
      case 'es': return faq.question_es;
      default: return faq.question_zh;
    }
  };

  const getAnswer = (faq: FAQItem) => {
    switch (language) {
      case 'zh': return faq.answer_zh;
      case 'en': return faq.answer_en;
      case 'fr': return faq.answer_fr;
      case 'ar': return faq.answer_ar;
      case 'es': return faq.answer_es;
      default: return faq.answer_zh;
    }
  };

  const filteredFAQs = selectedCategoryId === 'all'
    ? faqs
    : faqs.filter(faq => faq.category_id === selectedCategoryId);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-6 md:px-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-light mb-4 tracking-wide" style={{color: '#1F1F1F'}}>
            {t('faq.title')}
          </h1>
          <p className="text-base md:text-lg tracking-wide" style={{color: '#6B7280'}}>
            {t('faq.subtitle')}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 py-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedCategoryId === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedCategoryId === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              暂无FAQ内容
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-left font-medium text-gray-900">
                      {getQuestion(faq)}
                    </h3>
                    {openIndex === index ? (
                      <ChevronUp className="flex-shrink-0 ml-4 text-blue-600" size={24} />
                    ) : (
                      <ChevronDown className="flex-shrink-0 ml-4 text-gray-400" size={24} />
                    )}
                  </button>
                  {openIndex === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {getAnswer(faq)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-6 md:px-12 py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-4" style={{color: '#1F1F1F'}}>
            还有其他问题？
          </h2>
          <p className="text-gray-600 mb-8">
            联系我们获取更多信息
          </p>
          <button
            onClick={() => navigate('/booking')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即咨询
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

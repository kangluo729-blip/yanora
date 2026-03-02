import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import Navbar from './Navbar';
import Footer from './Footer';
import ImageCompareSlider from './ImageCompareSlider';
import CTASection from './CTASection';
import { useLanguage } from '../contexts/LanguageContext';

function FacialContourPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeFeature, setActiveFeature] = useState<'nose' | 'eyes' | 'lips'>('nose');
  const [caseStudies, setCaseStudies] = useState<any[]>([]);

  const noseTypes = [
    { id: 1, name: '微翘鼻', description: '柔和甜美', image: '/micro_upturned_nose/b2b5b16dac1c3a8548d76a8e65d9cf2c.png' },
    { id: 2, name: '精致鼻型', description: '立体优雅', image: '/facial_contour/facial_features_refinement/nose/cf501e8337c6c7f69a7dcca699ac2169_nose_refinement.jpg' },
  ];

  const eyeTypes = [
    { id: 1, name: '开扇双眼皮', description: '妩媚动人', image: '/e7e3dea04d581a82271b810ab7b33eab.jpg' },
    { id: 2, name: '平行双眼皮', description: '清纯自然', image: '/5ceb11519ac27ce1cd3ec0b5b6612e9d.jpg' },
    { id: 3, name: '新月型', description: '甜美温柔', image: '/e10862d0ad29bb40d6ffda2f5782db49.jpg' },
  ];

  const lipTypes = [
    { id: 1, name: 'M唇', description: '性感迷人', image: '/mouth_facial_features/Gemini_Generated_Image_wo4l20wo4l20wo4l_(1).png' },
    { id: 2, name: '微笑唇', description: '亲和友善', image: '/mouth_facial_features/Gemini_Generated_Image_b6lk02b6lk02b6lk.png' },
  ];

  const getCurrentTypes = () => {
    switch (activeFeature) {
      case 'nose': return noseTypes;
      case 'eyes': return eyeTypes;
      case 'lips': return lipTypes;
      default: return noseTypes;
    }
  };

  useEffect(() => {
    const fetchFeaturedCases = async () => {
      try {
        const data = await api.getDetailedCases('facial_contour');
        const featuredCases = data
          .filter((item: any) => item.is_featured && item.is_active)
          .slice(0, 2);

        const formattedCases = featuredCases.map(item => ({
          id: item.id,
          title: item.surgery_name,
          category: '面部塑形',
          beforeImage: item.before_image_url,
          afterImage: item.after_image_url,
          description: item.after_features.map((f: any) => f.feature).join('，')
        }));

        setCaseStudies(formattedCases);
      } catch (error) {
        console.error('Error fetching featured cases:', error);
      }
    };

    fetchFeaturedCases();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section - Core Value Statement */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-white md:bg-[#FAFAFA]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-light mb-6 leading-relaxed tracking-wide" style={{color: '#1F1F1F'}}>
            {t('facialContour.title')}
          </h1>
          <p className="text-sm md:text-base font-light leading-relaxed mb-8 max-w-2xl mx-auto" style={{color: '#4B5563'}}>
            {t('facialContour.subtitle')}
          </p>
          <button
            onClick={() => navigate('/booking')}
            className="px-8 py-3 text-sm md:text-base font-light tracking-wide transition-all duration-300 hover:opacity-80"
            style={{
              backgroundColor: '#1C2B3A',
              color: '#FFFFFF'
            }}
          >
            {t('facialContour.exploreNow')}
          </button>
        </div>
      </section>

      {/* Facial Contour Section - Bone & Soft Tissue */}
      <section id="facial-contour-section" className="py-20 md:py-28 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <div className="flex justify-center mb-16">
              <div className="w-full md:w-3/4 lg:w-3/5 relative bg-white p-8">
                <img
                  src="/Gemini_Generated_Image_qvpx6jqvpx6jqvpx.png"
                  alt="面部轮廓示例"
                  className="w-full h-auto object-contain"
                  style={{
                    filter: 'brightness(1.1)',
                    mixBlendMode: 'multiply'
                  }}
                />

                {/* 额头标注 - 左侧 */}
                <div className="absolute" style={{top: '18%', left: '10%'}}>
                  <div className="relative">
                    {/* 点 - 桌面端显示 */}
                    <div className="hidden md:block absolute w-2.5 h-2.5 bg-white border-2 rounded-full" style={{borderColor: '#1C2B3A', left: '-5px', top: '-5px'}}></div>
                    {/* 线条 - 桌面端显示 */}
                    <div className="hidden md:block absolute w-20 h-0.5" style={{backgroundColor: '#1C2B3A', top: '-1px', right: '0'}}></div>
                    {/* 浮动文字框 - 桌面端 */}
                    <div
                      className="hidden md:block absolute px-4 py-2 bg-white border shadow-lg"
                      style={{
                        borderColor: '#1C2B3A',
                        right: '84px',
                        top: '-16px',
                        minWidth: '80px',
                        animation: 'floatUpDown 3s ease-in-out infinite'
                      }}
                    >
                      <p className="text-sm font-light whitespace-nowrap" style={{color: '#1F1F1F'}}>额头</p>
                    </div>
                    {/* 移动端标签 */}
                    <div
                      className="md:hidden px-2 py-1 bg-white border shadow-lg"
                      style={{
                        borderColor: '#1C2B3A',
                        transform: 'translate(-100%, -50%)',
                        animation: 'floatUpDown 3s ease-in-out infinite'
                      }}
                    >
                      <p className="text-xs font-light whitespace-nowrap" style={{color: '#1F1F1F'}}>额头</p>
                    </div>
                  </div>
                </div>

                {/* 颧骨标注 - 右侧 */}
                <div className="absolute" style={{top: '31%', right: '8%'}}>
                  <div className="relative">
                    {/* 点 - 桌面端显示 */}
                    <div className="hidden md:block absolute w-2.5 h-2.5 bg-white border-2 rounded-full" style={{borderColor: '#1C2B3A', right: '-5px', top: '-5px'}}></div>
                    {/* 线条 - 桌面端显示 */}
                    <div className="hidden md:block absolute w-20 h-0.5" style={{backgroundColor: '#1C2B3A', top: '-1px', left: '0'}}></div>
                    {/* 浮动文字框 - 桌面端 */}
                    <div
                      className="hidden md:block absolute px-4 py-2 bg-white border shadow-lg"
                      style={{
                        borderColor: '#1C2B3A',
                        left: '84px',
                        top: '-16px',
                        minWidth: '80px',
                        animation: 'floatUpDown 3s ease-in-out infinite 0.5s'
                      }}
                    >
                      <p className="text-sm font-light whitespace-nowrap" style={{color: '#1F1F1F'}}>颧骨</p>
                    </div>
                    {/* 移动端标签 */}
                    <div
                      className="md:hidden px-2 py-1 bg-white border shadow-lg"
                      style={{
                        borderColor: '#1C2B3A',
                        transform: 'translate(0%, -50%)',
                        animation: 'floatUpDown 3s ease-in-out infinite 0.5s'
                      }}
                    >
                      <p className="text-xs font-light whitespace-nowrap" style={{color: '#1F1F1F'}}>颧骨</p>
                    </div>
                  </div>
                </div>

                {/* 下巴标注 - 左侧 */}
                <div className="absolute" style={{top: '56%', left: '9%'}}>
                  <div className="relative">
                    {/* 点 - 桌面端显示 */}
                    <div className="hidden md:block absolute w-2.5 h-2.5 bg-white border-2 rounded-full" style={{borderColor: '#1C2B3A', left: '-5px', top: '-5px'}}></div>
                    {/* 线条 - 桌面端显示 */}
                    <div className="hidden md:block absolute w-20 h-0.5" style={{backgroundColor: '#1C2B3A', top: '-1px', right: '0'}}></div>
                    {/* 浮动文字框 - 桌面端 */}
                    <div
                      className="hidden md:block absolute px-4 py-2 bg-white border shadow-lg"
                      style={{
                        borderColor: '#1C2B3A',
                        right: '84px',
                        top: '-16px',
                        minWidth: '90px',
                        animation: 'floatUpDown 3s ease-in-out infinite 1s'
                      }}
                    >
                      <p className="text-sm font-light whitespace-nowrap" style={{color: '#1F1F1F'}}>下巴</p>
                    </div>
                    {/* 移动端标签 */}
                    <div
                      className="md:hidden px-2 py-1 bg-white border shadow-lg"
                      style={{
                        borderColor: '#1C2B3A',
                        transform: 'translate(-100%, -50%)',
                        animation: 'floatUpDown 3s ease-in-out infinite 1s'
                      }}
                    >
                      <p className="text-xs font-light whitespace-nowrap" style={{color: '#1F1F1F'}}>下巴</p>
                    </div>
                  </div>
                </div>

                {/* 下颌线标注 - 右侧 */}
                <div className="absolute" style={{top: '50%', right: '8%'}}>
                  <div className="relative">
                    {/* 点 - 桌面端显示 */}
                    <div className="hidden md:block absolute w-2.5 h-2.5 bg-white border-2 rounded-full" style={{borderColor: '#1C2B3A', right: '-5px', top: '-5px'}}></div>
                    {/* 线条 - 桌面端显示 */}
                    <div className="hidden md:block absolute w-20 h-0.5" style={{backgroundColor: '#1C2B3A', top: '-1px', left: '0'}}></div>
                    {/* 浮动文字框 - 桌面端 */}
                    <div
                      className="hidden md:block absolute px-4 py-2 bg-white border shadow-lg"
                      style={{
                        borderColor: '#1C2B3A',
                        left: '84px',
                        top: '-16px',
                        minWidth: '80px',
                        animation: 'floatUpDown 3s ease-in-out infinite 1.5s'
                      }}
                    >
                      <p className="text-sm font-light whitespace-nowrap" style={{color: '#1F1F1F'}}>下颌线</p>
                    </div>
                    {/* 移动端标签 */}
                    <div
                      className="md:hidden px-2 py-1 bg-white border shadow-lg"
                      style={{
                        borderColor: '#1C2B3A',
                        transform: 'translate(0%, -50%)',
                        animation: 'floatUpDown 3s ease-in-out infinite 1.5s'
                      }}
                    >
                      <p className="text-xs font-light whitespace-nowrap" style={{color: '#1F1F1F'}}>下颌线</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: '□', title: '额头/眉骨', subtitle: '丰额头、眉弓抬高', image: '/forehead-browbone.jpg' },
              { icon: '□', title: '颧骨', subtitle: '颧骨内推/降低', image: '/cheekbone.jpg' },
              { icon: '□', title: '下颌线', subtitle: '下颌角截骨、去咬肌', image: '/jawline.jpg' },
              { icon: '□', title: '下巴', subtitle: '颏成型、假体隆颏', image: '/chin.jpg' },
            ].map((item, index) => (
              <div
                key={index}
                className="border transition-all duration-300 overflow-hidden"
                style={{borderColor: '#E5E7EB'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1C2B3A';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {item.image ? (
                  <div className="w-full aspect-square overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-5xl" style={{color: '#1C2B3A'}}>
                    {item.icon}
                  </div>
                )}
                <div className="text-center p-6 md:p-8">
                  <h3 className="text-base md:text-lg font-normal mb-2" style={{color: '#1F1F1F'}}>
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm font-light" style={{color: '#6B7280'}}>
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facial Features Section */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-white md:bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-2xl md:text-3xl font-light mb-4 tracking-wide" style={{color: '#1F1F1F'}}>
              五官精雕板块
            </h2>
            <p className="text-sm md:text-base font-light" style={{color: '#6B7280'}}>
              聚焦于五官局部的精细化调整
            </p>
          </div>

          {/* Feature Tabs */}
          <div className="flex flex-wrap gap-3 md:gap-4 mb-12 justify-center">
            {[
              { key: 'nose' as const, label: '鼻子' },
              { key: 'eyes' as const, label: '眼睛' },
              { key: 'lips' as const, label: '嘴巴' },
            ].map((feature) => (
              <button
                key={feature.key}
                onClick={() => setActiveFeature(feature.key)}
                className="px-8 md:px-10 py-3 md:py-4 text-sm md:text-base transition-all duration-300 border"
                style={{
                  backgroundColor: activeFeature === feature.key ? '#1C2B3A' : 'white',
                  color: activeFeature === feature.key ? 'white' : '#6B7280',
                  borderColor: activeFeature === feature.key ? '#1C2B3A' : '#D1D5DB',
                }}
                onMouseEnter={(e) => {
                  if (activeFeature !== feature.key) {
                    e.currentTarget.style.borderColor = '#1C2B3A';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFeature !== feature.key) {
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
              >
                {feature.label}
              </button>
            ))}
          </div>

          {/* Feature Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getCurrentTypes().map((type) => (
              <div
                key={type.id}
                className="bg-white border transition-all duration-300 overflow-hidden"
                style={{borderColor: '#E5E7EB'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {typeof type.image === 'string' && type.image.startsWith('/') ? (
                  <div className="w-full aspect-[4/3] overflow-hidden">
                    <img
                      src={type.image}
                      alt={type.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="aspect-square flex items-center justify-center text-6xl"
                    style={{backgroundColor: '#F9FAFB'}}
                  >
                    {type.image}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20 md:py-28 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-2xl md:text-3xl font-light mb-4 tracking-wide" style={{color: '#1F1F1F'}}>
              真实案例
            </h2>
            <p className="text-sm md:text-base font-light" style={{color: '#6B7280'}}>
              见证专业技术带来的美丽蜕变
            </p>
          </div>

          <div className="space-y-16">
            {caseStudies.map((caseStudy, index) => (
              <div key={caseStudy.id} className="bg-white border" style={{borderColor: '#E5E7EB'}}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image Compare Slider */}
                  <div className="p-6 md:p-8 min-h-[500px] md:min-h-[600px] flex items-center">
                    <ImageCompareSlider
                      beforeImage={caseStudy.beforeImage}
                      afterImage={caseStudy.afterImage}
                      altBefore={`${caseStudy.title} - 术前`}
                      altAfter={`${caseStudy.title} - 术后`}
                    />
                  </div>

                  {/* Case Details */}
                  <div className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="mb-4">
                      <span
                        className="inline-block px-4 py-1 text-xs font-light tracking-wider"
                        style={{backgroundColor: '#1C2B3A', color: 'white'}}
                      >
                        {caseStudy.category}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-light mb-4" style={{color: '#1F1F1F'}}>
                      案例 {String(index + 1).padStart(2, '0')}
                    </h3>
                    <h4 className="text-lg md:text-xl font-normal mb-4" style={{color: '#1F1F1F'}}>
                      {caseStudy.title}
                    </h4>
                    <p className="text-sm md:text-base leading-relaxed" style={{color: '#6B7280'}}>
                      {caseStudy.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />

      <Footer />
    </div>
  );
}

export default FacialContourPage;

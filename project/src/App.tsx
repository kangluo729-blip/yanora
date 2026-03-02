import Navbar from './components/Navbar';
import ServicesSection from './components/ServicesSection';
import CaseStudiesSection from './components/CaseStudiesSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight" style={{color: '#1F1F1F'}}>
              YANOR A
            </h1>
            <p className="text-xl md:text-2xl mb-12 font-light" style={{color: '#6B7280'}}>
              重塑自信，焕发光彩
            </p>
            <a
              href="/booking"
              className="inline-block px-8 py-4 text-lg font-light tracking-wide transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: '#1F1F1F',
                color: '#FFFFFF'
              }}
            >
              预约咨询
            </a>
          </div>
        </section>

        <ServicesSection />
        <CaseStudiesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default App;

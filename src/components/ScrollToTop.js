import React, { useState, useEffect } from 'react';
import './ScrollToTop.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // إظهار الزر عند التمرير لأسفل مسافة محددة (مثلاً 300 بكسل)
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    // تنظيف الـ Listener عند إلغاء تحميل المكون
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // دالة الصعود للأعلى بسلاسة
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button onClick={scrollToTop} className="scroll-to-top" aria-label="Volver arriba">
          ↑
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
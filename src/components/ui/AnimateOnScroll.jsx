import { useRef, useLayoutEffect, useEffect, useState } from 'react';

const AnimateOnScroll = ({ children }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [visible]);

  return (
    <div ref={ref} className={`h-full ${visible ? 'animate-card-in' : 'opacity-0'}`}>
      {children}
    </div>
  );
};

export default AnimateOnScroll;

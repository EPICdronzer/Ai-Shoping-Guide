'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ProductCard from './ProductCard';

export default function ProductCarousel({ products }) {
  const [current, setCurrent] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const trackRef = useRef(null);

  const CARD_WIDTH = typeof window !== 'undefined' && window.innerWidth <= 640 ? 200 : 260;
  const GAP = 16;

  const getCardWidth = () => {
    if (typeof window === 'undefined') return 260;
    return window.innerWidth <= 640 ? 200 : 260;
  };

  const scrollTo = useCallback((index) => {
    const clampedIndex = Math.max(0, Math.min(index, products.length - 1));
    setCurrent(clampedIndex);
    if (trackRef.current) {
      const cw = getCardWidth();
      trackRef.current.scrollTo({
        left: clampedIndex * (cw + GAP),
        behavior: 'smooth',
      });
    }
  }, [products.length]);

  const updateArrows = () => {
    if (!trackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = trackRef.current;
    setCanPrev(scrollLeft > 10);
    setCanNext(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', updateArrows, { passive: true });
    updateArrows();
    return () => track.removeEventListener('scroll', updateArrows);
  }, [products]);

  // Reset on new products
  useEffect(() => {
    setCurrent(0);
    if (trackRef.current) trackRef.current.scrollLeft = 0;
    updateArrows();
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <div className="carousel-wrapper">
      {/* LEFT ARROW */}
      <button
        className={`carousel-arrow carousel-arrow-left ${!canPrev ? 'arrow-hidden' : ''}`}
        onClick={() => scrollTo(current - 1)}
        aria-label="Previous product"
        disabled={!canPrev}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* CARD TRACK */}
      <div className="carousel-track" ref={trackRef}>
        {products.map((product, i) => (
          <div className="carousel-item" key={i}>
            <ProductCard product={product} index={i} />
          </div>
        ))}
      </div>

      {/* RIGHT ARROW */}
      <button
        className={`carousel-arrow carousel-arrow-right ${!canNext ? 'arrow-hidden' : ''}`}
        onClick={() => scrollTo(current + 1)}
        aria-label="Next product"
        disabled={!canNext}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* DOT INDICATORS */}
      <div className="carousel-dots">
        {products.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === current ? 'dot-active' : ''}`}
            onClick={() => scrollTo(i)}
            aria-label={`Go to product ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

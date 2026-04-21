import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export interface UseCardHoverOptions {
  liftDistance?: number; // 上浮距离（像素）
  duration?: number; // 动画时长（毫秒）
  ease?: string; // 缓动函数
  scale?: number; // 缩放比例
  shadowIntensity?: number; // 阴影强度
}

export function useCardHover(options: UseCardHoverOptions = {}) {
  const {
    liftDistance = 8,
    duration = 300,
    ease = 'cubic-bezier(0.4, 0, 0.2, 1)',
    scale = 1.02,
    shadowIntensity = 0.2,
  } = options;
  
  const elementRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    // 确保元素有相对定位
    const originalPosition = element.style.position;
    const originalZIndex = element.style.zIndex;
    const originalBoxShadow = element.style.boxShadow;
    const originalTransform = element.style.transform;
    
    if (window.getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    const handleMouseEnter = () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      
      timelineRef.current = gsap.timeline();
      timelineRef.current
        .to(element, {
          duration: duration / 1000,
          y: -liftDistance,
          scale,
          boxShadow: `0 ${liftDistance * 1.5}px ${liftDistance * 2}px rgba(0, 0, 0, ${shadowIntensity})`,
          ease,
          overwrite: 'auto',
        }, 0);
    };
    
    const handleMouseLeave = () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      
      timelineRef.current = gsap.timeline();
      timelineRef.current
        .to(element, {
          duration: duration / 1000,
          y: 0,
          scale: 1,
          boxShadow: originalBoxShadow || 'none',
          ease,
          overwrite: 'auto',
        }, 0);
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      
      // 恢复原始样式
      element.style.position = originalPosition;
      element.style.zIndex = originalZIndex;
      element.style.boxShadow = originalBoxShadow;
      element.style.transform = originalTransform;
      
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [liftDistance, duration, ease, scale, shadowIntensity]);
  
  return elementRef;
}
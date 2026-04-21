import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export interface UseStatusTransitionOptions {
  duration?: number; // 动画时长（毫秒）
  scale?: number; // 缩放比例
  backgroundColor?: string; // 背景色变化
  color?: string; // 文字颜色变化
  elastic?: { // 弹性参数
    amplitude?: number;
    period?: number;
  };
}

export function useStatusTransition(
  trigger: boolean, // 状态变化触发器
  options: UseStatusTransitionOptions = {}
) {
  const {
    duration = 500,
    scale = 1.1,
    backgroundColor,
    color,
    elastic = { amplitude: 1.2, period: 0.4 },
  } = options;
  
  const elementRef = useRef<HTMLElement>(null);
  const prevTriggerRef = useRef<boolean>(trigger);
  
  useEffect(() => {
    // 只有触发器变化时才执行动画
    if (prevTriggerRef.current === trigger) return;
    prevTriggerRef.current = trigger;
    
    const element = elementRef.current;
    if (!element) return;
    
    // 保存原始样式
    const originalTransform = element.style.transform;
    const originalBackgroundColor = element.style.backgroundColor;
    const originalColor = element.style.color;
    
    // 弹性缓动函数
    gsap.to(element, {
      duration: duration / 1000,
      scale: trigger ? scale : 1,
      backgroundColor: backgroundColor || originalBackgroundColor,
      color: color || originalColor,
      ease: 'elastic.out(1, 0.3)',
      overwrite: 'auto',
      onComplete: () => {
        // 动画完成后恢复transform，避免影响布局
        if (!trigger) {
          element.style.transform = originalTransform;
        }
      },
    });
    
    return () => {
      // 清理
      gsap.killTweensOf(element);
    };
  }, [trigger, duration, scale, backgroundColor, color, elastic]);
  
  return elementRef;
}
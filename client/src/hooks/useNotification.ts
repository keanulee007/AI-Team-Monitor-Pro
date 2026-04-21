import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

/**
 * 通知弹入弹出动画 Hook
 * 
 * 使用方式：
 * 1. 在组件中调用：const { show, notificationRef, isVisible, message } = useNotification();
 * 2. 将 notificationRef 附加到通知元素：
 *    {isVisible && (
 *      <div ref={notificationRef} className="notification">
 *        {message}
 *      </div>
 *    )}
 * 3. 调用 show('通知内容') 显示通知
 * 
 * 动画效果：
 * - 300ms弹入（弹性缓动）
 * - 3秒停留
 * - 250ms淡出
 */
export const useNotification = () => {
  const notificationRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  // 清理函数
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationRef.current) {
      animationRef.current.kill();
      animationRef.current = null;
    }
  }, []);

  // 显示通知
  const show = useCallback((text: string) => {
    cleanup(); // 清理之前的动画和定时器
    
    setMessage(text);
    setIsVisible(true);

    // 确保DOM已更新
    setTimeout(() => {
      const element = notificationRef.current;
      if (!element) return;

      // 设置初始状态：在屏幕外下方
      gsap.set(element, {
        opacity: 0,
        y: 50,
        scale: 0.8,
      });

      // 创建动画时间线
      const timeline = gsap.timeline({
        onComplete: () => {
          // 3秒后开始淡出
          timeoutRef.current = setTimeout(() => {
            // 淡出动画
            gsap.to(element, {
              opacity: 0,
              y: -30,
              duration: 0.25,
              ease: "power2.in",
              onComplete: () => {
                setIsVisible(false);
                animationRef.current = null;
              }
            });
          }, 3000);
        }
      });

      // 弹入动画：300ms弹性缓动
      timeline.to(element, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });

      animationRef.current = timeline;
    }, 10);
  }, [cleanup]);

  // 组件卸载时清理
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // 当通知不可见时清理DOM元素状态
  useEffect(() => {
    if (!isVisible && notificationRef.current) {
      gsap.set(notificationRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.8,
      });
    }
  }, [isVisible]);

  return {
    show,
    notificationRef,
    isVisible,
    message,
  };
};

export default useNotification;
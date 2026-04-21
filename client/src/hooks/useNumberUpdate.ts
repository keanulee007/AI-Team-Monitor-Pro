import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * 数字滚动更新动画 Hook
 * 
 * 使用方式：
 * 1. 在组件中调用：const { currentNumber, containerRef } = useNumberUpdate(initialValue);
 * 2. 将 containerRef 附加到一个包含两个数字元素的容器：
 *    <div ref={containerRef}>
 *      <span className="old-number"></span>
 *      <span className="new-number"></span>
 *    </div>
 * 3. 使用 currentNumber 作为显示的数字（可选）
 * 
 * 当数字变化时，旧数字会向上淡出，新数字从下方淡入，动画时长400ms。
 */
export const useNumberUpdate = (value: number) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const oldNumberRef = useRef<HTMLSpanElement>(null);
  const newNumberRef = useRef<HTMLSpanElement>(null);
  const [currentNumber, setCurrentNumber] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    // 如果值没有变化，不执行动画
    if (value === previousValueRef.current) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    // 创建或获取数字元素
    let oldNumber = oldNumberRef.current;
    let newNumber = newNumberRef.current;

    // 如果元素不存在，创建它们
    if (!oldNumber || !newNumber) {
      // 清除容器内容
      container.innerHTML = '';
      
      // 创建旧数字元素
      oldNumber = document.createElement('span');
      oldNumber.className = 'old-number';
      oldNumber.style.cssText = `
        position: absolute;
        display: inline-block;
        opacity: 1;
        transform: translateY(0);
        will-change: opacity, transform;
      `;
      oldNumber.textContent = previousValueRef.current.toString();
      
      // 创建新数字元素
      newNumber = document.createElement('span');
      newNumber.className = 'new-number';
      newNumber.style.cssText = `
        position: absolute;
        display: inline-block;
        opacity: 0;
        transform: translateY(20px);
        will-change: opacity, transform;
      `;
      newNumber.textContent = value.toString();
      
      container.appendChild(oldNumber);
      container.appendChild(newNumber);
      
      // 保存引用
      oldNumberRef.current = oldNumber;
      newNumberRef.current = newNumber;
    } else {
      // 更新数字内容
      oldNumber.textContent = previousValueRef.current.toString();
      newNumber.textContent = value.toString();
    }

    // 设置初始状态
    gsap.set(oldNumber, {
      opacity: 1,
      y: 0,
    });
    
    gsap.set(newNumber, {
      opacity: 0,
      y: 20,
    });

    // 执行动画
    const timeline = gsap.timeline({
      onComplete: () => {
        // 动画完成后更新当前显示的数字
        setCurrentNumber(value);
        previousValueRef.current = value;
        
        // 重置位置，以便下一次动画
        gsap.set(oldNumber, {
          opacity: 1,
          y: 0,
        });
        gsap.set(newNumber, {
          opacity: 0,
          y: 20,
        });
        
        // 交换引用：新数字变成旧数字
        oldNumberRef.current = newNumber;
        newNumberRef.current = oldNumber;
      }
    });

    // 旧数字向上淡出
    timeline.to(oldNumber, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: "power2.out",
    }, 0);

    // 新数字从下方淡入
    timeline.to(newNumber, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out",
    }, 0);

  }, [value]);

  // 清理函数
  useEffect(() => {
    return () => {
      // 清理GSAP动画
      if (oldNumberRef.current) {
        gsap.killTweensOf(oldNumberRef.current);
      }
      if (newNumberRef.current) {
        gsap.killTweensOf(newNumberRef.current);
      }
    };
  }, []);

  return {
    currentNumber,
    containerRef,
    oldNumberRef,
    newNumberRef,
  };
};

export default useNumberUpdate;
import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils } from 'three';

export type AgentStatus = 'working' | 'resting' | 'idle' | 'walking';

export interface AgentAnimationState {
  status: AgentStatus;
  progress: number; // 0-1
  transitionProgress: number; // 0-1 during transition
}

export interface UseAgentAnimationProps {
  agentId: string;
  status: AgentStatus;
  onAnimationUpdate?: (state: AgentAnimationState) => void;
}

// 动画定义
const ANIMATIONS = {
  working: {
    duration: 8, // 秒
    update: (progress: number, ref: any) => {
      // 身体轻微前倾 (绕X轴旋转-0.1弧度)
      const bodyLean = -0.1;
      // 手部周期性动作：上下摆动
      const armSwing = Math.sin(progress * Math.PI * 2) * 0.2;
      return {
        bodyRotationX: bodyLean,
        leftArmRotationZ: armSwing,
        rightArmRotationZ: -armSwing,
        breathingAmplitude: 0.02, // 轻微的呼吸
      };
    },
  },
  resting: {
    duration: 12,
    update: (progress: number, ref: any) => {
      // 身体后仰 (绕X轴旋转0.15弧度)
      const bodyLean = 0.15;
      // 缓慢呼吸：正弦波，周期12秒
      const breathing = Math.sin(progress * Math.PI * 2) * 0.05;
      return {
        bodyRotationX: bodyLean,
        leftArmRotationZ: 0.3, // 手臂放松
        rightArmRotationZ: -0.3,
        breathingAmplitude: breathing,
      };
    },
  },
  idle: {
    duration: 6,
    update: (progress: number, ref: any) => {
      // 闲置：轻微呼吸
      const breathing = Math.sin(progress * Math.PI * 2) * 0.03;
      return {
        bodyRotationX: 0,
        leftArmRotationZ: 0,
        rightArmRotationZ: 0,
        breathingAmplitude: breathing,
      };
    },
  },
  walking: {
    duration: 2,
    update: (progress: number, ref: any) => {
      // 走路：身体轻微摇摆，手臂摆动
      const bodySway = Math.sin(progress * Math.PI * 2) * 0.05;
      const armSwing = Math.sin(progress * Math.PI * 2) * 0.5;
      return {
        bodyRotationX: 0,
        bodyRotationZ: bodySway,
        leftArmRotationZ: armSwing,
        rightArmRotationZ: -armSwing,
        breathingAmplitude: 0.03,
      };
    },
  },
};

export function useAgentAnimation({
  agentId,
  status,
  onAnimationUpdate,
}: UseAgentAnimationProps) {
  const stateRef = useRef<AgentAnimationState>({
    status,
    progress: 0,
    transitionProgress: 1, // 初始无过渡
  });
  const prevStatusRef = useRef<AgentStatus>(status);
  const transitionStartTimeRef = useRef<number>(0);
  const animationRef = useRef<any>(null);

  // 状态变化时开始过渡
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      prevStatusRef.current = status;
      transitionStartTimeRef.current = Date.now();
      stateRef.current.transitionProgress = 0;
    }
  }, [status]);

  // 动画循环
  useFrame((state, delta) => {
    const now = Date.now();
    const currentAnim = ANIMATIONS[stateRef.current.status];
    
    // 更新动画进度
    stateRef.current.progress += delta / currentAnim.duration;
    if (stateRef.current.progress >= 1) {
      stateRef.current.progress -= Math.floor(stateRef.current.progress);
    }
    
    // 更新过渡进度（0.5秒过渡）
    if (stateRef.current.transitionProgress < 1) {
      const elapsed = now - transitionStartTimeRef.current;
      stateRef.current.transitionProgress = Math.min(elapsed / 500, 1); // 500ms过渡
    }
    
    // 计算当前动画值
    const currentValues = currentAnim.update(stateRef.current.progress, animationRef.current);
    
    // 如果有过渡，混合上一个状态的值
    if (stateRef.current.transitionProgress < 1 && prevStatusRef.current !== status) {
      const prevAnim = ANIMATIONS[prevStatusRef.current];
      const prevProgress = stateRef.current.progress * (prevAnim.duration / currentAnim.duration);
      const prevValues = prevAnim.update(prevProgress, animationRef.current);
      
      const t = stateRef.current.transitionProgress;
      // 使用ease-in-out缓动
      const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      
      // 混合值
      const blendedValues = {
        bodyRotationX: MathUtils.lerp(prevValues.bodyRotationX || 0, currentValues.bodyRotationX || 0, easeT),
        bodyRotationZ: MathUtils.lerp(prevValues.bodyRotationZ || 0, currentValues.bodyRotationZ || 0, easeT),
        leftArmRotationZ: MathUtils.lerp(prevValues.leftArmRotationZ || 0, currentValues.leftArmRotationZ || 0, easeT),
        rightArmRotationZ: MathUtils.lerp(prevValues.rightArmRotationZ || 0, currentValues.rightArmRotationZ || 0, easeT),
        breathingAmplitude: MathUtils.lerp(prevValues.breathingAmplitude || 0, currentValues.breathingAmplitude || 0, easeT),
      };
      
      animationRef.current = blendedValues;
    } else {
      animationRef.current = currentValues;
    }
    
    // 回调
    onAnimationUpdate?.({ ...stateRef.current });
  });

  // 返回动画值和状态
  return {
    animationValues: animationRef.current,
    state: stateRef.current,
    // 控制函数
    setStatus: (newStatus: AgentStatus) => {
      prevStatusRef.current = stateRef.current.status;
      stateRef.current.status = newStatus;
      transitionStartTimeRef.current = Date.now();
      stateRef.current.transitionProgress = 0;
    },
  };
}
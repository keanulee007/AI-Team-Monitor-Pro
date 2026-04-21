import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, CylinderGeometry, SphereGeometry, MeshStandardMaterial, Group } from 'three';
import { Text } from '@react-three/drei';

// 角色颜色定义
const AGENT_COLORS = {
  TANG_BOHU: '#2E5C8A',    // 唐伯虎 - 深蓝色
  ZHU_ZHISHAN: '#5D4E37',  // 祝枝山 - 棕色
  QIU_XIANG: '#FFB6C1',    // 秋香 - 粉色
  SHILIU_JIE: '#3D3D3D',   // 石榴姐 - 深灰色
};

// 状态指示灯颜色
const STATUS_LIGHT_COLORS = {
  WORKING: '#00FF00',      // 绿色 - 工作中
  RESTING: '#FFFF00',      // 黄色 - 休息中
  IDLE: '#FFA500',         // 橙色 - 空闲
  WALKING: '#00FFFF',      // 青色 - 移动中
  OFFLINE: '#FF0000',      // 红色 - 离线
};

interface SimpleAgent3DProps {
  position: [number, number, number];
  name: string;
  status: string;
  color?: string;
}

const SimpleAgent3D = ({ position, name, status, color }: SimpleAgent3DProps) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const lightRef = useRef<Mesh>(null);
  
  // 动画状态
  const [animationState, setAnimationState] = useState<'working' | 'resting' | 'idle' | 'walking'>('idle');
  const [transitionProgress, setTransitionProgress] = useState(1);
  
  // 根据名称确定颜色
  const agentColor = color || (() => {
    switch (name) {
      case '唐伯虎': return AGENT_COLORS.TANG_BOHU;
      case '祝枝山': return AGENT_COLORS.ZHU_ZHISHAN;
      case '秋香': return AGENT_COLORS.QIU_XIANG;
      case '石榴姐': return AGENT_COLORS.SHILIU_JIE;
      default: return AGENT_COLORS.TANG_BOHU;
    }
  })();
  
  // 根据状态确定指示灯颜色
  const lightColor = (() => {
    switch (status) {
      case 'working': return STATUS_LIGHT_COLORS.WORKING;
      case 'resting': return STATUS_LIGHT_COLORS.RESTING;
      case 'idle': return STATUS_LIGHT_COLORS.IDLE;
      case 'walking': return STATUS_LIGHT_COLORS.WALKING;
      default: return STATUS_LIGHT_COLORS.OFFLINE;
    }
  })();
  
  // 状态变化时更新动画
  useEffect(() => {
    // 将store状态映射到动画状态
    let newAnimationState: 'working' | 'resting' | 'idle' | 'walking';
    
    switch (status) {
      case 'working':
        newAnimationState = 'working';
        break;
      case 'resting':
        newAnimationState = 'resting';
        break;
      case 'discussing':
        newAnimationState = 'walking';
        break;
      case 'coffee':
        newAnimationState = 'walking';
        break;
      default:
        newAnimationState = 'idle';
    }
    
    if (newAnimationState !== animationState) {
      setTransitionProgress(0);
      // 使用setTimeout模拟过渡效果
      const transitionInterval = setInterval(() => {
        setTransitionProgress(prev => {
          const newProgress = prev + 0.05;
          if (newProgress >= 1) {
            clearInterval(transitionInterval);
            setAnimationState(newAnimationState);
            return 1;
          }
          return newProgress;
        });
      }, 16); // 约60fps
      
      return () => clearInterval(transitionInterval);
    }
  }, [status, animationState]);
  
  useFrame((state) => {
    if (!groupRef.current || !bodyRef.current || !headRef.current || !lightRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    // 根据动画状态更新角色姿势
    switch (animationState) {
      case 'working':
        // 工作状态：身体前倾，头部轻微点头
        bodyRef.current.rotation.x = Math.sin(time * 2) * 0.05;
        headRef.current.rotation.x = Math.sin(time * 3) * 0.1;
        // 手臂模拟打字动作（通过身体旋转模拟）
        groupRef.current.rotation.z = Math.sin(time * 5) * 0.02;
        break;
        
      case 'resting':
        // 休息状态：身体后仰，呼吸效果
        bodyRef.current.rotation.x = -0.1 + Math.sin(time * 1.5) * 0.02;
        headRef.current.rotation.x = -0.05;
        // 呼吸效果（轻微缩放）
        const breathScale = 1 + Math.sin(time * 2) * 0.01;
        bodyRef.current.scale.y = breathScale;
        headRef.current.scale.y = breathScale;
        break;
        
      case 'idle':
        // 空闲状态：轻微晃动
        bodyRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.05;
        break;
        
      case 'walking':
        // 行走状态：上下浮动和前后摆动
        groupRef.current.position.y = position[1] + Math.sin(time * 3) * 0.1;
        bodyRef.current.rotation.x = Math.sin(time * 4) * 0.1;
        headRef.current.rotation.x = Math.sin(time * 4) * 0.05;
        break;
        
      default:
        // 默认状态：轻微呼吸
        bodyRef.current.scale.y = 1 + Math.sin(time * 1) * 0.005;
        break;
    }
    
    // 指示灯闪烁效果
    if (lightRef.current.material) {
      const material = lightRef.current.material as MeshStandardMaterial;
      const intensity = 0.5 + Math.sin(time * 3) * 0.3;
      material.emissiveIntensity = intensity;
    }
    
    // 应用状态过渡
    if (transitionProgress < 1) {
      // 平滑过渡到新状态
      const transitionFactor = 1 - transitionProgress;
      bodyRef.current.rotation.x *= transitionFactor;
      headRef.current.rotation.x *= transitionFactor;
    }
  });
  
  return (
    <group ref={groupRef} position={position}>
      {/* 圆柱体身体 */}
      <mesh ref={bodyRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
        <meshStandardMaterial 
          color={agentColor}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      {/* 球体头部 */}
      <mesh ref={headRef} position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={agentColor}
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>
      
      {/* 头顶状态指示灯 */}
      <mesh ref={lightRef} position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={lightColor}
          emissive={lightColor}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* 角色名称标签 */}
      <group position={[0, -0.8, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 0.2, 0.05]} />
          <meshStandardMaterial color="rgba(0, 0, 0, 0.7)" />
        </mesh>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </group>
      
      {/* 状态文本 */}
      <group position={[0, -1.1, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.15, 0.05]} />
          <meshStandardMaterial color="rgba(50, 50, 50, 0.7)" />
        </mesh>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.1}
          color={lightColor}
          anchorX="center"
          anchorY="middle"
        >
          {status.toUpperCase()}
        </Text>
      </group>
    </group>
  );
};

export default SimpleAgent3D;
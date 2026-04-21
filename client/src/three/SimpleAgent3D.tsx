import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, Group } from 'three';
import { Text } from '@react-three/drei';
import type { AgentStatus } from '../../../shared/types';

// 角色颜色定义
const AGENT_COLORS: Record<string, string> = {
  唐伯虎: '#2E5C8A',
  祝枝山: '#5D4E37',
  秋香: '#FFB6C1',
  石榴姐: '#3D3D3D',
};

// 状态指示灯颜色
const STATUS_LIGHT_COLORS: Record<string, string> = {
  working: '#00FF00',
  resting: '#FFFF00',
  discussing: '#FFA500',
  coffee: '#FF6600',
};

interface SimpleAgent3DProps {
  position: [number, number, number];
  name: string;
  status: AgentStatus;
  color?: string;
}

const SimpleAgent3D = ({ position, name, status, color }: SimpleAgent3DProps) => {
  const groupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const lightRef = useRef<Mesh>(null);

  const agentColor = color || AGENT_COLORS[name] || '#2E5C8A';
  const lightColor = STATUS_LIGHT_COLORS[status] || '#FF0000';

  // 内部动画状态
  const [animStatus, setAnimStatus] = useState(status);
  useEffect(() => {
    setAnimStatus(status);
  }, [status]);

  useFrame((state) => {
    if (!bodyRef.current || !headRef.current) return;
    const t = state.clock.elapsedTime;

    switch (animStatus) {
      case 'working':
        bodyRef.current.rotation.x = -0.08 + Math.sin(t * 2) * 0.03;
        headRef.current.rotation.x = Math.sin(t * 3) * 0.08;
        bodyRef.current.scale.y = 1 + Math.sin(t * 1.5) * 0.01;
        break;
      case 'resting':
        bodyRef.current.rotation.x = 0.12 + Math.sin(t * 1.5) * 0.02;
        headRef.current.rotation.x = -0.1;
        bodyRef.current.scale.y = 1 + Math.sin(t * 2) * 0.02;
        break;
      case 'discussing':
        bodyRef.current.rotation.x = Math.sin(t * 1.5) * 0.05;
        headRef.current.rotation.y = Math.sin(t * 2) * 0.1;
        bodyRef.current.scale.y = 1;
        break;
      case 'coffee':
        bodyRef.current.rotation.x = Math.sin(t * 0.8) * 0.03;
        headRef.current.rotation.x = Math.sin(t * 1) * 0.05;
        bodyRef.current.scale.y = 1 + Math.sin(t * 1.2) * 0.01;
        break;
      default:
        bodyRef.current.rotation.x = 0;
        headRef.current.rotation.x = 0;
        bodyRef.current.scale.y = 1;
    }

    // 指示灯闪烁
    if (lightRef.current) {
      const mat = lightRef.current.material as any;
      mat.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 身体 */}
      <mesh ref={bodyRef} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 1, 8]} />
        <meshStandardMaterial color={agentColor} roughness={0.7} metalness={0.3} />
      </mesh>
      {/* 头部 */}
      <mesh ref={headRef} position={[0, 0.8, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={agentColor} roughness={0.5} metalness={0.5} />
      </mesh>
      {/* 状态灯 */}
      <mesh ref={lightRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={lightColor} emissive={lightColor} emissiveIntensity={0.5} />
      </mesh>
      {/* 名字 */}
      <Text position={[0, -0.8, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  );
};

export default SimpleAgent3D;

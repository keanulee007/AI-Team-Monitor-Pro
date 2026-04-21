import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { OrbitControls, Float, Text, OrthographicCamera } from '@react-three/drei';
import SimpleAgent3D from './SimpleAgent3D';
import { useAgents } from '../store/useStore';
import type { AgentStatus } from '../../../shared/types';

// 建筑颜色定义
const BUILDING_COLORS = {
  WALL: '#C41E3A',
  ROOF: '#D4A574',
  LED: '#00FF88',
  DESK: '#8B4513',
  CHAIR: '#654321',
  SCREEN: '#1A1A2E',
  HOLOGRAM: '#00FFFF',
};

// 歇山顶屋顶
const HipRoof = ({ position, size }: { position: [number, number, number]; size: [number, number, number] }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={BUILDING_COLORS.ROOF} metalness={0.8} roughness={0.2} />
  </mesh>
);

// 飞檐翘角
const FlyingEaves = ({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) => (
  <mesh position={position} rotation={rotation} castShadow>
    <boxGeometry args={[0.5, 0.1, 0.5]} />
    <meshStandardMaterial color={BUILDING_COLORS.ROOF} metalness={0.9} roughness={0.1} />
  </mesh>
);

// LED灯带
const LEDStrip = ({ position, length, rotation }: { position: [number, number, number]; length: number; rotation?: [number, number, number] }) => {
  const ledRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (ledRef.current) {
      const intensity = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
      (ledRef.current.material as any).emissiveIntensity = intensity;
    }
  });
  return (
    <mesh ref={ledRef} position={position} rotation={rotation}>
      <boxGeometry args={[length, 0.05, 0.05]} />
      <meshStandardMaterial color={BUILDING_COLORS.LED} emissive={BUILDING_COLORS.LED} emissiveIntensity={0.5} />
    </mesh>
  );
};

// 办公室（半透明玻璃）
const OfficeRoom = ({ position, name, size = [3, 2, 3] as [number, number, number] }: { position: [number, number, number]; name: string; size?: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.3} metalness={0.1} />
    </mesh>
    <Text position={[0, size[1] / 2 + 0.3, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
      {name}
    </Text>
    <Workstation position={[-0.8, -size[1] / 2 + 0.5, -0.8]} />
  </group>
);

// 工位
const Workstation = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <boxGeometry args={[0.8, 0.5, 0.6]} />
      <meshStandardMaterial color={BUILDING_COLORS.DESK} />
    </mesh>
    <mesh position={[0, -0.1, 0.4]} castShadow>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color={BUILDING_COLORS.CHAIR} />
    </mesh>
    <mesh position={[0, 0.6, -0.2]} castShadow>
      <boxGeometry args={[0.6, 0.4, 0.05]} />
      <meshStandardMaterial color={BUILDING_COLORS.SCREEN} emissive="#1A1A2E" emissiveIntensity={0.3} />
    </mesh>
  </group>
);

// 全息数据球
const HologramSphere = () => {
  const sphereRef = useRef<Mesh>(null);
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      sphereRef.current.scale.setScalar(scale);
    }
  });
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <group position={[0, 1.5, 0]}>
        <mesh ref={sphereRef} castShadow>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={BUILDING_COLORS.HOLOGRAM} transparent opacity={0.3} wireframe />
        </mesh>
      </group>
    </Float>
  );
};

// 主建筑（接收agent状态作为props）
const MingDynastyBuilding = ({ agentStatuses }: { agentStatuses: Record<string, AgentStatus> }) => (
  <group>
    {/* 主墙体 */}
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[10, 4, 10]} />
      <meshStandardMaterial color={BUILDING_COLORS.WALL} roughness={0.7} />
    </mesh>

    {/* 屋顶 */}
    <HipRoof position={[0, 3, 0]} size={[12, 1, 12]} />
    <HipRoof position={[0, 3.5, 0]} size={[10, 0.5, 10]} />
    <HipRoof position={[0, 4, 0]} size={[8, 0.5, 8]} />

    {/* 飞檐 */}
    <FlyingEaves position={[6, 3, 6]} rotation={[0, Math.PI / 4, 0]} />
    <FlyingEaves position={[-6, 3, 6]} rotation={[0, -Math.PI / 4, 0]} />
    <FlyingEaves position={[6, 3, -6]} rotation={[0, (3 * Math.PI) / 4, 0]} />
    <FlyingEaves position={[-6, 3, -6]} rotation={[0, (-3 * Math.PI) / 4, 0]} />

    {/* LED灯带 */}
    <LEDStrip position={[0, 4.5, 6]} length={12} />
    <LEDStrip position={[0, 4.5, -6]} length={12} />
    <LEDStrip position={[6, 4.5, 0]} length={12} rotation={[0, Math.PI / 2, 0]} />
    <LEDStrip position={[-6, 4.5, 0]} length={12} rotation={[0, Math.PI / 2, 0]} />

    {/* 办公室 */}
    <OfficeRoom position={[-5, 0, 0]} name="开发站" />
    <OfficeRoom position={[5, 0, 0]} name="设计室" />
    <OfficeRoom position={[0, 0, -5]} name="音频室" />
    <OfficeRoom position={[0, 3, 0]} name="总监办公室" size={[4, 2, 4]} />

    {/* 虚拟人物 */}
    <SimpleAgent3D position={[0, 3.5, 0]} name="唐伯虎" status={agentStatuses.tangbohu || 'working'} />
    <SimpleAgent3D position={[-5, 0.5, 0]} name="祝枝山" status={agentStatuses.zhuzhishan || 'working'} />
    <SimpleAgent3D position={[5, 0.5, 0]} name="秋香" status={agentStatuses.qiuxiang || 'working'} />
    <SimpleAgent3D position={[0, 0.5, -5]} name="石榴姐" status={agentStatuses.shiliujie || 'working'} />

    {/* 全息数据球 */}
    <HologramSphere />

    {/* 地面 */}
    <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#333333" roughness={0.8} />
    </mesh>
  </group>
);

// 主场景
const OfficeScene = () => {
  const agents = useAgents();
  const agentStatuses: Record<string, AgentStatus> = {};
  for (const a of agents) {
    agentStatuses[a.id] = a.status;
  }

  return (
    <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
      <OrthographicCamera makeDefault position={[20, 20, 20]} zoom={50} near={0.1} far={1000} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFE4B5" />
      <pointLight position={[-5, 1, 0]} intensity={0.3} color="#87CEEB" />
      <pointLight position={[5, 1, 0]} intensity={0.3} color="#98FB98" />
      <pointLight position={[0, 1, -5]} intensity={0.3} color="#FFB6C1" />
      <MingDynastyBuilding agentStatuses={agentStatuses} />
      <OrbitControls enableZoom enablePan enableRotate zoomSpeed={0.5} maxPolarAngle={Math.PI / 2} />
      <fog attach="fog" args={['#1a1a2e', 10, 30]} />
    </Canvas>
  );
};

export default OfficeScene;

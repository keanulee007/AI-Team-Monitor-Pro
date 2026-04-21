import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, BoxGeometry, CylinderGeometry, MeshStandardMaterial, IcosahedronGeometry, WireframeGeometry, LineSegments, Group } from 'three';
import { OrbitControls, Float, Text, MeshTransmissionMaterial, OrthographicCamera } from '@react-three/drei';
import SimpleAgent3D from './SimpleAgent3D';
import { useAgents } from '../store/useStore';

// 建筑颜色定义
const BUILDING_COLORS = {
  WALL: '#C41E3A',      // 朱红墙体
  ROOF: '#D4A574',      // 金黄琉璃瓦
  LED: '#00FF88',       // LED灯带颜色
  OFFICE_GLASS: 'rgba(255, 255, 255, 0.2)', // 半透明办公室
  DESK: '#8B4513',      // 桌子颜色（深棕色）
  CHAIR: '#654321',     // 椅子颜色
  SCREEN: '#1A1A2E',    // 屏幕颜色
  HOLOGRAM: '#00FFFF',  // 全息数据球颜色
};

// 办公室位置定义
const OFFICE_POSITIONS = {
  EAST: { x: -5, y: 0, z: 0 },      // 东厢 - 开发站
  WEST: { x: 5, y: 0, z: 0 },       // 西厢 - 设计室
  NORTH: { x: 0, y: 0, z: -5 },     // 后堂 - 音频室
  ATTIC: { x: 0, y: 3, z: 0 },      // 阁楼 - 总监办公室
};

// 歇山顶屋顶组件
const HipRoof = ({ position, size }: { position: [number, number, number], size: [number, number, number] }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={BUILDING_COLORS.ROOF} metalness={0.8} roughness={0.2} />
    </mesh>
  );
};

// 飞檐翘角组件
const FlyingEaves = ({ position, rotation }: { position: [number, number, number], rotation?: [number, number, number] }) => {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[0.5, 0.1, 0.5]} />
      <meshStandardMaterial color={BUILDING_COLORS.ROOF} metalness={0.9} roughness={0.1} />
    </mesh>
  );
};

// LED灯带组件
const LEDStrip = ({ position, length, rotation }: { position: [number, number, number], length: number, rotation?: [number, number, number] }) => {
  const ledRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (ledRef.current) {
      // LED呼吸效果
      const intensity = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
      const material = ledRef.current.material as MeshStandardMaterial;
      material.emissiveIntensity = intensity;
    }
  });

  return (
    <mesh ref={ledRef} position={position} rotation={rotation}>
      <boxGeometry args={[length, 0.05, 0.05]} />
      <meshStandardMaterial 
        color={BUILDING_COLORS.LED}
        emissive={BUILDING_COLORS.LED}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

// 办公室组件
const OfficeRoom = ({ 
  position, 
  name, 
  size = [3, 2, 3] 
}: { 
  position: [number, number, number], 
  name: string, 
  size?: [number, number, number] 
}) => {
  return (
    <group position={position}>
      {/* 办公室墙体（半透明） */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.1}
          samples={4}
          resolution={512}
          transmission={0.8}
          roughness={0.2}
          thickness={0.1}
          ior={1.5}
          chromaticAberration={0.02}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.1}
          temporalDistortion={0.1}
          color={BUILDING_COLORS.OFFICE_GLASS}
        />
      </mesh>

      {/* 办公室名称标签 */}
      <Text
        position={[0, size[1]/2 + 0.3, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>

      {/* 内部工位 */}
      <Workstation position={[-0.8, -size[1]/2 + 0.5, -0.8]} />
      <Workstation position={[0.8, -size[1]/2 + 0.5, -0.8]} />
    </group>
  );
};

// 工位组件（桌子+椅子+屏幕）
const Workstation = ({ position }: { position: [number, number, number] }) => {
  return (
    <group position={position}>
      {/* 桌子 */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.6]} />
        <meshStandardMaterial color={BUILDING_COLORS.DESK} />
      </mesh>

      {/* 椅子 */}
      <mesh position={[0, -0.1, 0.4]} castShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={BUILDING_COLORS.CHAIR} />
      </mesh>

      {/* 屏幕 */}
      <mesh position={[0, 0.6, -0.2]} castShadow>
        <boxGeometry args={[0.6, 0.4, 0.05]} />
        <meshStandardMaterial color={BUILDING_COLORS.SCREEN} emissive="#1A1A2E" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

// 全息数据球组件
const HologramSphere = () => {
  const sphereRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (sphereRef.current) {
      // 旋转和脉动效果
      sphereRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      sphereRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={sphereRef} position={[0, 1.5, 0]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.3}
          samples={10}
          resolution={1024}
          transmission={1}
          roughness={0}
          thickness={0.3}
          ior={1.5}
          chromaticAberration={0.05}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.2}
          temporalDistortion={0.3}
          color={BUILDING_COLORS.HOLOGRAM}
        />
        <lineSegments>
          <wireframeGeometry args={[new IcosahedronGeometry(1, 1)]} />
          <lineBasicMaterial color={BUILDING_COLORS.HOLOGRAM} />
        </lineSegments>
      </mesh>
    </Float>
  );
};

// 主建筑组件
const MingDynastyBuilding = () => {
  return (
    <group>
      {/* 主墙体 */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[10, 4, 10]} />
        <meshStandardMaterial color={BUILDING_COLORS.WALL} roughness={0.7} />
      </mesh>

      {/* 歇山顶屋顶 */}
      <HipRoof position={[0, 3, 0]} size={[12, 1, 12]} />
      <HipRoof position={[0, 3.5, 0]} size={[10, 0.5, 10]} />
      <HipRoof position={[0, 4, 0]} size={[8, 0.5, 8]} />

      {/* 飞檐翘角 */}
      <FlyingEaves position={[6, 3, 6]} rotation={[0, Math.PI/4, 0]} />
      <FlyingEaves position={[-6, 3, 6]} rotation={[0, -Math.PI/4, 0]} />
      <FlyingEaves position={[6, 3, -6]} rotation={[0, 3*Math.PI/4, 0]} />
      <FlyingEaves position={[-6, 3, -6]} rotation={[0, -3*Math.PI/4, 0]} />

      {/* LED灯带 */}
      <LEDStrip position={[0, 4.5, 6]} length={12} />
      <LEDStrip position={[0, 4.5, -6]} length={12} />
      <LEDStrip position={[6, 4.5, 0]} length={12} rotation={[0, Math.PI/2, 0]} />
      <LEDStrip position={[-6, 4.5, 0]} length={12} rotation={[0, Math.PI/2, 0]} />

      {/* 四个办公室 */}
      <OfficeRoom position={[-5, 0, 0]} name="开发站" />
      <OfficeRoom position={[5, 0, 0]} name="设计室" />
      <OfficeRoom position={[0, 0, -5]} name="音频室" />
      <OfficeRoom position={[0, 3, 0]} name="总监办公室" size={[4, 2, 4]} />
      
      {/* SimpleAgent3D角色 */}
      {tangbohuAgent && (
        <SimpleAgent3D 
          position={[0, 3.5, 0]} 
          name="唐伯虎" 
          status={tangbohuAgent.status}
        />
      )}
      
      {zhuzhishanAgent && (
        <SimpleAgent3D 
          position={[-5, 0.5, 0]} 
          name="祝枝山" 
          status={zhuzhishanAgent.status}
        />
      )}
      
      {qiuxiangAgent && (
        <SimpleAgent3D 
          position={[5, 0.5, 0]} 
          name="秋香" 
          status={qiuxiangAgent.status}
        />
      )}
      
      {shiliujieAgent && (
        <SimpleAgent3D 
          position={[0, 0.5, -5]} 
          name="石榴姐" 
          status={shiliujieAgent.status}
        />
      )}

      {/* 中央大厅全息数据球 */}
      <HologramSphere />

      {/* 地面 */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>
    </group>
  );
};

// 等距视角相机组件
const OrthoCam = ({ makeDefault = false, position = [20, 20, 20] as [number, number, number], zoom = 50 }) => {
  return (
    <OrthographicCamera
      makeDefault={makeDefault}
      position={position}
      zoom={zoom}
      near={0.1}
      far={1000}
    />
  );
};

// 主场景组件
const OfficeScene = () => {
  const agents = useAgents();
  
  // 获取各个Agent的状态
  const tangbohuAgent = agents.find(a => a.id === 'tangbohu');
  const zhuzhishanAgent = agents.find(a => a.id === 'zhuzhishan');
  const qiuxiangAgent = agents.find(a => a.id === 'qiuxiang');
  const shiliujieAgent = agents.find(a => a.id === 'shiliujie');
  
  return (
    <Canvas shadows camera={{ position: [15, 15, 15], fov: 50 }}>
      {/* 等距视角相机 */}
      <OrthoCam makeDefault position={[20, 20, 20]} zoom={50} />
      
      {/* 环境光 */}
      <ambientLight intensity={0.3} />
      
      {/* 方向光（模拟太阳） */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* 点光源（室内照明） */}
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#FFE4B5" />
      <pointLight position={[-5, 1, 0]} intensity={0.3} color="#87CEEB" />
      <pointLight position={[5, 1, 0]} intensity={0.3} color="#98FB98" />
      <pointLight position={[0, 1, -5]} intensity={0.3} color="#FFB6C1" />
      <pointLight position={[0, 4, 0]} intensity={0.4} color="#FFFFE0" />

      {/* 主建筑 */}
      <MingDynastyBuilding />

      {/* 轨道控制（允许用户旋转视角） */}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        zoomSpeed={0.5}
        panSpeed={0.5}
        rotateSpeed={0.5}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2}
      />

      {/* 雾效 */}
      <fog attach="fog" args={['#1a1a2e', 10, 30]} />
    </Canvas>
  );
};

export default OfficeScene;
// ============================================
// AI Team Monitor Pro - 共享类型定义
// ============================================

/** Agent状态枚举 */
export type AgentStatus = 'working' | 'resting' | 'discussing' | 'coffee';

/** 任务优先级 */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/** 任务状态 */
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

/** 3D位置 */
export interface IPosition {
  x: number;
  y: number;
  z: number;
}

/** Agent状态 */
export interface IAgentState {
  id: string;
  name: string;
  role: string;
  avatar: string;          // 形象标识
  status: AgentStatus;
  currentTask: string | null;
  productivity: number;    // 0-100
  mood: number;            // 0-100
  position: IPosition;
  lastActive: number;      // timestamp
}

/** 任务 */
export interface ITask {
  id: string;
  title: string;
  description: string;
  assignee: string;        // agent id
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: number;
  deadline: number;
  completedAt?: number;
}

/** 活动日志 */
export interface IActivity {
  id: string;
  agentId: string;
  type: 'status_change' | 'task_update' | 'interaction' | 'system';
  message: string;
  timestamp: number;
}

/** 全局状态 */
export interface IGlobalState {
  agents: IAgentState[];
  tasks: ITask[];
  balance: number;
  totalSpent: number;
  activities: IActivity[];
  timestamp: number;
}

/** Socket.io事件映射 */
export interface IServerEvents {
  'state:update': (state: IGlobalState) => void;
  'agent:status': (agent: IAgentState) => void;
  'task:update': (task: ITask) => void;
  'balance:change': (balance: number, totalSpent: number) => void;
  'activity:new': (activity: IActivity) => void;
}

export interface IClientEvents {
  'agent:interact': (agentId: string, action: string) => void;
  'task:create': (task: Omit<ITask, 'id' | 'createdAt'>) => void;
  'task:assign': (taskId: string, agentId: string) => void;
  'task:update:status': (taskId: string, status: TaskStatus) => void;
}

/** 默认Agent配置 */
export const DEFAULT_AGENTS: Omit<IAgentState, 'lastActive'>[] = [
  {
    id: 'tangbohu',
    name: '唐伯虎',
    role: '技术总监',
    avatar: 'tangbohu',
    status: 'working',
    currentTask: null,
    productivity: 85,
    mood: 90,
    position: { x: 0, y: 2, z: -2 },   // 阁楼
  },
  {
    id: 'zhuzhishan',
    name: '祝枝山',
    role: '程序员',
    avatar: 'zhuzhishan',
    status: 'working',
    currentTask: null,
    productivity: 75,
    mood: 80,
    position: { x: -3, y: 0, z: 0 },   // 东厢
  },
  {
    id: 'qiuxiang',
    name: '秋香',
    role: '设计师',
    avatar: 'qiuxiang',
    status: 'working',
    currentTask: null,
    productivity: 80,
    mood: 95,
    position: { x: 3, y: 0, z: 0 },    // 西厢
  },
  {
    id: 'shiliujie',
    name: '石榴姐',
    role: '音频工程师',
    avatar: 'shiliujie',
    status: 'working',
    currentTask: null,
    productivity: 70,
    mood: 85,
    position: { x: 0, y: 0, z: 3 },    // 后堂
  },
];

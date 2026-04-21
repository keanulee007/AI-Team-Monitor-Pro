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
    avatar: string;
    status: AgentStatus;
    currentTask: string | null;
    productivity: number;
    mood: number;
    position: IPosition;
    lastActive: number;
}
/** 任务 */
export interface ITask {
    id: string;
    title: string;
    description: string;
    assignee: string;
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
export declare const DEFAULT_AGENTS: Omit<IAgentState, 'lastActive'>[];

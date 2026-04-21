import { create } from 'zustand';
import type { IGlobalState, IAgentState, ITask, IActivity } from '../../../shared/types';
import { DEFAULT_AGENTS } from '../../../shared/types';

// 初始状态
const initialState: Omit<IGlobalState, 'timestamp'> = {
  agents: DEFAULT_AGENTS.map(agent => ({
    ...agent,
    lastActive: Date.now(),
  })),
  tasks: [
    {
      id: 'task-1',
      title: 'PlayerController.cs 编写',
      description: '实现玩家移动和交互逻辑',
      assignee: 'zhuzhishan',
      status: 'in-progress',
      priority: 'high',
      createdAt: Date.now() - 3600000,
      deadline: Date.now() + 86400000,
    },
    {
      id: 'task-2',
      title: '主菜单UI设计',
      description: '设计游戏主菜单界面',
      assignee: 'qiuxiang',
      status: 'todo',
      priority: 'medium',
      createdAt: Date.now() - 7200000,
      deadline: Date.now() + 172800000,
    },
    {
      id: 'task-3',
      title: '战斗音效录制',
      description: '录制战斗场景音效',
      assignee: 'shiliujie',
      status: 'todo',
      priority: 'medium',
      createdAt: Date.now() - 1800000,
      deadline: Date.now() + 259200000,
    },
    {
      id: 'task-4',
      title: 'PR Review',
      description: '审查代码合并请求',
      assignee: 'tangbohu',
      status: 'review',
      priority: 'urgent',
      createdAt: Date.now() - 900000,
      deadline: Date.now() + 3600000,
    },
  ],
  balance: 100000,
  totalSpent: 25000,
  activities: [
    {
      id: 'act-1',
      agentId: 'zhuzhishan',
      type: 'status_change',
      message: '开始编写 PlayerController.cs',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'act-2',
      agentId: 'qiuxiang',
      type: 'task_update',
      message: '创建了主菜单UI设计任务',
      timestamp: Date.now() - 7200000,
    },
    {
      id: 'act-3',
      agentId: 'shiliujie',
      type: 'interaction',
      message: '正在调试音频设备',
      timestamp: Date.now() - 1800000,
    },
    {
      id: 'act-4',
      agentId: 'tangbohu',
      type: 'system',
      message: '开始审查PR #42',
      timestamp: Date.now() - 900000,
    },
  ],
};

// 创建store
interface Store extends IGlobalState {
  // 更新整个状态
  updateState: (state: IGlobalState) => void;
  
  // 更新Agent状态
  updateAgent: (agent: IAgentState) => void;
  
  // 更新任务
  updateTask: (task: ITask) => void;
  
  // 更新余额
  updateBalance: (balance: number, totalSpent: number) => void;
  
  // 添加活动日志
  addActivity: (activity: IActivity) => void;
  
  // 重置状态
  reset: () => void;
}

export const useStore = create<Store>((set) => ({
  ...initialState,
  timestamp: Date.now(),

  updateState: (state: IGlobalState) => set(() => ({
    ...state,
    timestamp: Date.now(),
  })),

  updateAgent: (agent: IAgentState) => set((state) => ({
    agents: state.agents.map(a => a.id === agent.id ? { ...agent, lastActive: Date.now() } : a),
    timestamp: Date.now(),
  })),

  updateTask: (task: ITask) => set((state) => ({
    tasks: state.tasks.map(t => t.id === task.id ? task : t),
    timestamp: Date.now(),
  })),

  updateBalance: (balance: number, totalSpent: number) => set(() => ({
    balance,
    totalSpent,
    timestamp: Date.now(),
  })),

  addActivity: (activity: IActivity) => set((state) => ({
    activities: [activity, ...state.activities.slice(0, 49)], // 保留最近50条
    timestamp: Date.now(),
  })),

  reset: () => set(() => ({
    ...initialState,
    timestamp: Date.now(),
  })),
}));

// 导出selector hooks
export const useAgents = () => useStore((state) => state.agents);
export const useTasks = () => useStore((state) => state.tasks);
export const useBalance = () => useStore((state) => state.balance);
export const useTotalSpent = () => useStore((state) => state.totalSpent);
export const useActivities = () => useStore((state) => state.activities);
export const useTimestamp = () => useStore((state) => state.timestamp);

// 导出action hooks
export const useStoreActions = () => {
  const updateState = useStore((state) => state.updateState);
  const updateAgent = useStore((state) => state.updateAgent);
  const updateTask = useStore((state) => state.updateTask);
  const updateBalance = useStore((state) => state.updateBalance);
  const addActivity = useStore((state) => state.addActivity);
  const reset = useStore((state) => state.reset);

  return {
    updateState,
    updateAgent,
    updateTask,
    updateBalance,
    addActivity,
    reset,
  };
};
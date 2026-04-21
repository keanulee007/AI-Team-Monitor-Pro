import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { IGlobalState, DEFAULT_AGENTS, IAgentState, AgentStatus, ITask, TaskStatus, IActivity } from '../../shared/types.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
  },
});

// Initial state
const state: IGlobalState = {
  agents: DEFAULT_AGENTS.map(a => ({ ...a, lastActive: Date.now() })),
  tasks: [],
  balance: 10000,
  totalSpent: 0,
  activities: [],
  timestamp: Date.now(),
};

// 模拟任务数据
const SIMULATED_TASKS: Omit<ITask, 'id' | 'createdAt'>[] = [
  {
    title: '写PlayerController.cs',
    description: '实现玩家角色控制器，包含移动、跳跃、攻击等基础功能',
    assignee: 'zhuzhishan',
    status: 'in-progress',
    priority: 'high',
    deadline: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3天后
  },
  {
    title: '修复战斗系统Bug',
    description: '修复技能冷却时间计算错误的问题',
    assignee: 'zhuzhishan',
    status: 'todo',
    priority: 'urgent',
    deadline: Date.now() + 1 * 24 * 60 * 60 * 1000, // 1天后
  },
  {
    title: '主菜单UI设计',
    description: '设计游戏主菜单界面，包含开始、设置、退出等选项',
    assignee: 'qiuxiang',
    status: 'in-progress',
    priority: 'medium',
    deadline: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5天后
  },
  {
    title: '角色选色方案',
    description: '为主角设计多种配色方案，供玩家选择',
    assignee: 'qiuxiang',
    status: 'todo',
    priority: 'low',
    deadline: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天后
  },
  {
    title: '录制战斗音效',
    description: '录制刀剑碰撞、技能释放等战斗音效',
    assignee: 'shiliujie',
    status: 'in-progress',
    priority: 'high',
    deadline: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2天后
  },
  {
    title: '环境BGM编排',
    description: '为不同场景（森林、城镇、地下城）编排背景音乐',
    assignee: 'shiliujie',
    status: 'todo',
    priority: 'medium',
    deadline: Date.now() + 4 * 24 * 60 * 60 * 1000, // 4天后
  },
  {
    title: 'review PR #42',
    description: '审查祝枝山提交的PlayerController代码',
    assignee: 'tangbohu',
    status: 'review',
    priority: 'high',
    deadline: Date.now() + 1 * 24 * 60 * 60 * 1000, // 1天后
  },
  {
    title: '架构设计讨论',
    description: '与团队讨论游戏数据持久化架构',
    assignee: 'tangbohu',
    status: 'todo',
    priority: 'medium',
    deadline: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2天后
  },
];

// 初始化任务
SIMULATED_TASKS.forEach((task, index) => {
  state.tasks.push({
    ...task,
    id: `task-${index + 1}`,
    createdAt: Date.now(),
  });
});

// 状态概率分布
const STATUS_PROBABILITIES: Record<AgentStatus, number> = {
  working: 0.6,    // 60%
  resting: 0.15,   // 15%
  discussing: 0.15, // 15%
  coffee: 0.1,     // 10%
};

// 生成随机状态
function getRandomStatus(): AgentStatus {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const [status, prob] of Object.entries(STATUS_PROBABILITIES)) {
    cumulative += prob;
    if (rand <= cumulative) {
      return status as AgentStatus;
    }
  }
  return 'working';
}

// 更新Agent状态
function updateAgentStates() {
  const now = Date.now();
  
  state.agents.forEach(agent => {
    // 随机切换状态
    if (Math.random() < 0.3) { // 30%概率切换状态
      const newStatus = getRandomStatus();
      if (newStatus !== agent.status) {
        agent.status = newStatus;
        
        // 记录活动
        const activity: IActivity = {
          id: `activity-${now}-${agent.id}`,
          agentId: agent.id,
          type: 'status_change',
          message: `${agent.name}状态变更为${getStatusChinese(newStatus)}`,
          timestamp: now,
        };
        state.activities.push(activity);
        io.emit('activity:new', activity);
      }
    }
    
    // 更新生产力和心情
    if (agent.status === 'working') {
      agent.productivity = Math.min(100, agent.productivity + Math.random() * 2);
      agent.mood = Math.max(0, agent.mood - Math.random() * 1);
    } else if (agent.status === 'resting' || agent.status === 'coffee') {
      agent.productivity = Math.max(0, agent.productivity - Math.random() * 1);
      agent.mood = Math.min(100, agent.mood + Math.random() * 3);
    } else if (agent.status === 'discussing') {
      agent.productivity = Math.max(0, agent.productivity - Math.random() * 0.5);
      agent.mood = Math.min(100, agent.mood + Math.random() * 2);
    }
    
    agent.lastActive = now;
  });
  
  state.timestamp = now;
  io.emit('state:update', state);
}

// 更新模型余额
function updateBalance() {
  const now = Date.now();
  
  // 模拟消耗
  const dailyCost = 500; // 每日基础消耗
  const usageCost = Math.floor(Math.random() * 200); // 随机使用成本
  
  state.balance -= dailyCost + usageCost;
  state.totalSpent += dailyCost + usageCost;
  
  // 记录活动
  const activity: IActivity = {
    id: `balance-${now}`,
    agentId: 'system',
    type: 'system',
    message: `模型使用消耗：${usageCost} tokens，今日总消耗：${dailyCost + usageCost} tokens`,
    timestamp: now,
  };
  state.activities.push(activity);
  
  // 保持活动列表不超过50条
  if (state.activities.length > 50) {
    state.activities = state.activities.slice(-50);
  }
  
  io.emit('balance:change', state.balance, state.totalSpent);
  io.emit('activity:new', activity);
}

// 状态中文映射
function getStatusChinese(status: AgentStatus): string {
  const map: Record<AgentStatus, string> = {
    working: '工作中',
    resting: '休息中',
    discussing: '讨论中',
    coffee: '喝咖啡',
  };
  return map[status];
}

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Send current state on connect
  socket.emit('state:update', state);

  socket.on('agent:interact', (agentId: string, action: string) => {
    console.log(`Agent ${agentId} action: ${action}`);
  });

  socket.on('task:create', (task) => {
    console.log(`Task created: ${task.title}`);
  });

  socket.on('task:assign', (taskId: string, agentId: string) => {
    console.log(`Task ${taskId} assigned to ${agentId}`);
  });

  socket.on('task:update:status', (taskId: string, status: string) => {
    console.log(`Task ${taskId} status: ${status}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  
  // 启动模拟数据广播
  console.log('📊 开始模拟数据广播...');
  
  // 每10秒广播Agent状态
  setInterval(updateAgentStates, 10000);
  
  // 每30秒广播模型余额
  setInterval(updateBalance, 30000);
  
  // 初始广播一次
  updateAgentStates();
  updateBalance();
});

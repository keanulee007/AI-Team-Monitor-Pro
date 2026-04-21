import React from 'react';
import type { IAgentState } from '../../../shared/types';
import { useSocket } from '../hooks';

interface AgentCardProps {
  agent: IAgentState;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const { sendAgentInteract } = useSocket();

  // 状态颜色映射
  const statusColors: Record<IAgentState['status'], string> = {
    working: 'bg-green-500',
    resting: 'bg-blue-500',
    discussing: 'bg-purple-500',
    coffee: 'bg-yellow-500',
  };

  // 状态文本映射
  const statusText: Record<IAgentState['status'], string> = {
    working: '工作中',
    resting: '休息中',
    discussing: '讨论中',
    coffee: '喝咖啡',
  };

  // 角色图标映射
  const roleIcons: Record<string, string> = {
    '技术总监': '👨‍💼',
    '程序员': '👨‍💻',
    '设计师': '👩‍🎨',
    '音频工程师': '👩‍🔧',
  };

  // 处理交互
  const handleInteract = (action: string) => {
    sendAgentInteract(agent.id, action);
  };

  return (
    <div 
      className="relative rounded-xl p-4 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl"
      style={{
        width: '280px',
        height: '120px',
        background: 'linear-gradient(135deg, #1A1A2E 0%, #252542 100%)',
        border: '2px solid #D4A574',
        boxShadow: '0 4px 20px rgba(212, 165, 116, 0.3)',
      }}
    >
      {/* 左上角状态指示器 */}
      <div className="absolute -top-2 -left-2 flex items-center gap-1">
        <div className={`w-3 h-3 rounded-full ${statusColors[agent.status]} animate-pulse`} />
        <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">
          {statusText[agent.status]}
        </span>
      </div>

      {/* 右上角角色图标 */}
      <div className="absolute -top-2 -right-2 text-2xl">
        {roleIcons[agent.role] || '👤'}
      </div>

      {/* 主要内容 */}
      <div className="h-full flex flex-col justify-between">
        {/* 姓名和角色 */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
          <p className="text-sm text-gray-300">{agent.role}</p>
        </div>

        {/* 当前任务 */}
        <div className="mb-2">
          <p className="text-xs text-gray-400 mb-1">当前任务:</p>
          <p className="text-sm text-white truncate">
            {agent.currentTask || '暂无任务'}
          </p>
        </div>

        {/* 状态条 */}
        <div className="flex items-center justify-between">
          {/* 生产力 */}
          <div className="flex-1 mr-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>生产力</span>
              <span>{agent.productivity}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${agent.productivity}%` }}
              />
            </div>
          </div>

          {/* 心情 */}
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>心情</span>
              <span>{agent.mood}%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${agent.mood}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 交互按钮 */}
      <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
        <button
          onClick={() => handleInteract('chat')}
          className="px-3 py-1 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:opacity-90 transition-opacity"
        >
          交流
        </button>
        <button
          onClick={() => handleInteract('assign')}
          className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-full hover:opacity-90 transition-opacity"
        >
          派活
        </button>
        <button
          onClick={() => handleInteract('motivate')}
          className="px-3 py-1 text-xs bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-full hover:opacity-90 transition-opacity"
        >
          鼓励
        </button>
      </div>

      {/* 装饰边框 */}
      <div className="absolute inset-0 rounded-xl border border-white/10 pointer-events-none" />
      
      {/* 发光效果 */}
      <div 
        className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${statusColors[agent.status].replace('bg-', '#').replace('-500', '')} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
};

export default AgentCard;
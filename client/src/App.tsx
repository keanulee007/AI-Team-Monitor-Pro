import { useEffect } from 'react';
import { useSocket } from './hooks';
import { useStoreActions, useAgents } from './store';
import OfficeScene from './three/OfficeScene';
import AgentCard from './components/AgentCard';
import BalanceDisplay from './components/BalanceDisplay';
import TaskPanel from './components/TaskPanel';

function App() {
  // store actions are used by socket hook internally
  const { isConnected } = useSocket();
  const agents = useAgents();

  // 初始化Socket连接
  useEffect(() => {
    console.log('App mounted, socket connection status:', isConnected());
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-[#0D0D15] text-[#F5F0E8]">
      {/* 顶部导航栏 */}
      <header className="border-b border-[#1A1A2E] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🏯</div>
            <div>
              <h1 className="text-2xl font-bold text-[#C41E3A]">
                AI Team Monitor Pro
              </h1>
              <p className="text-sm text-[#D4A574]">明代赛博朋克 · 团队监控面板</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isConnected() 
                ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30' 
                : 'bg-[#C41E3A]/10 text-[#C41E3A] border border-[#C41E3A]/30'
            }`}>
              {isConnected() ? '● 已连接' : '● 连接中...'}
            </div>
            <div className="text-sm text-[#F5F0E8]/60">
              服务器: localhost:3001
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex h-[calc(100vh-80px)]">
        {/* 左侧60%：Canvas + OfficeScene */}
        <div className="w-3/5 border-r border-[#1A1A2E] relative overflow-hidden">
          <div className="absolute inset-0">
            <OfficeScene />
          </div>
          
          {/* 场景说明 */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-[#0D0D15]/90 backdrop-blur-sm border border-[#1A1A2E] rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-[#F5F0E8]/80">
                <span className="text-[#00D4AA]">●</span>
                <span>等距视角办公室 - 实时监控团队成员状态</span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-[#F5F0E8]/60">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#00D4AA]"></div>
                  <span>工作中</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#4A9EFF]"></div>
                  <span>休息中</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#D4A574]"></div>
                  <span>讨论中</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#C41E3A]"></div>
                  <span>咖啡时间</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧40%：控制面板 */}
        <div className="w-2/5 bg-[#1A1A2E] p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* 连接状态提示 */}
            {!isConnected() && (
              <div className="bg-[#C41E3A]/10 border border-[#C41E3A]/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#C41E3A]">⚠️</span>
                  <span className="text-[#F5F0E8]">正在连接服务器...</span>
                </div>
                <p className="text-sm text-[#F5F0E8]/60 mt-1">
                  请确保后端服务运行在 localhost:3001
                </p>
              </div>
            )}

            {/* 余额显示 */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">💰 项目资金</h2>
              <BalanceDisplay />
            </div>

            {/* Agent卡片网格 */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">👥 团队成员</h2>
              <div className="grid grid-cols-2 gap-4">
                {agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>

            {/* 任务面板 */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">📋 任务管理</h2>
              <TaskPanel />
            </div>

            {/* 系统信息 */}
            <div className="pt-6 border-t border-[#F5F0E8]/10">
              <div className="text-sm text-[#F5F0E8]/60">
                <div className="flex items-center justify-between">
                  <span>数据更新时间</span>
                  <span className="text-[#D4A574]">实时</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>模拟数据频率</span>
                  <span className="text-[#D4A574]">10s/30s</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>《机械之心》项目</span>
                  <span className="text-[#00D4AA]">开发中</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
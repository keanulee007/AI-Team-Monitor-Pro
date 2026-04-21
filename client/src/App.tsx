import { useSocket } from './hooks';
import { useAgents } from './store';
import OfficeScene from './three/OfficeScene';
import AgentCard from './components/AgentCard';
import BalanceDisplay from './components/BalanceDisplay';
import TaskPanel from './components/TaskPanel';

function App() {
  const { isConnected } = useSocket();
  const agents = useAgents();

  return (
    <div className="min-h-screen bg-[#0D0D15] text-[#F5F0E8]">
      {/* Header */}
      <header className="border-b border-[#1A1A2E] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">🏯</div>
            <div>
              <h1 className="text-2xl font-bold text-[#C41E3A]">AI Team Monitor Pro</h1>
              <p className="text-sm text-[#D4A574]">明代赛博朋克 · 团队监控面板</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isConnected
                ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30'
                : 'bg-[#C41E3A]/10 text-[#C41E3A] border border-[#C41E3A]/30'
            }`}>
              {isConnected ? '● Connected' : '● Connecting...'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-[calc(100vh-80px)]">
        {/* Left 60%: 3D Scene */}
        <div className="w-3/5 border-r border-[#1A1A2E] relative overflow-hidden">
          <div className="absolute inset-0">
            <OfficeScene />
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-[#0D0D15]/90 backdrop-blur-sm border border-[#1A1A2E] rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-[#F5F0E8]/80">
                <span className="text-[#00D4AA]">●</span>
                <span>Isometric Office - Real-time Team Monitoring</span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-[#F5F0E8]/60">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00D4AA]"></div>Working</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#4A9EFF]"></div>Resting</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#D4A574]"></div>Discussing</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#C41E3A]"></div>Coffee</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 40%: Control Panel */}
        <div className="w-2/5 bg-[#1A1A2E] p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Connection Warning */}
            {!isConnected && (
              <div className="bg-[#C41E3A]/10 border border-[#C41E3A]/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#C41E3A]">⚠️</span>
                  <span className="text-[#F5F0E8]">Connecting to server...</span>
                </div>
                <p className="text-sm text-[#F5F0E8]/60 mt-1">Ensure backend is running on localhost:3001</p>
              </div>
            )}

            {/* Balance */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">💰 Budget</h2>
              <BalanceDisplay />
            </div>

            {/* Agent Cards */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">👥 Team</h2>
              <div className="grid grid-cols-2 gap-4">
                {agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">📋 Tasks</h2>
              <TaskPanel />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

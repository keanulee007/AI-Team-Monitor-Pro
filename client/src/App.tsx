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
      {/* 椤堕儴瀵艰埅鏍?*/}
      <header className="border-b border-[#1A1A2E] px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">馃彲</div>
            <div>
              <h1 className="text-2xl font-bold text-[#C41E3A]">
                AI Team Monitor Pro
              </h1>
              <p className="text-sm text-[#D4A574]">鏄庝唬璧涘崥鏈嬪厠 路 鍥㈤槦鐩戞帶闈㈡澘</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/30' 
                : 'bg-[#C41E3A]/10 text-[#C41E3A] border border-[#C41E3A]/30'
            }`}>
              {isConnected ? '鈼?宸茶繛鎺? : '鈼?杩炴帴涓?..'}
            </div>
            <div className="text-sm text-[#F5F0E8]/60">
              鏈嶅姟鍣? localhost:3001
            </div>
          </div>
        </div>
      </header>

      {/* 涓诲唴瀹瑰尯鍩?*/}
      <main className="flex h-[calc(100vh-80px)]">
        {/* 宸︿晶60%锛欳anvas + OfficeScene */}
        <div className="w-3/5 border-r border-[#1A1A2E] relative overflow-hidden">
          <div className="absolute inset-0">
            <OfficeScene />
          </div>
          
          {/* 鍦烘櫙璇存槑 */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-[#0D0D15]/90 backdrop-blur-sm border border-[#1A1A2E] rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-[#F5F0E8]/80">
                <span className="text-[#00D4AA]">鈼?/span>
                <span>绛夎窛瑙嗚鍔炲叕瀹?- 瀹炴椂鐩戞帶鍥㈤槦鎴愬憳鐘舵€?/span>
              </div>
              <div className="flex gap-4 mt-2 text-xs text-[#F5F0E8]/60">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#00D4AA]"></div>
                  <span>宸ヤ綔涓?/span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#4A9EFF]"></div>
                  <span>浼戞伅涓?/span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#D4A574]"></div>
                  <span>璁ㄨ涓?/span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#C41E3A]"></div>
                  <span>鍜栧暋鏃堕棿</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 鍙充晶40%锛氭帶鍒堕潰鏉?*/}
        <div className="w-2/5 bg-[#1A1A2E] p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* 杩炴帴鐘舵€佹彁绀?*/}
            {!isConnected && (
              <div className="bg-[#C41E3A]/10 border border-[#C41E3A]/30 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#C41E3A]">鈿狅笍</span>
                  <span className="text-[#F5F0E8]">姝ｅ湪杩炴帴鏈嶅姟鍣?..</span>
                </div>
                <p className="text-sm text-[#F5F0E8]/60 mt-1">
                  璇风‘淇濆悗绔湇鍔¤繍琛屽湪 localhost:3001
                </p>
              </div>
            )}

            {/* 浣欓鏄剧ず */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">馃挵 椤圭洰璧勯噾</h2>
              <BalanceDisplay />
            </div>

            {/* Agent鍗＄墖缃戞牸 */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">馃懃 鍥㈤槦鎴愬憳</h2>
              <div className="grid grid-cols-2 gap-4">
                {agents.map(agent => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>

            {/* 浠诲姟闈㈡澘 */}
            <div>
              <h2 className="text-lg font-bold text-[#F5F0E8] mb-4">馃搵 浠诲姟绠＄悊</h2>
              <TaskPanel />
            </div>

            {/* 绯荤粺淇℃伅 */}
            <div className="pt-6 border-t border-[#F5F0E8]/10">
              <div className="text-sm text-[#F5F0E8]/60">
                <div className="flex items-center justify-between">
                  <span>鏁版嵁鏇存柊鏃堕棿</span>
                  <span className="text-[#D4A574]">瀹炴椂</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>妯℃嫙鏁版嵁棰戠巼</span>
                  <span className="text-[#D4A574]">10s/30s</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span>銆婃満姊颁箣蹇冦€嬮」鐩?/span>
                  <span className="text-[#00D4AA]">寮€鍙戜腑</span>
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

import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import type { IGlobalState } from '../../shared/types'

const socket = io('http://localhost:3001')

function App() {
  const [state, setState] = useState<IGlobalState | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Socket.io connected:', socket.id)
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected')
      setConnected(false)
    })

    socket.on('state:update', (newState: IGlobalState) => {
      console.log('📡 State update received')
      setState(newState)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-[#F5F0E8] p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#C41E3A]">
          🏯 AI Team Monitor Pro
        </h1>
        <p className="text-[#D4A574] mt-2">明代赛博朋克 · 团队监控面板</p>
        <div className="mt-2 text-sm">
          {connected ? (
            <span className="text-[#00D4AA]">● 已连接</span>
          ) : (
            <span className="text-red-400">● 未连接</span>
          )}
        </div>
      </header>

      {state && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {state.agents.map((agent) => (
            <div
              key={agent.id}
              className="bg-[#1A1A2E] border border-[#D4A574]/30 rounded-lg p-4 hover:border-[#C41E3A] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#C41E3A]/20 flex items-center justify-center text-lg">
                  {agent.id === 'tangbohu' ? '🎯' : agent.id === 'zhuzhishan' ? '💻' : agent.id === 'qiuxiang' ? '🎨' : '🎵'}
                </div>
                <div>
                  <h3 className="font-bold text-[#D4A574]">{agent.name}</h3>
                  <p className="text-xs text-[#F5F0E8]/60">{agent.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={
                  agent.status === 'working' ? 'text-[#00D4AA]' :
                  agent.status === 'resting' ? 'text-[#4A9EFF]' :
                  agent.status === 'discussing' ? 'text-[#D4A574]' :
                  'text-[#C41E3A]'
                }>
                  {agent.status === 'working' ? '⚡ 工作中' :
                   agent.status === 'resting' ? '😴 休息中' :
                   agent.status === 'discussing' ? '💬 讨论中' :
                   '☕ 咖啡时间'}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xs text-[#F5F0E8]/40 mb-1">效率 {agent.productivity}%</div>
                <div className="w-full bg-[#0D0D1A] rounded-full h-1.5">
                  <div
                    className="bg-[#00D4AA] h-1.5 rounded-full transition-all"
                    style={{ width: `${agent.productivity}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {state && (
        <div className="max-w-6xl mx-auto mt-8 text-center">
          <div className="inline-block bg-[#1A1A2E] border border-[#D4A574]/30 rounded-lg px-6 py-3">
            <span className="text-[#D4A574]">💰 项目余额：</span>
            <span className="text-2xl font-bold text-[#00D4AA] ml-2">
              ¥{state.balance.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {!state && connected && (
        <div className="text-center text-[#F5F0E8]/40 mt-12">
          等待状态数据...
        </div>
      )}

      {!connected && (
        <div className="text-center text-red-400/60 mt-12">
          连接服务器中... 请确保后端运行在 localhost:3001
        </div>
      )}
    </div>
  )
}

export default App

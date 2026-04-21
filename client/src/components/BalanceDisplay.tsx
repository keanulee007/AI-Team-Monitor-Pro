import React from 'react';
import { useBalance, useTotalSpent } from '../store';

const BalanceDisplay: React.FC = () => {
  const balance = useBalance();
  const totalSpent = useTotalSpent();

  // 计算余额状态
  const getBalanceStatus = () => {
    if (balance > 50000) return 'healthy';
    if (balance > 20000) return 'warning';
    return 'critical';
  };

  const status = getBalanceStatus();
  
  // 状态颜色
  const statusColors = {
    healthy: {
      bg: 'bg-[#1A1A2E]',
      border: 'border-[#00D4AA]/30',
      text: 'text-[#00D4AA]',
      icon: '💰',
    },
    warning: {
      bg: 'bg-[#2A1A1A]',
      border: 'border-[#D4A574]/30',
      text: 'text-[#D4A574]',
      icon: '⚠️',
    },
    critical: {
      bg: 'bg-[#2A1A1A]',
      border: 'border-[#C41E3A]/30',
      text: 'text-[#C41E3A]',
      icon: '🔥',
    },
  };

  const colors = statusColors[status];

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-[#F5F0E8]">模型余额</h3>
          <p className="text-sm text-[#F5F0E8]/60 mt-1">《机械之心》项目资金</p>
        </div>
        <div className="text-3xl">{colors.icon}</div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#F5F0E8]/80">当前余额</span>
            <span className={`text-2xl font-bold ${colors.text}`}>
              ¥{balance.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-[#0D0D15] rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                status === 'healthy' ? 'bg-[#00D4AA]' :
                status === 'warning' ? 'bg-[#D4A574]' :
                'bg-[#C41E3A]'
              }`}
              style={{ width: `${Math.min(100, (balance / 100000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0D0D15]/50 rounded-lg p-3">
            <div className="text-sm text-[#F5F0E8]/60">累计消耗</div>
            <div className="text-lg font-semibold text-[#D4A574]">
              ¥{totalSpent.toLocaleString()}
            </div>
          </div>
          <div className="bg-[#0D0D15]/50 rounded-lg p-3">
            <div className="text-sm text-[#F5F0E8]/60">日均消耗</div>
            <div className="text-lg font-semibold text-[#D4A574]">
              ¥{Math.round(totalSpent / 30).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F5F0E8]/10">
          <div className="text-sm text-[#F5F0E8]/60">
            {status === 'healthy' && '✅ 资金充足，项目运行正常'}
            {status === 'warning' && '⚠️ 资金预警，建议关注消耗情况'}
            {status === 'critical' && '🔥 资金紧张，需要及时补充'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceDisplay;
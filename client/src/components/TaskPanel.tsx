import React from 'react';
import type { ITask, TaskStatus } from '../../../shared/types';
import { useTasks } from '../store';
import { useSocket } from '../hooks';

const TaskPanel: React.FC = () => {
  const tasks = useTasks();
  const { sendTaskUpdateStatus } = useSocket();

  // 按状态分组任务
  const tasksByStatus: Record<TaskStatus, ITask[]> = {
    'todo': [],
    'in-progress': [],
    'review': [],
    'done': [],
  };

  tasks.forEach(task => {
    tasksByStatus[task.status].push(task);
  });

  // 状态配置
  const statusConfig: Record<TaskStatus, { title: string; color: string; bgColor: string }> = {
    'todo': { title: '待办', color: 'text-gray-400', bgColor: 'bg-gray-800' },
    'in-progress': { title: '进行中', color: 'text-blue-400', bgColor: 'bg-blue-900/30' },
    'review': { title: '审查中', color: 'text-purple-400', bgColor: 'bg-purple-900/30' },
    'done': { title: '已完成', color: 'text-green-400', bgColor: 'bg-green-900/30' },
  };

  // 优先级颜色
  const priorityColors: Record<ITask['priority'], string> = {
    'low': 'bg-gray-500',
    'medium': 'bg-yellow-500',
    'high': 'bg-orange-500',
    'urgent': 'bg-red-500',
  };

  // 优先级文本
  const priorityText: Record<ITask['priority'], string> = {
    'low': '低',
    'medium': '中',
    'high': '高',
    'urgent': '紧急',
  };

  // 处理状态更新
  const handleStatusUpdate = (taskId: string, newStatus: TaskStatus) => {
    sendTaskUpdateStatus(taskId, newStatus);
  };

  // 渲染任务卡片
  const renderTaskCard = (task: ITask) => {
    const assigneeName = task.assignee === 'tangbohu' ? '唐伯虎' :
                        task.assignee === 'zhuzhishan' ? '祝枝山' :
                        task.assignee === 'qiuxiang' ? '秋香' :
                        task.assignee === 'shiliujie' ? '石榴姐' : '未知';

    const daysLeft = Math.ceil((task.deadline - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <div
        key={task.id}
        className="mb-3 p-4 rounded-lg border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:shadow-lg cursor-pointer group"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(37, 37, 66, 0.8) 100%)',
        }}
        onClick={() => handleStatusUpdate(task.id, getNextStatus(task.status))}
      >
        {/* 任务标题和优先级 */}
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-white text-sm flex-1 mr-2">{task.title}</h4>
          <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[task.priority]} text-white`}>
            {priorityText[task.priority]}
          </span>
        </div>

        {/* 任务描述 */}
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>

        {/* 任务信息 */}
        <div className="flex justify-between items-center text-xs">
          {/* 负责人 */}
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs mr-2">
              {assigneeName.charAt(0)}
            </div>
            <span className="text-gray-300">{assigneeName}</span>
          </div>

          {/* 截止时间 */}
          <div className={`px-2 py-1 rounded ${daysLeft <= 1 ? 'bg-red-900/50 text-red-300' : 'bg-gray-800 text-gray-400'}`}>
            {daysLeft > 0 ? `${daysLeft}天` : '已过期'}
          </div>
        </div>

        {/* 状态转换提示 */}
        <div className="mt-2 text-xs text-center text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          点击切换到 {statusConfig[getNextStatus(task.status)].title}
        </div>
      </div>
    );
  };

  // 获取下一个状态
  const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
    const statusOrder: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return statusOrder[(currentIndex + 1) % statusOrder.length];
  };

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">任务看板</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(tasksByStatus).map(([status, tasks]) => {
          const config = statusConfig[status as TaskStatus];
          
          return (
            <div 
              key={status}
              className="rounded-xl p-4 border border-gray-800"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 16, 28, 0.9) 0%, rgba(32, 32, 48, 0.9) 100%)',
              }}
            >
              {/* 列标题 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${config.bgColor.replace('bg-', 'bg-').replace('/30', '')}`} />
                  <h3 className={`font-bold ${config.color}`}>{config.title}</h3>
                </div>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                  {tasks.length} 项
                </span>
              </div>

              {/* 任务列表 */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {tasks.length > 0 ? (
                  tasks.map(renderTaskCard)
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-gray-500 text-sm">暂无任务</p>
                  </div>
                )}
              </div>

              {/* 添加新任务按钮 */}
              {status === 'todo' && (
                <button
                  className="w-full mt-4 py-2 text-sm bg-gradient-to-r from-gray-800 to-gray-900 text-gray-400 rounded-lg border border-gray-700 hover:border-gray-600 hover:text-gray-300 transition-all"
                  onClick={() => {/* TODO: 实现添加任务功能 */}}
                >
                  + 添加新任务
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 统计信息 */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-gray-900/50">
            <div className="text-2xl font-bold text-white">{tasks.length}</div>
            <div className="text-sm text-gray-400">总任务数</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-blue-900/30">
            <div className="text-2xl font-bold text-blue-400">{tasksByStatus['in-progress'].length}</div>
            <div className="text-sm text-gray-400">进行中</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-purple-900/30">
            <div className="text-2xl font-bold text-purple-400">{tasksByStatus['review'].length}</div>
            <div className="text-sm text-gray-400">待审查</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-green-900/30">
            <div className="text-2xl font-bold text-green-400">{tasksByStatus['done'].length}</div>
            <div className="text-sm text-gray-400">已完成</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPanel;
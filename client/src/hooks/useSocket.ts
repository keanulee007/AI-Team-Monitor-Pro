import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStoreActions } from '../store';
import type { IGlobalState, IAgentState, ITask, IActivity } from '../../../shared/types';

const SOCKET_URL = 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { updateState, updateAgent, updateTask, updateBalance, addActivity } = useStoreActions();

  useEffect(() => {
    // 创建Socket连接
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // 连接成功
    socket.on('connect', () => {
      console.log('Socket.io connected:', socket.id);
      addActivity({
        id: `socket-connect-${Date.now()}`,
        agentId: 'system',
        type: 'system',
        message: 'Socket.io连接已建立',
        timestamp: Date.now(),
      });
    });

    // 连接错误
    socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error);
      addActivity({
        id: `socket-error-${Date.now()}`,
        agentId: 'system',
        type: 'system',
        message: `Socket.io连接错误: ${error.message}`,
        timestamp: Date.now(),
      });
    });

    // 断开连接
    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
      addActivity({
        id: `socket-disconnect-${Date.now()}`,
        agentId: 'system',
        type: 'system',
        message: `Socket.io连接断开: ${reason}`,
        timestamp: Date.now(),
      });
    });

    // 监听状态更新事件
    socket.on('state:update', (state: IGlobalState) => {
      console.log('Received state:update:', state);
      updateState(state);
    });

    // 监听Agent状态更新事件
    socket.on('agent:status', (agent: IAgentState) => {
      console.log('Received agent:status:', agent);
      updateAgent(agent);
      
      // 添加活动日志
      addActivity({
        id: `agent-status-${Date.now()}`,
        agentId: agent.id,
        type: 'status_change',
        message: `${agent.name}状态变更为: ${agent.status}`,
        timestamp: Date.now(),
      });
    });

    // 监听任务更新事件
    socket.on('task:update', (task: ITask) => {
      console.log('Received task:update:', task);
      updateTask(task);
      
      // 添加活动日志
      const statusMap = {
        'todo': '待办',
        'in-progress': '进行中',
        'review': '审查中',
        'done': '已完成',
      };
      
      addActivity({
        id: `task-update-${Date.now()}`,
        agentId: task.assignee,
        type: 'task_update',
        message: `任务"${task.title}"状态变更为: ${statusMap[task.status]}`,
        timestamp: Date.now(),
      });
    });

    // 监听余额变化事件
    socket.on('balance:change', (balance: number, totalSpent: number) => {
      console.log('Received balance:change:', { balance, totalSpent });
      updateBalance(balance, totalSpent);
      
      // 添加活动日志
      // 注意：这里我们无法直接获取当前balance，所以使用传入的balance
      const change = 0; // 简化处理，实际应该计算变化量
      addActivity({
        id: `balance-change-${Date.now()}`,
        agentId: 'system',
        type: 'system',
        message: `余额更新: ${change >= 0 ? '+' : ''}${change.toLocaleString()} (总计: ${balance.toLocaleString()})`,
        timestamp: Date.now(),
      });
    });

    // 监听新活动事件
    socket.on('activity:new', (activity: IActivity) => {
      console.log('Received activity:new:', activity);
      addActivity(activity);
    });

    // 清理函数
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [updateState, updateAgent, updateTask, updateBalance, addActivity]);

  // 发送Agent交互事件
  const sendAgentInteract = (agentId: string, action: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('agent:interact', agentId, action);
      console.log('Sent agent:interact:', { agentId, action });
    } else {
      console.warn('Socket not connected, cannot send agent:interact');
    }
  };

  // 发送创建任务事件
  const sendTaskCreate = (task: Omit<ITask, 'id' | 'createdAt'>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('task:create', task);
      console.log('Sent task:create:', task);
    } else {
      console.warn('Socket not connected, cannot send task:create');
    }
  };

  // 发送分配任务事件
  const sendTaskAssign = (taskId: string, agentId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('task:assign', taskId, agentId);
      console.log('Sent task:assign:', { taskId, agentId });
    } else {
      console.warn('Socket not connected, cannot send task:assign');
    }
  };

  // 发送更新任务状态事件
  const sendTaskUpdateStatus = (taskId: string, status: ITask['status']) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('task:update:status', taskId, status);
      console.log('Sent task:update:status:', { taskId, status });
    } else {
      console.warn('Socket not connected, cannot send task:update:status');
    }
  };

  // 检查连接状态
  const isConnected = () => {
    return socketRef.current?.connected || false;
  };

  // 获取socket实例
  const getSocket = () => {
    return socketRef.current;
  };

  return {
    sendAgentInteract,
    sendTaskCreate,
    sendTaskAssign,
    sendTaskUpdateStatus,
    isConnected,
    getSocket,
  };
};

// 导出默认hook
export default useSocket;
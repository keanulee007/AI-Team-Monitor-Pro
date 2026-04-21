import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useStoreActions } from '../store';
import type { IGlobalState, IAgentState, ITask, IActivity } from '../../../shared/types';

const SOCKET_URL = 'http://localhost:3001';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { updateState, updateAgent, updateTask, updateBalance, addActivity } = useStoreActions();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket.io connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket.io error:', error.message);
      setIsConnected(false);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
      setIsConnected(false);
    });

    socket.on('state:update', (state: IGlobalState) => {
      updateState(state);
    });

    socket.on('agent:status', (agent: IAgentState) => {
      updateAgent(agent);
    });

    socket.on('task:update', (task: ITask) => {
      updateTask(task);
    });

    socket.on('balance:change', (balance: number, totalSpent: number) => {
      updateBalance(balance, totalSpent);
    });

    socket.on('activity:new', (activity: IActivity) => {
      addActivity(activity);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [updateState, updateAgent, updateTask, updateBalance, addActivity]);

  const sendAgentInteract = (agentId: string, action: string) => {
    socketRef.current?.emit('agent:interact', agentId, action);
  };

  const sendTaskCreate = (task: Omit<ITask, 'id' | 'createdAt'>) => {
    socketRef.current?.emit('task:create', task);
  };

  return { isConnected, sendAgentInteract, sendTaskCreate };
};

export default useSocket;

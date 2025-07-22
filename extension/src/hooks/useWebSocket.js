import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const ws = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!url) return;

    console.log('🔌 Attempting WebSocket connection...');
    setConnectionStatus('connecting');
    
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      setIsConnected(true);
      setError(null);
      setConnectionStatus('connected');
      reconnectAttempts.current = 0; // Reset attempts on successful connection
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received WebSocket message:', data);
        setLastMessage(data);
      } catch (e) {
        console.error('❌ Error parsing WebSocket message:', e);
        setError('Failed to parse server message');
      }
    };

    ws.current.onerror = (err) => {
      console.error('❌ WebSocket error:', err);
      setError('WebSocket connection error');
      setConnectionStatus('error');
    };

    ws.current.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Clear any existing reconnect timeout
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }

      // Only attempt reconnection if not a clean close and under max attempts
      if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.min(Math.pow(2, reconnectAttempts.current) * 1000, 30000);
        console.log(`🔄 Attempting to reconnect in ${timeout / 1000}s... (Attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        
        setConnectionStatus('reconnecting');
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current++;
          connect();
        }, timeout);
      } else if (reconnectAttempts.current >= maxReconnectAttempts) {
        setError('Failed to reconnect after multiple attempts');
        setConnectionStatus('failed');
      }
    };
  }, [url]);

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [connect]);

  const sendMessage = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      if (typeof data === 'string') {
        ws.current.send(data);
      } else {
        ws.current.send(JSON.stringify(data));
      }
      return true;
    } else {
      console.error('❌ Cannot send message: WebSocket is not open');
      return false;
    }
  }, []);
  
  const sendBinary = useCallback((data) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(data); // Send ArrayBuffer directly
      return true;
    } else {
      console.error('❌ Cannot send binary data: WebSocket is not open');
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close(1000, 'Manual disconnect');
    }
  }, []);

  return { 
    isConnected, 
    lastMessage, 
    error, 
    connectionStatus,
    sendMessage, 
    sendBinary,
    disconnect 
  };
}; 
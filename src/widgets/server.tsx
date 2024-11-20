import { 
    usePlugin, 
    renderWidget, 
    useTracker,
  } from '@remnote/plugin-sdk';
  import { createRem } from '../lib/api';
  import { useState, useEffect } from 'react';
//   import WebSocket, { WebSocketServer } from 'ws';
//   import WebSocket from 'ws';
import WebSocket, { WebSocketServer as WSWebSocketServer } from 'ws';
const WebSocketServer = WebSocket.Server || WSWebSocketServer;

  interface LogEntry {
    timestamp: string;
    type: 'request' | 'response' | 'error';
    message: string;
  }
  
  function ServerWidget() {
    const plugin = usePlugin();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [port, setPort] = useState<number>(3333);
  
    // Load port from plugin storage
    useEffect(() => {
      plugin.storage.getSession('wsPort').then((savedPort) => {
        if (savedPort) {
          setPort(Number(savedPort));
        }
      });
    }, []);
  
    const addLog = (type: 'request' | 'response' | 'error', message: string) => {
      setLogs(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        type,
        message
      }, ...prev.slice(0, 49)]); // Keep last 50 logs
    };
  
    useTracker(async (reactApi) => {
      try {
        const wss = new WebSocketServer({ port });

        wss.on('connection', (ws: WebSocket) => {
            addLog('response', 'New client connected.');
          
            // Handle messages from the client
            ws.on('message', (message: string) => {
              addLog('request', `Received: ${message}`);
          
              // Echo the message back to the client
              ws.send(`Server received: ${message}`);
            });
          
            // Handle client disconnection
            ws.on('close', () => {
              addLog('response', 'Client disconnected.');
            });
          
            // Handle errors
            ws.on('error', (error) => {
              addLog('error', 'WebSocket error:' + error);
            });
          
            // Send a welcome message
            ws.send('Welcome to the WebSocket server!');
          });

          return () => {wss.close();}

        /**
        server.onopen = () => {
          setIsConnected(true);
          addLog('response', `Connected on port ${port}`);
        };
  
        server.onclose = () => {
          setIsConnected(false);
          addLog('error', 'Connection closed');
        };
  
        server.onerror = (error) => {
          addLog('error', `WebSocket error: ${error.toString()}`);
        };
  
        server.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            addLog('request', `Received: ${JSON.stringify(data)}`);
  
            if (data.action === 'createRem') {
              try {
                const rem = await createRem(plugin, data.text, data.parentId);
                if(rem) {
                    server.send(JSON.stringify({ 
                      success: true, 
                      remId: rem._id 
                    }));
                    addLog('response', `Created rem: ${rem._id}`);
                }
              } catch (error) {
                server.send(JSON.stringify({ 
                  success: false, 
                  error: error
                }));
                addLog('error', `Failed to create rem: ${error}`);
              }
            }
          } catch (error) {
            addLog('error', `Failed to parse message: ${error}`);
          }
        };
  
        return () => {
          server.close();
        };
        */
      } catch (error) {
        addLog('error', `Failed to start server: ${error}`);
      }
    }, [port]);
  
    const handlePortChange = async (newPort: number) => {
      if (newPort >= 1024 && newPort <= 65535) {
        await plugin.storage.setSession('wsPort', newPort.toString());
        setPort(newPort);
        addLog('response', `Port changed to ${newPort}`);
      } else {
        addLog('error', 'Invalid port number (must be between 1024 and 65535)');
      }
    };
  
    return (
      <div className="p-4 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span>WebSocket Port:</span>
            <input 
              type="number" 
              value={port}
              onChange={(e) => handlePortChange(Number(e.target.value))}
              className="w-24 p-1 border rounded"
              min="1024"
              max="65535"
            />
            <div className={`ml-2 px-2 py-1 rounded ${isConnected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
        <span>Connection Logs:</span>
          <div className="h-64 overflow-y-auto border rounded p-2">
            {logs.map((log, i) => (
              <div key={i} className="text-sm mb-1">
                <span className="text-gray-500">{log.timestamp}</span>
                <span className={`ml-2 ${
                  log.type === 'error' ? 'text-red-500' : 
                  log.type === 'request' ? 'text-blue-500' : 
                  'text-green-500'
                }`}>
                  {log.type.toUpperCase()}
                </span>
                <span className="ml-2">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
renderWidget(ServerWidget);
import { usePlugin, renderWidget, useTracker } from '@remnote/plugin-sdk';
import { createRem } from '../lib/api';

// Simple server that listens for requests
function ServerWidget() {
  const plugin = usePlugin();
  const port = 3333; // You can configure this

  useTracker(async (reactApi) => {
    // Set up a simple web server to listen for requests from n8n
    const server = new WebSocket(`ws://localhost:${port}`);
    
    server.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === 'createRem') {
          const rem = await createRem(plugin, data.text, data.parentId);
          if(rem) {
              server.send(JSON.stringify({ 
                success: true, 
                remId: rem._id 
              }));
          }
        }
      } catch (error) {
        server.send(JSON.stringify({ 
          success: false, 
          error
        }));
      }
    };

    return () => {
      server.close();
    };
  });

  return null;
}

renderWidget(ServerWidget);
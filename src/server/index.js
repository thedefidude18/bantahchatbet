import { WebSocketServer } from 'ws';
import { supabase } from '../lib/supabase.js';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    const message = JSON.parse(data);
    
    // Verify user with Supabase
    supabase.auth.getUser(message.token)
      .then(({ data: { user } }) => {
        if (!user) {
          ws.send(JSON.stringify({ error: 'Unauthorized' }));
          return;
        }
        
        // Process message
        const recipient = message.to;
        const content = message.content;
        
        // Broadcast to recipient
        wss.clients.forEach(client => {
          if (client.userId === recipient) {
            client.send(JSON.stringify({
              from: user.id,
              content: content
            }));
          }
        });
      });
  });
});

console.log('WebSocket server running on ws://localhost:8080');
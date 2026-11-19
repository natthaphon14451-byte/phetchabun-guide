const localtunnel = require('localtunnel');

const SUBDOMAIN = 'phetchabun-guide-bot';
const PORT = 3000;

// Keep process alive indefinitely
setInterval(() => {}, 1000 * 3600);

let activeTunnel = null;

async function startTunnel() {
  try {
    if (activeTunnel) {
      try { activeTunnel.close(); } catch (e) {}
    }
    console.log(`Connecting tunnel on port ${PORT}...`);
    activeTunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });
    
    console.log('====================================================');
    console.log(`📡 TUNNEL CONNECTED!`);
    console.log(`🌐 Public URL:   ${activeTunnel.url}`);
    console.log(`🔗 Webhook URL:  ${activeTunnel.url}/webhook`);
    console.log('====================================================');

    activeTunnel.on('close', () => {
      console.log('Tunnel closed event. Reconnecting in 3 seconds...');
      setTimeout(startTunnel, 3000);
    });

    activeTunnel.on('error', (err) => {
      console.error('Tunnel error:', err.message);
      setTimeout(startTunnel, 5000);
    });
  } catch (err) {
    console.error('Failed to start tunnel:', err.message);
    setTimeout(startTunnel, 5000);
  }
}

// Periodic health check
setInterval(() => {
  if (!activeTunnel || activeTunnel.closed) {
    console.log('Tunnel health check: restarting tunnel...');
    startTunnel();
  }
}, 30000);

startTunnel();

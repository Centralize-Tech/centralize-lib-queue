export default {
  host: process.env.QUEUE_HOST || 'localhost',
  port: process.env.QUEUE_PORT || 5672,
  user: process.env.QUEUE_USER || 'user',
  passwd: process.env.QUEUE_PASSWD || 'user',
  vhost: process.env.QUEUE_VHOST || '',
  useSSL: process.env.QUEUE_USE_SSL || 'false',
  consolePort: process.env.QUEUE_CONSOLE_PORT || 15672,
  consoleUser: process.env.QUEUE_CONSOLE_USER || 'root',
  consolePasswd: process.env.QUEUE_CONSOLE_PASSWD || 'legaiamq',
  connectionHeartbeat: process.env.QUEUE_SERVER_CONNECTION_HEARTBEAT || 5,
}

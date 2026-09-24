import { Platform } from 'react-native';
import { io } from 'socket.io-client';
export type LocalConfig = { hostname: string; webUiPort: number; cameraPort: number; cameraPath: string };
export function validateLocalHost(value: string) { const host = value.trim().toLowerCase(); if (!/^(localhost|[a-z0-9.-]+\.local|(?:\d{1,3}\.){3}\d{1,3})$/.test(host)) throw new Error('Enter a local hostname or LAN IP address.'); return host; }
export async function checkLocalDevice(config: LocalConfig, timeoutMs = 4000) { const host = validateLocalHost(config.hostname); const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), timeoutMs); try { const response = await fetch(`http://${host}:${config.webUiPort}/`, { method: 'HEAD', signal: controller.signal }); return response.ok || response.status < 500; } finally { clearTimeout(timer); } }
export function cameraUrl(config: LocalConfig) { const host = validateLocalHost(config.hostname); return `http://${host}:${config.cameraPort}${config.cameraPath.startsWith('/') ? config.cameraPath : `/${config.cameraPath}`}`; }
export const cameraSupported = Platform.OS === 'web';
export function subscribeToLocalDetections(config: LocalConfig, onDetection: (value: { content: string; confidence: number; timestamp?: string }) => void) {
  const host = validateLocalHost(config.hostname);
  const socket = io(`http://${host}:${config.webUiPort}`, { transports: ['websocket'], timeout: 4000, reconnection: true });
  socket.on('detection', value => {
    const label = String(value?.content || '').toLowerCase();
    if (label === 'rat' || label === 'snake') onDetection({ ...value, content: label });
  });
  return () => { socket.disconnect(); };
}

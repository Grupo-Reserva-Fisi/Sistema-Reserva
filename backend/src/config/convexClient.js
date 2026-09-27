import { ConvexHttpClient } from 'convex/browser';

let convexClient = null;

const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;

if (convexUrl) {
  try {
    convexClient = new ConvexHttpClient(convexUrl);
    console.log(`[Convex] Cliente HTTP inicializado conectado a: ${convexUrl}`);
  } catch (err) {
    console.warn('[Convex] Error al inicializar cliente Convex:', err.message);
  }
}

export function getConvexClient() {
  return convexClient;
}

export const isConvexActive = () => !!convexClient;

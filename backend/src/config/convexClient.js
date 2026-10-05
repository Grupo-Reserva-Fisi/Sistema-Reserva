import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ConvexHttpClient } from 'convex/browser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

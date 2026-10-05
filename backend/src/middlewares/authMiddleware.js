import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fisi_unmsm_jwt_super_secret_key_2026';

export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso no autorizado: Token requerido.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Formato de token inválido. Use Bearer <token>.' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}

export function verifyRole(rolRequerido) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Acceso no autenticado.' });
    }
    if (req.user.rol !== rolRequerido) {
      return res.status(403).json({ message: `Acceso restringido: Se requiere rol '${rolRequerido}'.` });
    }
    next();
  };
}


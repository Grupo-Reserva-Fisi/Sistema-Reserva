import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";

// Obtener usuario por Código o DNI
export const getByCodigoDni = query({
  args: { codigoDni: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_codigo_dni", (q) => q.eq("codigoDni", args.codigoDni))
      .first();
  }
});

// Obtener usuario por Correo
export const getByEmail = query({
  args: { correo: v.string() },
  handler: async (ctx, args) => {
    const correo = args.correo.trim().toLowerCase();
    return await ctx.db
      .query("users")
      .withIndex("by_correo", (q) => q.eq("correo", correo))
      .first();
  }
});

// Obtener usuario por ID de Convex
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});

// Registrar nuevo usuario
export const register = mutation({
  args: {
    codigoDni: v.string(),
    nombre: v.string(),
    correo: v.string(),
    passwordHash: v.string(),
    rol: v.union(
      v.literal("alumno"),
      v.literal("docente"),
      v.literal("administrativo"),
      v.literal("foraneo"),
      v.literal("externo")
    ),
    codigoTrabajador: v.optional(v.string()),
    estadoValidacion: v.optional(
      v.union(
        v.literal("aprobado"),
        v.literal("pendiente"),
        v.literal("rechazado")
      )
    )
  },
  handler: async (ctx, args) => {
    const correo = args.correo.trim().toLowerCase();
    const codigoDni = args.codigoDni.trim();

    // Validar duplicidad
    const usuarioExistente = await ctx.db
      .query("users")
      .withIndex("by_correo", (q) => q.eq("correo", correo))
      .first();

    if (usuarioExistente) {
      throw new Error("Ya existe un usuario registrado con este correo.");
    }

    const dniExistente = await ctx.db
      .query("users")
      .withIndex("by_codigo_dni", (q) => q.eq("codigoDni", codigoDni))
      .first();

    if (dniExistente) {
      throw new Error("El DNI o código ya se encuentra registrado.");
    }

    const estadoValidacion = args.estadoValidacion || (args.rol === "administrativo" ? "pendiente" : "aprobado");

    const id = await ctx.db.insert("users", {
      codigoDni,
      nombre: args.nombre.trim(),
      correo,
      passwordHash: args.passwordHash,
      rol: args.rol,
      codigoTrabajador: args.codigoTrabajador ? args.codigoTrabajador.trim() : undefined,
      estadoValidacion,
      fechaRegistro: Date.now(),
      intentosFallidos: 0,
      bloqueado: false
    });

    return {
      success: true,
      userId: id,
      user: {
        id,
        codigoDni,
        nombre: args.nombre.trim(),
        correo,
        rol: args.rol,
        codigoTrabajador: args.codigoTrabajador ? args.codigoTrabajador.trim() : undefined,
        estadoValidacion
      }
    };
  }
});

// Actualizar intentos fallidos y estado de bloqueo
export const updateIntentos = mutation({
  args: {
    id: v.id("users"),
    intentos: v.number(),
    bloqueado: v.boolean()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      intentosFallidos: args.intentos,
      bloqueado: args.bloqueado
    });
  }
});

// Reiniciar intentos fallidos tras login exitoso
export const resetIntentos = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      intentosFallidos: 0,
      bloqueado: false
    });
  }
});

// Asignar código OTP de recuperación
export const setResetToken = mutation({
  args: {
    id: v.id("users"),
    token: v.string(),
    expiracion: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      tokenRecuperacion: args.token,
      tokenExpiracion: args.expiracion
    });
  }
});

// Actualizar contraseña y desbloquear cuenta
export const updatePassword = mutation({
  args: {
    id: v.id("users"),
    passwordHash: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      passwordHash: args.passwordHash,
      tokenRecuperacion: undefined,
      tokenExpiracion: undefined,
      intentosFallidos: 0,
      bloqueado: false
    });
  }
});

// Obtener usuarios pendientes de validación administrativa (HU-U02)
export const getPendingValidation = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_estado_validacion", (q) => q.eq("estadoValidacion", "pendiente"))
      .collect();
  }
});

// Aprobar registro administrativo (HU-U02)
export const approveUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      estadoValidacion: "aprobado",
      motivoRechazo: undefined
    });
    return { success: true };
  }
});

// Rechazar registro administrativo con motivo (HU-U02)
export const rejectUser = mutation({
  args: {
    id: v.id("users"),
    motivo: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      estadoValidacion: "rechazado",
      motivoRechazo: args.motivo.trim()
    });
    return { success: true };
  }
});


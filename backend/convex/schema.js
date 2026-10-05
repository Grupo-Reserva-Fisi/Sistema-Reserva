import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
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
    ),
    motivoRechazo: v.optional(v.string()),
    fechaRegistro: v.number(),
    intentosFallidos: v.number(),
    bloqueado: v.boolean(),
    tokenRecuperacion: v.optional(v.string()),
    tokenExpiracion: v.optional(v.number())
  })
    .index("by_correo", ["correo"])
    .index("by_codigo_dni", ["codigoDni"])
    .index("by_estado_validacion", ["estadoValidacion"])
});

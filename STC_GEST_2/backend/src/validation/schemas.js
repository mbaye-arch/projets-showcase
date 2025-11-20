import { z } from 'zod';

const dateField = z.coerce.date().optional().nullable();

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const materielSchema = z.object({
  reference: z.string().trim().min(1).max(120).optional().nullable(),
  nom: z.string().trim().min(1).max(200),
  marque: z.string().trim().max(120).optional().nullable(),
  modele: z.string().trim().max(120).optional().nullable(),
  categorie: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable()
});

export const materielUpdateSchema = materielSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Aucune donnée à mettre à jour'
);

export const stockSchema = z.object({
  materielId: z.coerce.number().int().positive(),
  numeroInventaire: z.string().trim().min(1).max(120).optional().nullable(),
  codeBarresValeur: z.string().trim().max(200).optional().nullable(),
  qrCodeValeur: z.string().trim().max(512).optional().nullable(),
  quantiteActuelle: z.coerce.number().int().min(0).default(0),
  stockMinimum: z.coerce.number().int().min(0).default(0),
  emplacement: z.string().trim().max(200).optional().nullable(),
  prixAchat: z.coerce.number().min(0).default(0),
  dateAchat: dateField,
  dateReception: dateField,
  datePremiereEntree: dateField,
  dateDerniereEntree: dateField,
  dateDerniereSortie: dateField,
  dateDerniereReprise: dateField,
  dateFinGarantie: dateField
});

export const stockUpdateSchema = stockSchema
  .omit({ materielId: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'Aucune donnée à mettre à jour');

export const movementSchema = z.object({
  materielId: z.coerce.number().int().positive().optional(),
  numeroInventaire: z.string().trim().min(1).max(120).optional(),
  typeMouvement: z.enum(['ENTREE', 'SORTIE', 'RETOUR', 'AJUSTEMENT']),
  quantite: z.coerce.number().int().min(0).optional(),
  quantiteReelle: z.coerce.number().int().min(0).optional(),
  ecart: z.coerce.number().int().optional(),
  prixUnitaire: z.coerce.number().min(0).optional(),
  dateMouvement: z.coerce.date().optional(),
  dateAchat: dateField,
  dateReception: dateField,
  motif: z.string().trim().max(255).optional().nullable(),
  referenceDocument: z.string().trim().max(255).optional().nullable(),
  commentaire: z.string().trim().max(2000).optional().nullable()
}).refine((value) => value.materielId || value.numeroInventaire, {
  message: 'materielId ou numeroInventaire est obligatoire'
});

export const inventaireSchema = z.object({
  dateInventaire: z.coerce.date().optional(),
  commentaire: z.string().trim().max(2000).optional().nullable()
});

export const inventaireItemsSchema = z.object({
  appliquerAjustement: z.boolean().optional().default(true),
  items: z.array(
    z.object({
      materielId: z.coerce.number().int().positive(),
      quantiteReelle: z.coerce.number().int().min(0),
      commentaire: z.string().trim().max(2000).optional().nullable()
    })
  ).min(1)
});

export const settingsSchema = z.object({
  INVENTORY_FORMAT: z.string().trim().min(1).optional(),
  INVENTORY_PREFIX_DEFAULT: z.string().trim().min(1).max(20).optional(),
  INVENTORY_COUNTER_PADDING: z.coerce.number().int().min(1).max(8).optional(),
  INVENTORY_COUNTER_MODE: z.enum(['ANNUEL', 'GLOBAL']).optional(),
  QR_CODE_STRATEGY: z.enum(['INVENTORY_NUMBER', 'INTERNAL_URL']).optional(),
  QR_CODE_BASE_URL: z.string().trim().url().optional(),
  LABEL_DEFAULT_FORMAT: z.enum(['TINY', 'SMALL', 'STANDARD']).optional(),
  LABEL_DEFAULT_CONTENT: z.enum(['BARCODE', 'QRCODE', 'BOTH']).optional()
});

export const searchParamSchema = z.object({
  value: z.string().trim().min(1)
});

import { createServerFn } from '@tanstack/react-start'
import { db } from '@/lib/db/client'
import { contactMessages } from '@/lib/db/schema'
import { schemaContact } from '@/lib/validation'

export const envoyerMessageFn = createServerFn({ method: 'POST' })
  .validator(schemaContact)
  .handler(async ({ data }) => {
    await db.insert(contactMessages).values({
      name: data.nom,
      contact: data.contact,
      message: data.message,
    })
    return { succes: true }
  })

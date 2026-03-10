import { getGoogleSheets } from '../utils/google'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()
    const sheets = getGoogleSheets()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.spreadsheetId,
      range: 'master_pegawai!A2:E'
    })

    const rows = response.data.values || []

    // Bersihkan row tidak valid
    const cleanedRows = rows.filter(row =>
      Array.isArray(row) && row.length >= 5
    )

    // DEBUG
    console.log('BODY NIP:', body.nip)
    console.log('SHEET NIP LIST:')
    cleanedRows.forEach(row => {
      console.log('>', JSON.stringify(row[1]))
    })

    let user: string[] | null = null

    for (const row of cleanedRows) {
      const nipFromSheet = String(row[1] || '').trim()
      const nipFromBody = String(body.nip || '').trim()

      if (nipFromSheet === nipFromBody) {
        user = row
        break
      }
    }

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'NIP tidak ditemukan'
      })
    }

    const passwordHash = user[3]

    const isMatch = await bcrypt.compare(
      String(body.password || ''),
      passwordHash
    )

    if (!isMatch) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Password salah'
      })
    }

    setCookie(event, 'auth', 'true', { path: '/' })
    setCookie(event, 'nip', user[1], { path: '/' })
    setCookie(event, 'nama', user[2], { path: '/' })
    setCookie(event, 'role', user[4], { path: '/' })

    return { success: true }

  } catch (error: any) {
    console.error('LOGIN ERROR DETAIL:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Server Error'
    })
  }
})
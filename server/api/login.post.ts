import { getGoogleSheets } from '../utils/google'
import bcrypt from 'bcrypt'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()
  const sheets = getGoogleSheets()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.spreadsheetId,
    range: 'master_pegawai!A2:F'
  })

  const rows = response.data.values || []

  const user = rows.find(row => row[1] === body.nip)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'NIP tidak ditemukan'
    })
  }

  const passwordHash = user[3]

  const isMatch = await bcrypt.compare(body.password, passwordHash)

  if (!isMatch) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Password salah'
    })
  }

  // simpan cookie login
  setCookie(event, 'auth', 'true', { path: '/' })
  setCookie(event, 'nip', user[1], { path: '/' })
  setCookie(event, 'nama', user[2], { path: '/' })
  setCookie(event, 'role', user[4], { path: '/' })
  setCookie(event, 'seksi', user[5], { path: '/' })

  return { success: true }
})
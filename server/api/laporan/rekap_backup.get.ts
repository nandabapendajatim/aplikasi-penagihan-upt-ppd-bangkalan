import { getGoogleSheets } from '../../utils/google'
import { getQuery } from 'h3'
import { computeRekap } from '../../utils/rekapHelper'

export default defineEventHandler(async (event) => {

  const { bulan, tahun } = getQuery(event)

  const sheets = getGoogleSheets()
  const config = useRuntimeConfig()

  return await computeRekap({
    bulan,
    tahun,
    sheets,
    spreadsheetId: config.spreadsheetId
  })
})
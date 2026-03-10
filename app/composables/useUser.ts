// composables/useUser.ts
export const useUser = () => {
  const userNip = useCookie('nip')
  const userNama = useCookie('nama')
  const userRole = useCookie('role')

  return { userNip, userNama, userRole }
}
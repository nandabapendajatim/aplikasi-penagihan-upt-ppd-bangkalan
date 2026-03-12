export default defineNuxtRouteMiddleware(() => {

  const nip = useCookie('nip')

  if (!nip.value) {
    return navigateTo('/login')
  }

})
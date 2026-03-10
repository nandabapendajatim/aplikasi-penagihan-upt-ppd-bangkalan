export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useCookie('auth')

  if (!auth.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
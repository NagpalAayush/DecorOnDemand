export function verifyAdmin(request, response, next) {
  if (!request.user?.isAdmin) {
    response.status(403).json({ error: 'Administrator access is required.' })
    return
  }

  next()
}

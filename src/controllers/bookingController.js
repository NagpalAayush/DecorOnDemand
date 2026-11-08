import {
  createBooking,
  findBookingRequestsByListerId,
  findBookingsByUserId,
  updateBookingStatus,
} from '../models/bookingModel.js'

const allowedListerBookingStatuses = new Set(['confirmed', 'rejected'])

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export async function getMyBookingsController(request, response) {
  try {
    const bookings = await findBookingsByUserId(request.user.id)
    response.json({ bookings })
  } catch (error) {
    console.error('Booking retrieval failed:', error)
    response.status(500).json({ error: 'Unable to retrieve bookings.' })
  }
}

export async function getBookingRequestsController(request, response) {
  if (!request.user.isLister) {
    response.status(403).json({ error: 'Lister access is required.' })
    return
  }

  try {
    const bookings = await findBookingRequestsByListerId(request.user.id)
    response.json({ bookings })
  } catch (error) {
    console.error('Booking request retrieval failed:', error)
    response.status(500).json({ error: 'Unable to retrieve booking requests.' })
  }
}

export async function updateBookingStatusController(request, response) {
  if (!request.user.isLister) {
    response.status(403).json({ error: 'Lister access is required.' })
    return
  }

  const { bookingId } = request.params
  const { status } = request.body || {}

  if (!bookingId || bookingId.length !== 36) {
    response.status(400).json({ error: 'A valid bookingId is required.' })
    return
  }

  if (!allowedListerBookingStatuses.has(status)) {
    response.status(400).json({ error: 'status must be confirmed or rejected.' })
    return
  }

  try {
    const updated = await updateBookingStatus(bookingId, request.user.id, status)
    if (!updated) {
      response.status(404).json({ error: 'Pending booking request not found.' })
      return
    }

    response.json({ bookingId, status })
  } catch (error) {
    console.error('Booking status update failed:', error)
    response.status(500).json({ error: 'Unable to update booking status.' })
  }
}

export async function createBookingController(request, response) {
  const {
    listingId,
    eventDate,
    eventTime,
    address,
    city,
    notes,
    latitude,
    longitude,
  } = request.body || {}

  if (!isNonEmptyString(listingId) || !isNonEmptyString(eventDate) || !isNonEmptyString(address)) {
    response.status(400).json({ error: 'listingId, eventDate, and address are required.' })
    return
  }

  if (eventTime !== undefined && eventTime !== null && !isNonEmptyString(eventTime)) {
    response.status(400).json({ error: 'eventTime must be a non-empty string when provided.' })
    return
  }

  if (!Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90
    || !Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180) {
    response.status(400).json({ error: 'A valid booking location is required to verify the service area.' })
    return
  }

  try {
    const result = await createBooking({
      userId: request.user.id,
      listingId,
      eventDate,
      eventTime,
      address: address.trim(),
      city: city?.trim(),
      notes: notes?.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
    })

    if (!result) {
      response.status(404).json({ error: 'Only approved and published listings can be booked.' })
      return
    }

    if (result.outsideServiceArea) {
      response.status(422).json({
        error: result.distanceKm
          ? `This address is ${result.distanceKm.toFixed(1)} km away, outside the ${result.serviceRadiusKm} km setup service area.`
          : 'This setup does not have a valid service location configured.',
      })
      return
    }

    response.status(201).json({ booking: result.booking })
  } catch (error) {
    console.error('Booking creation failed:', error)
    response.status(500).json({ error: 'Unable to create booking.' })
  }
}

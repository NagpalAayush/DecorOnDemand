import { createBooking, findBookingsByUserId } from '../models/bookingModel.js'

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

export async function createBookingController(request, response) {
  const {
    listingId,
    eventDate,
    eventTime,
    address,
    city,
    notes,
  } = request.body || {}

  if (!isNonEmptyString(listingId) || !isNonEmptyString(eventDate) || !isNonEmptyString(address)) {
    response.status(400).json({ error: 'listingId, eventDate, and address are required.' })
    return
  }

  if (eventTime !== undefined && eventTime !== null && !isNonEmptyString(eventTime)) {
    response.status(400).json({ error: 'eventTime must be a non-empty string when provided.' })
    return
  }

  try {
    const booking = await createBooking({
      userId: request.user.id,
      listingId,
      eventDate,
      eventTime,
      address: address.trim(),
      city: city?.trim(),
      notes: notes?.trim(),
    })

    if (!booking) {
      response.status(404).json({ error: 'Only approved and published listings can be booked.' })
      return
    }

    response.status(201).json({ booking })
  } catch (error) {
    console.error('Booking creation failed:', error)
    response.status(500).json({ error: 'Unable to create booking.' })
  }
}

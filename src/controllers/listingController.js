import {
  createListing,
  findListingsByUserId,
  findListingsForApproval,
  findPublishedListings,
  findPublishedListingById,
  findPublishedListingsByUserId,
  updateListingApproval,
} from '../models/listingModel.js'

const allowedListingStatuses = new Set(['draft', 'published', 'archived'])

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function validateListingInput(body) {
  const {
    title,
    description,
    category,
    price,
    location,
    city,
    images = [],
    listingStatus = 'draft',
  } = body || {}

  if (!isNonEmptyString(title) || !isNonEmptyString(category) || !isNonEmptyString(location)) {
    return 'title, category, and location are required.'
  }

  const numericPrice = typeof price === 'string' && price.trim() !== '' ? Number(price) : price
  if (!Number.isFinite(numericPrice) || numericPrice <= 0 || numericPrice > 99999999.99) {
    return 'price must be a positive number no greater than 99999999.99.'
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    return 'description must be a string.'
  }

  if (city !== undefined && city !== null && !isNonEmptyString(city)) {
    return 'city must be a non-empty string when provided.'
  }

  if (!Array.isArray(images) || images.length > 10 || images.some((image) => !isNonEmptyString(image))) {
    return 'images must be an array of up to 10 non-empty strings.'
  }

  if (!allowedListingStatuses.has(listingStatus)) {
    return 'listingStatus must be draft, published, or archived.'
  }

  return null
}

export async function createListingController(request, response) {
  if (!request.user.isLister) {
    response.status(403).json({ error: 'Register as a lister before creating listings.' })
    return
  }

  const body = request.body || {}
  const validationError = validateListingInput(body)

  if (validationError) {
    response.status(400).json({ error: validationError })
    return
  }

  try {
    const listing = await createListing({
      userId: request.user.id,
      title: body.title.trim(),
      description: body.description?.trim(),
      category: body.category.trim(),
      price: typeof body.price === 'string' ? Number(body.price) : body.price,
      location: body.location.trim(),
      city: body.city?.trim(),
      images: body.images || [],
      listingStatus: body.listingStatus || 'draft',
    })

    response.status(201).json({ listing })
  } catch (error) {
    console.error('Listing creation failed:', error)
    response.status(500).json({ error: 'Unable to create the listing.' })
  }
}

export async function getMyListingsController(request, response) {
  try {
    const listings = await findListingsByUserId(request.user.id)
    response.json({ listings })
  } catch (error) {
    console.error('Listing retrieval failed:', error)
    response.status(500).json({ error: 'Unable to retrieve listings.' })
  }
}

export async function getListingsByUserIdController(request, response) {
  const { userId } = request.params

  if (!userId || userId.length !== 36) {
    response.status(400).json({ error: 'A valid userId is required.' })
    return
  }

  try {
    const listings = await findPublishedListingsByUserId(userId)
    response.json({ listings })
  } catch (error) {
    console.error('Public listing retrieval failed:', error)
    response.status(500).json({ error: 'Unable to retrieve listings.' })
  }
}

export async function getPublishedListingByIdController(request, response) {
  const { listingId } = request.params

  if (!listingId || listingId.length !== 36) {
    response.status(400).json({ error: 'A valid listingId is required.' })
    return
  }

  try {
    const listing = await findPublishedListingById(listingId)
    if (!listing) {
      response.status(404).json({ error: 'Listing not found.' })
      return
    }

    response.json({ listing })
  } catch (error) {
    console.error('Listing retrieval failed:', error)
    response.status(500).json({ error: 'Unable to retrieve the listing.' })
  }
}

export async function getPublishedListingsController(request, response) {
  try {
    const listings = await findPublishedListings()
    response.json({ listings })
  } catch (error) {
    console.error('Public listing retrieval failed:', error)
    response.status(500).json({ error: 'Unable to retrieve listings.' })
  }
}

export async function getListingsForApprovalController(request, response) {
  try {
    const listings = await findListingsForApproval()
    response.json({ listings })
  } catch (error) {
    console.error('Approval listing retrieval failed:', error)
    response.status(500).json({ error: 'Unable to retrieve listings for approval.' })
  }
}

export async function updateListingApprovalController(request, response) {
  const { listingId } = request.params
  const { approvalStatus, rejectionReason } = request.body || {}

  if (!['approved', 'rejected'].includes(approvalStatus)) {
    response.status(400).json({ error: 'approvalStatus must be approved or rejected.' })
    return
  }

  if (approvalStatus === 'rejected' && !isNonEmptyString(rejectionReason)) {
    response.status(400).json({ error: 'A rejection reason is required.' })
    return
  }

  try {
    const updated = await updateListingApproval(
      listingId,
      approvalStatus,
      approvalStatus === 'rejected' ? rejectionReason.trim() : null,
    )

    if (!updated) {
      response.status(404).json({ error: 'Listing not found.' })
      return
    }

    response.json({ approvalStatus })
  } catch (error) {
    console.error('Listing approval update failed:', error)
    response.status(500).json({ error: 'Unable to update listing approval.' })
  }
}

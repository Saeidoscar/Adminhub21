export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  bill: "لایحه",
  petition: "دادخواست",
  contract: "قرارداد",
  complaint: "شکواییه",
  statement: "اظهارنامه",
}

export const getProviderInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

export const formatToman = (price: number) =>
  `${price.toLocaleString("fa-IR")} تومان`

export const getAverageRating = (reviews: Array<{ rating: number }>) => {
  const ratings = reviews.map((review) => review.rating)

  return ratings.length
    ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
    : null
}

import { type Lang, t } from "../../i18n"
import { Stars } from "../../components/platform/Stars"
import { Button } from "../../components/ui/Button"
import { type ReviewRow } from "../../lib/api"

export function ReviewsTab({
  reviews,
  loading,
  reviewForm,
  setReviewForm,
  submitting,
  onSubmit,
  lang,
  tr,
}: {
  reviews: ReviewRow[]
  loading: boolean
  reviewForm: { rating: number; comment: string }
  setReviewForm: (form: { rating: number; comment: string }) => void
  submitting: boolean
  onSubmit: () => Promise<void>
  lang: Lang
  tr: typeof t["en"] & typeof t["fa"]
}) {
  const isFa = lang === "fa"

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-[#64748b]">
        {tr.common.loading}
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
        <h3 className="font-bold text-[#0f172a] text-lg mb-4">
          {isFa ? "ثبت نظر" : "Write a Review"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
              {isFa ? "امتیاز" : "Rating"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className={`text-2xl transition-colors ${
                    star <= reviewForm.rating
                      ? "text-amber-400"
                      : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
              {isFa ? "نظر شما" : "Your Review"}
            </label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm({ ...reviewForm, comment: e.target.value })
              }
              placeholder={isFa ? "تجربه خود را با دیگران به اشتراک بگذارید..." : "Share your experience..."}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
            />
          </div>
          <Button
            onClick={onSubmit}
            disabled={submitting || !reviewForm.comment.trim()}
          >
            {submitting ? tr.common.loading : isFa ? "ثبت نظر" : "Submit Review"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-[#0f172a] text-lg">
          {isFa ? `نظرات (${reviews.length})` : `Reviews (${reviews.length})`}
        </h3>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center text-[#64748b]">
            {isFa ? "هنوز نظری ثبت نشده" : "No reviews yet"}
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-[#e2e8f0] p-5"
            >
              <div className="flex items-center gap-2 mb-2">
                <Stars rating={review.rating} />
                <span className="text-sm font-bold text-[#0f172a]">
                  {review.rating}/5
                </span>
                <span className="text-xs text-[#94a3b8]">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-[#64748b] leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

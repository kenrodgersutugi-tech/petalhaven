import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  ThumbsUp, 
  MessageSquarePlus, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Loader2,
  SmilePlus,
  Heart,
  Lock,
  LogIn,
  UserCheck,
  User
} from 'lucide-react';
import { Product, ProductReview } from '../types';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

export interface ReviewComponentProps {
  product: Product;
  onReviewSubmitted?: (updatedRating: number, reviewCount: number) => void;
  onOpenAuth?: () => void;
}

const RATING_DESCRIPTIONS: Record<number, string> = {
  5: '5.0 - Exceptional & Loved it! 🌸',
  4: '4.0 - Very Good & Delightful ✨',
  3: '3.0 - Average / Meets Expectations',
  2: '2.0 - Fair / Room for Improvement',
  1: '1.0 - Poor / Disappointed',
};

export const ReviewComponent: React.FC<ReviewComponentProps> = ({
  product,
  onReviewSubmitted,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // New Review Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [authorName, setAuthorName] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Filter & Sort State
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');

  // Load reviews on product change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    reviewService.getReviews(product.id).then((res) => {
      if (isMounted) {
        setReviews(res.data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [product.id]);

  // Sync author name with user info
  useEffect(() => {
    if (user) {
      const defaultName = user.full_name || user.email.split('@')[0] || '';
      setAuthorName(defaultName);
    } else {
      setAuthorName('');
    }
  }, [user]);

  // Rating breakdown statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        average: product.rating || 5.0,
        total: product.review_count || 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>,
        percent5: 100,
      };
    }

    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
      sum += r.rating;
    });

    const average = Number((sum / total).toFixed(1));
    const percent5 = Math.round(((dist[5] || 0) / total) * 100);

    return {
      average,
      total,
      distribution: dist,
      percent5,
    };
  }, [reviews, product.rating, product.review_count]);

  // Filtered and sorted reviews list
  const displayReviews = useMemo(() => {
    let list = [...reviews];

    if (filterRating !== 'all') {
      list = list.filter((r) => r.rating === filterRating);
    }

    list.sort((a, b) => {
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'helpful') {
        return (b.helpful_count || 0) - (a.helpful_count || 0);
      }
      // default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [reviews, filterRating, sortBy]);

  // Submit new review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setFormError('You must be signed in to submit a review.');
      return;
    }

    if (!comment.trim()) {
      setFormError('Please write a brief comment describing your experience.');
      return;
    }
    if (!authorName.trim()) {
      setFormError('Please provide your display name.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const { data } = await reviewService.addReview({
        product_id: product.id,
        user_id: user.id,
        author_name: authorName.trim(),
        rating,
        comment: comment.trim(),
      });

      // Optimistic update
      const newReviews = [data, ...reviews.filter(r => r.id !== data.id)];
      setReviews(newReviews);
      
      const newTotal = newReviews.length;
      const newAvg = Number(
        (newReviews.reduce((acc, r) => acc + r.rating, 0) / newTotal).toFixed(1)
      );

      if (onReviewSubmitted) {
        onReviewSubmitted(newAvg, newTotal);
      }

      setFormSuccess(true);
      setComment('');
      setIsSubmitting(false);

      setTimeout(() => {
        setFormSuccess(false);
        setIsFormOpen(false);
      }, 2200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not submit review';
      setFormError(message);
      setIsSubmitting(false);
    }
  };

  // Toggle helpful like
  const handleToggleHelpful = async (reviewId: string) => {
    const res = await reviewService.toggleHelpful(reviewId);
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              helpful_count: res.helpful_count,
              user_has_voted: !r.user_has_voted,
            }
          : r
      )
    );
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div id="product-review-component" className="space-y-5 pt-2">
      
      {/* Header with Title & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Verified Customer Reviews</span>
            <span className="text-[11px] font-semibold text-[#E75480] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
              {stats.total} total
            </span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Real experiences from gift recipients and flower lovers in Meru & Kenya
          </p>
        </div>

        {user ? (
          <button
            id="open-write-review-btn"
            type="button"
            onClick={() => {
              setIsFormOpen(!isFormOpen);
              setFormError('');
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#E75480] hover:bg-[#D6336C] rounded-full shadow-xs transition-all cursor-pointer shrink-0"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>{isFormOpen ? 'Cancel Review' : 'Write a Review'}</span>
          </button>
        ) : (
          <button
            id="auth-required-review-btn"
            type="button"
            onClick={() => {
              if (onOpenAuth) onOpenAuth();
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-full shadow-xs transition-all cursor-pointer shrink-0"
            title="Sign in to write a review"
          >
            <LogIn className="w-3.5 h-3.5 text-[#E75480]" />
            <span>Sign In to Review</span>
          </button>
        )}
      </div>

      {/* Unauthenticated User Callout Banner (if not logged in) */}
      {!user && (
        <div className="bg-gradient-to-r from-pink-50/70 via-rose-50/40 to-slate-50 p-3.5 rounded-xl border border-pink-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white text-[#E75480] flex items-center justify-center shadow-2xs shrink-0 mt-0.5 border border-pink-100">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Want to leave a rating and review?
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                Sign in with Google or your email to share your experience with this gift arrangement and help other shoppers.
              </p>
            </div>
          </div>
          <button
            id="signin-prompt-btn"
            type="button"
            onClick={() => {
              if (onOpenAuth) onOpenAuth();
            }}
            className="text-xs font-semibold text-white bg-[#E75480] hover:bg-[#D6336C] px-3 py-1.5 rounded-full transition shadow-2xs shrink-0 cursor-pointer"
          >
            Sign In
          </button>
        </div>
      )}

      {/* Ratings Scorecard & Breakdown */}
      <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
        {/* Big Score Block */}
        <div className="sm:col-span-4 flex flex-col items-center justify-center text-center p-1 sm:border-r sm:border-slate-200">
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-none mb-1">
            {stats.average}
            <span className="text-sm text-slate-400 font-normal"> / 5</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 my-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= Math.round(stats.average)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-200 text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Based on {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Breakdown Progress Bars */}
        <div className="sm:col-span-8 space-y-1.5 text-xs">
          {[5, 4, 3, 2, 1].map((starCount) => {
            const count = stats.distribution[starCount] || 0;
            const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            const isSelected = filterRating === starCount;

            return (
              <button
                key={starCount}
                type="button"
                onClick={() => setFilterRating(filterRating === starCount ? 'all' : starCount)}
                className={`w-full flex items-center gap-2 px-2 py-0.5 rounded-lg transition-colors text-left cursor-pointer group ${
                  isSelected ? 'bg-pink-100/70 text-[#E75480] font-semibold' : 'hover:bg-slate-100 text-slate-600'
                }`}
                title={`Filter by ${starCount} stars`}
              >
                <span className="w-10 font-medium flex items-center gap-1 shrink-0 text-slate-700 text-[11px]">
                  <span>{starCount}</span>
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                </span>

                <div className="flex-1 bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#E75480] h-full rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="w-9 text-right text-[10px] text-slate-400 shrink-0 group-hover:text-slate-700">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form (Only for Authenticated Users) */}
      {user && isFormOpen && (
        <form
          id="product-review-form"
          onSubmit={handleSubmitReview}
          className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-pink-200 shadow-sm animate-in slide-in-from-top-3 duration-250 space-y-3.5"
        >
          <div className="flex items-center justify-between border-b border-pink-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-pink-100 text-[#E75480] flex items-center justify-center">
                <SmilePlus className="w-3.5 h-3.5" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Leave a Customer Review</h4>
            </div>
            
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              <UserCheck className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{user.full_name || user.email}</span>
            </div>
          </div>

          {/* Interactive Star Rating Picker */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Select Your Rating *
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const activeVal = hoverRating || rating;
                  const isFilled = starVal <= activeVal;
                  return (
                    <button
                      key={starVal}
                      id={`rating-star-${starVal}`}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(starVal)}
                      className="p-1 text-slate-300 hover:text-amber-400 transition-transform active:scale-125 cursor-pointer"
                      aria-label={`Rate ${starVal} out of 5 stars`}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          isFilled ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-[#E75480]">
                {RATING_DESCRIPTIONS[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Author Name / Alias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Your Display Name *
              </label>
              <input
                id="review-author-name-input"
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Winnie K., Ken M."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Customer Verification
              </label>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] truncate">Authenticated Account ({user.email})</span>
              </div>
            </div>
          </div>

          {/* Text Review Textarea */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Your Review & Feedback *
            </label>
            <textarea
              id="review-comment-textarea"
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others about the floral freshness, packaging elegance, scent, arrangement beauty, or delivery experience..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1] resize-none"
            />
            <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
              <span>Be helpful and respectful to help other floral buyers.</span>
              <span>{comment.length} characters</span>
            </div>
          </div>

          {/* Error notice */}
          {formError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Success notice */}
          {formSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! Your review has been submitted and added to the store. 🌸</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-pink-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-review-btn"
              type="submit"
              disabled={isSubmitting || formSuccess}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#E75480] hover:bg-[#D6336C] rounded-full shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : formSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Published!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Submit Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        {/* Star filter chips */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            type="button"
            id="filter-all-reviews-btn"
            onClick={() => setFilterRating('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition cursor-pointer ${
              filterRating === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({reviews.length})
          </button>
          {[5, 4, 3].map((s) => {
            const count = stats.distribution[s] || 0;
            return (
              <button
                key={s}
                id={`filter-${s}-star-reviews-btn`}
                type="button"
                onClick={() => setFilterRating(filterRating === s ? 'all' : s)}
                className={`px-2 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 transition cursor-pointer ${
                  filterRating === s
                    ? 'bg-[#E75480] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{s}</span>
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="opacity-75 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] font-medium">Sort:</span>
          <select
            id="sort-reviews-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] text-slate-700 font-medium focus:outline-none focus:border-[#E75480] cursor-pointer"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#E75480]" />
            <span className="text-xs">Loading verified customer reviews...</span>
          </div>
        ) : displayReviews.length === 0 ? (
          <div className="py-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-5">
            <div className="w-9 h-9 rounded-full bg-pink-100 text-[#E75480] flex items-center justify-center mx-auto mb-2">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 mb-1">
              {filterRating !== 'all' ? `No ${filterRating}-star reviews found` : 'No reviews posted yet'}
            </h4>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mb-3">
              {filterRating !== 'all'
                ? 'Try resetting the filter to see reviews from all rating tiers.'
                : user
                ? 'Be the very first customer to review this gift and share your thoughts!'
                : 'Sign in to be the first customer to review this gift arrangement!'}
            </p>
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setFilterRating('all');
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#E75480] bg-pink-50 hover:bg-pink-100 rounded-full border border-pink-200 transition cursor-pointer"
              >
                Write First Review
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (onOpenAuth) onOpenAuth();
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#E75480] hover:bg-[#D6336C] rounded-full transition cursor-pointer"
              >
                Sign In to Review
              </button>
            )}
          </div>
        ) : (
          displayReviews.map((rev) => {
            const initials = rev.author_name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'PH';

            return (
              <div
                key={rev.id}
                className="bg-white rounded-xl p-3.5 border border-slate-100 hover:border-pink-100 transition-colors shadow-2xs space-y-2"
              >
                {/* Header: Reviewer, Verified Badge, Rating, Date */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-rose-300 text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {rev.author_name}
                        </span>
                        {rev.verified_purchase && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {formatDate(rev.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-slate-100 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-700 leading-relaxed pl-10">
                  {rev.comment}
                </p>

                {/* Helpful vote action */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1.5 border-t border-slate-50 pl-10">
                  <span className="text-[10px]">Helpful review?</span>
                  <button
                    type="button"
                    onClick={() => handleToggleHelpful(rev.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer ${
                      rev.user_has_voted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-700'
                    }`}
                    title="Mark review as helpful"
                  >
                    <ThumbsUp className={`w-3 h-3 ${rev.user_has_voted ? 'fill-emerald-600 text-emerald-600' : ''}`} />
                    <span>Helpful ({rev.helpful_count || 0})</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

// Re-export as ReviewSection for backwards compatibility
export { ReviewComponent as ReviewSection };

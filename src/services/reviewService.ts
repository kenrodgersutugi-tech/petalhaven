import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ProductReview, Product } from '../types';
import { productService } from './productService';

const REVIEWS_STORAGE_KEY = 'petals_haven_reviews_v1';

// Pre-seeded high quality realistic customer reviews
const INITIAL_REVIEWS: ProductReview[] = [
  {
    id: 'rev-001-1',
    product_id: 'prod-001',
    author_name: 'Grace Mwende',
    rating: 5,
    comment: 'The roses were incredibly fresh and vibrant! Hand-delivered in Meru town right on time for my sister’s graduation. The handwritten note in the blush envelope was such a classy touch.',
    created_at: '2026-08-20T14:22:00Z',
    verified_purchase: true,
    helpful_count: 12,
  },
  {
    id: 'rev-001-2',
    product_id: 'prod-001',
    author_name: 'Kevin Mutuma',
    rating: 5,
    comment: 'Best florists in Meru without a doubt. Winnie helped me customize the ribbon color. The peonies smelled heavenly and lasted over a week.',
    created_at: '2026-08-16T11:05:00Z',
    verified_purchase: true,
    helpful_count: 7,
  },
  {
    id: 'rev-001-3',
    product_id: 'prod-001',
    author_name: 'Beatrice Njeri',
    rating: 4,
    comment: 'Stunning bouquet, delivered securely to Makutano. The eucalyptus gave it a very fresh highland fragrance. Highly recommended!',
    created_at: '2026-08-10T09:40:00Z',
    verified_purchase: true,
    helpful_count: 4,
  },
  {
    id: 'rev-002-1',
    product_id: 'prod-002',
    author_name: 'David Kirimi',
    rating: 5,
    comment: 'The glass cloche and warm fairy lights look even more magical in person than in the photos. My fiancee has it on her bedside table!',
    created_at: '2026-08-22T19:30:00Z',
    verified_purchase: true,
    helpful_count: 15,
  },
  {
    id: 'rev-002-2',
    product_id: 'prod-002',
    author_name: 'Sarah Kendi',
    rating: 5,
    comment: 'Top tier quality! Real preserved rose that still looks blooming fresh weeks later. Wonderful anniversary gift.',
    created_at: '2026-08-14T16:15:00Z',
    verified_purchase: true,
    helpful_count: 6,
  },
  {
    id: 'rev-003-1',
    product_id: 'prod-003',
    author_name: 'Dr. James Mugambi',
    rating: 5,
    comment: 'Sent this artisan hamper to my mother in Nanyuki. The purple tea, Mt. Kenya honey, and the cookies were packaged so elegantly. Exceeded expectations!',
    created_at: '2026-08-24T10:12:00Z',
    verified_purchase: true,
    helpful_count: 9,
  },
  {
    id: 'rev-004-1',
    product_id: 'prod-004',
    author_name: 'Annabelle Kathure',
    rating: 5,
    comment: 'The rosewater and oud blend is so relaxing and burns clean without black soot. I burn it every evening while reading.',
    created_at: '2026-08-18T20:00:00Z',
    verified_purchase: true,
    helpful_count: 8,
  },
  {
    id: 'rev-005-1',
    product_id: 'prod-005',
    author_name: 'Faith Mukami',
    rating: 5,
    comment: 'The raspberry ganache and salted caramel truffles melt in your mouth. Truly gourmet artisan confectionery in Meru!',
    created_at: '2026-08-21T13:45:00Z',
    verified_purchase: true,
    helpful_count: 11,
  },
  {
    id: 'rev-006-1',
    product_id: 'prod-006',
    author_name: 'Brian Munene',
    rating: 5,
    comment: 'Bright, cheerful daisies and tulips! Brightened up our office reception desk instantly. Delivered in fresh water tubes.',
    created_at: '2026-08-19T08:30:00Z',
    verified_purchase: true,
    helpful_count: 5,
  },
  {
    id: 'rev-007-1',
    product_id: 'prod-007',
    author_name: 'Mercy Kagendo',
    rating: 5,
    comment: 'The laser engraving was so crisp and clean! Such a meaningful personalized gift that she will treasure forever.',
    created_at: '2026-08-23T15:10:00Z',
    verified_purchase: true,
    helpful_count: 14,
  }
];

function getStoredReviews(): ProductReview[] {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not load reviews from localStorage', err);
  }
  return INITIAL_REVIEWS;
}

function saveStoredReviews(reviews: ProductReview[]): void {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn('Could not save reviews to localStorage', err);
  }
}

export const reviewService = {
  // Fetch reviews for a specific product
  async getReviews(productId: string): Promise<{ data: ProductReview[]; isLiveSupabase: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch reviews error, using local reviews:', error.message);
        } else if (data && data.length > 0) {
          return { data, isLiveSupabase: true };
        }
      } catch (err: unknown) {
        console.warn('Supabase reviews network issue, using local:', err);
      }
    }

    const all = getStoredReviews();
    const productReviews = all
      .filter((r) => r.product_id === productId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { data: productReviews, isLiveSupabase: false };
  },

  // Submit a new review
  async addReview(
    reviewData: {
      product_id: string;
      user_id?: string | null;
      author_name: string;
      rating: number;
      comment: string;
    }
  ): Promise<{ data: ProductReview; error?: string }> {
    const newReview: ProductReview = {
      id: isSupabaseConfigured ? undefined as unknown as string : `rev-${Date.now()}`,
      product_id: reviewData.product_id,
      user_id: reviewData.user_id || null,
      author_name: reviewData.author_name.trim() || 'Verified Customer',
      rating: Math.min(5, Math.max(1, reviewData.rating)),
      comment: reviewData.comment.trim(),
      created_at: new Date().toISOString(),
      verified_purchase: true,
      helpful_count: 0,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .insert([
            {
              product_id: newReview.product_id,
              user_id: newReview.user_id,
              author_name: newReview.author_name,
              rating: newReview.rating,
              comment: newReview.comment,
              verified_purchase: true,
              helpful_count: 0,
            }
          ])
          .select()
          .single();

        if (!error && data) {
          newReview.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase review insert failed, proceeding locally:', err);
      }
    }

    // Always update local storage
    const all = getStoredReviews();
    const createdReview = {
      ...newReview,
      id: newReview.id || `rev-${Date.now()}`,
    };
    const updated = [createdReview, ...all];
    saveStoredReviews(updated);

    // Recompute product rating and review count
    const productReviews = updated.filter(r => r.product_id === reviewData.product_id);
    const avgRating = Number(
      (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    );

    await productService.updateProduct(reviewData.product_id, {
      rating: avgRating,
      review_count: productReviews.length,
    });

    return { data: createdReview };
  },

  // Toggle helpful like for a review
  async toggleHelpful(reviewId: string): Promise<{ helpful_count: number }> {
    const all = getStoredReviews();
    let newCount = 0;
    const updated = all.map(r => {
      if (r.id === reviewId) {
        const hasVoted = !!r.user_has_voted;
        newCount = hasVoted ? Math.max(0, (r.helpful_count || 1) - 1) : (r.helpful_count || 0) + 1;
        return {
          ...r,
          helpful_count: newCount,
          user_has_voted: !hasVoted,
        };
      }
      return r;
    });

    saveStoredReviews(updated);
    return { helpful_count: newCount };
  }
};

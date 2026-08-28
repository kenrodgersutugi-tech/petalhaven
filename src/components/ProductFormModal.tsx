import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Sparkles, 
  Check, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { Product } from '../types';
import { productService } from '../services/productService';
import { CATEGORIES } from '../data/initialProducts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSaved: () => void;
}

const PRESET_GIFT_IMAGES = [
  { label: 'Peony Bloom Bouquet', url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80' },
  { label: 'Preserved Rose Dome', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Luxury Tea Hamper', url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80' },
  { label: 'Scented Rose Candle', url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80' },
  { label: 'Belgian Chocolate Box', url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Pastel Tulip Assortment', url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [category, setCategory] = useState<string>('Fresh Bouquets');
  const [stockQuantity, setStockQuantity] = useState<number | ''>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setDescription(productToEdit.description);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.original_price || '');
      setCategory(productToEdit.category);
      setStockQuantity(productToEdit.stock_quantity);
      setImageUrl(productToEdit.image_url);
      setIsFeatured(productToEdit.is_featured || false);
      setTagInput((productToEdit.tags || []).join(', '));
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setOriginalPrice('');
      setCategory('Fresh Bouquets');
      setStockQuantity(12);
      setImageUrl('https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80');
      setIsFeatured(false);
      setTagInput('Fresh, Handcrafted, Romantic');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');

    try {
      const { url, error } = await productService.uploadProductImage(file);
      if (error) {
        console.warn('Upload notice:', error);
      }
      setImageUrl(url);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || price === '' || stockQuantity === '' || !imageUrl) {
      setErrorMsg('Please complete all required fields and provide an image.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const parsedTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      title,
      description,
      price: Number(price),
      original_price: originalPrice !== '' ? Number(originalPrice) : undefined,
      category,
      stock_quantity: Number(stockQuantity),
      image_url: imageUrl,
      is_featured: isFeatured,
      tags: parsedTags,
    };

    try {
      if (productToEdit) {
        const { error } = await productService.updateProduct(productToEdit.id, payload);
        if (error) {
          setErrorMsg(error);
          setIsSubmitting(false);
          return;
        }
      } else {
        const { error } = await productService.addProduct(payload);
        if (error) {
          setErrorMsg(error);
          setIsSubmitting(false);
          return;
        }
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCategories = CATEGORIES.filter(c => c !== 'All');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[94vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-pink-50/40">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E75480] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                {productToEdit ? 'Edit Gift Item' : 'Add New Gift to Catalog'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Direct Supabase database sync & Storage uploader
              </p>
            </div>
          </div>
          <button
            id="close-product-form-btn"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 overflow-y-auto flex-1 space-y-3.5 sm:space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Gift Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grand Velvet Rose & Champagne Trunk"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
            />
          </div>

          {/* Category & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
              >
                {validCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E75480] accent-[#E75480]"
                />
                <span>Highlight as Featured Gift on Homepage</span>
              </label>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Selling Price (KSh) *</label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="2500"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Original Price (KSh) (Optional)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="3200"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="10"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1] font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the floral arrangement, scents, contents, and emotional appeal..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1] resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Gift Tags (comma separated)</label>
            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Best Seller, Romantic, Spa, Birthday"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Image Upload & Preview Section */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#E75480]" />
                <span>Product Image (Supabase Storage 'product-images')</span>
              </label>
              {isUploading && (
                <span className="text-xs text-[#E75480] flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Supabase...
                </span>
              )}
            </div>

            {/* File Upload Trigger */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <label className="flex-1 w-full flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-slate-200 hover:border-[#E75480] rounded-xl text-xs text-slate-600 font-medium cursor-pointer transition">
                <Upload className="w-4 h-4 text-[#E75480]" />
                <span>Upload from Device (Direct to Supabase Storage)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="text-xs text-slate-400">or enter URL:</div>

              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
              />
            </div>

            {/* Preset quick picker */}
            <div>
              <p className="text-[11px] text-slate-500 mb-1.5 font-medium">Or pick a curated gift photo:</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_GIFT_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition ${
                      imageUrl === preset.url ? 'border-[#E75480] ring-2 ring-pink-200' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Image Preview */}
            {imageUrl && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="text-xs text-slate-600 truncate">
                  <span className="font-medium text-emerald-700 block">Image Ready</span>
                  <span className="text-[11px] text-slate-400 truncate block max-w-xs">{imageUrl}</span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-full transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-product-submit-btn"
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-2 py-2.5 bg-[#E75480] hover:bg-[#D6336C] text-white font-medium text-xs rounded-full shadow-md shadow-pink-100 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{productToEdit ? 'Update Gift Record' : 'Publish Gift Item'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

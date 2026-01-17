'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface FeedbackFormProps {
    alertId: string;
}

export function FeedbackForm({ alertId }: FeedbackFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setIsSubmitting(true);

        try {
            await api.submitFeedback(alertId, rating, comment);
            alert('Thank you for your feedback! Your input helps improve our community safety.');
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Rate this report</p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className={`text-lg transition-colors ${star <= (hoveredRating || rating) ? 'text-amber-500' : 'text-zinc-300'
                                } hover:scale-110`}
                            aria-label={`Rate ${star} stars`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-[10px] text-zinc-600 mt-1">You rated: {rating}/5</p>
                )}
            </div>
            <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-2">Add comment</p>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about this report..."
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={2}
                ></textarea>
            </div>
            <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
        </div>
    );
}

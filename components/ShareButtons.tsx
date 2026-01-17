import React from 'react';
import { Mail, MessageCircle, Twitter } from 'lucide-react';

interface ShareButtonsProps {
    reportId: string;
    title: string;
    description: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ reportId, title, description }) => {
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?trackId=${reportId}` : '';
    const shareText = `${title}: ${description}`;

    const shareViaEmail = () => {
        const subject = encodeURIComponent(`Civic Report: ${title}`);
        const body = encodeURIComponent(`${description}\n\nTrack this report: ${shareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    const shareViaWhatsApp = () => {
        const text = encodeURIComponent(`${shareText}\n\nTrack: ${shareUrl}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const shareViaTwitter = () => {
        const text = encodeURIComponent(shareText);
        const url = encodeURIComponent(shareUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={shareViaEmail}
                className="p-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors group relative"
                title="Share via Email"
            >
                <Mail size={14} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Share via Email
                </span>
            </button>

            <button
                onClick={shareViaWhatsApp}
                className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors group relative"
                title="Share via WhatsApp"
            >
                <MessageCircle size={14} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Share via WhatsApp
                </span>
            </button>

            <button
                onClick={shareViaTwitter}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors group relative"
                title="Share on X (Twitter)"
            >
                <Twitter size={14} />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    Share on X (Twitter)
                </span>
            </button>
        </div>
    );
};

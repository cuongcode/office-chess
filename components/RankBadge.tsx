interface RankBadgeProps {
    rank: number;
    size?: 'sm' | 'md' | 'lg';
}

export default function RankBadge({ rank, size = 'md' }: RankBadgeProps) {
    const sizeClasses = {
        sm: 'text-sm px-2 py-0.5',
        md: 'text-base px-3 py-1',
        lg: 'text-lg px-4 py-1.5',
    };

    const iconSizes = {
        sm: 'text-base',
        md: 'text-xl',
        lg: 'text-2xl',
    };

    // Top 3: medals with special colors
    if (rank === 1) {
        return (
            <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold shadow-md`}>
                <span className={iconSizes[size]}>🥇</span>
                <span>#1</span>
            </div>
        );
    }

    if (rank === 2) {
        return (
            <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-bold shadow-md`}>
                <span className={iconSizes[size]}>🥈</span>
                <span>#2</span>
            </div>
        );
    }

    if (rank === 3) {
        return (
            <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold shadow-md`}>
                <span className={iconSizes[size]}>🥉</span>
                <span>#3</span>
            </div>
        );
    }

    // Top 10: star icon with purple
    if (rank <= 10) {
        return (
            <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold shadow`}>
                <span className={iconSizes[size]}>⭐</span>
                <span>#{rank}</span>
            </div>
        );
    }

    // Top 50: trophy with blue
    if (rank <= 50) {
        return (
            <div className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow`}>
                <span className={iconSizes[size]}>🏆</span>
                <span>#{rank}</span>
            </div>
        );
    }

    // Others: plain number with theme colors
    return (
        <div className={`inline-flex items-center ${sizeClasses[size]} rounded-full bg-muted text-muted-foreground font-medium`}>
            <span>#{rank}</span>
        </div>
    );
}

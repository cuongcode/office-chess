import clsx from 'clsx';

interface ColorPickerButtonProps {
    color: 'white' | 'black' | 'random';
    isSelected: boolean;
    onClick: () => void;
    className?: string;
}

function ColorSwatch({ color }: { color: 'white' | 'black' | 'random' }) {
    if (color === 'random') {
        return (
            <div className="flex items-center justify-center">
                <div className="w-6 h-12 rounded-l-full bg-white mb-2"></div>
                <div className="w-6 h-12 rounded-r-full bg-gray-800 mb-2"></div>
            </div>
        );
    }

    return (
        <div
            className={clsx(
                'w-12 h-12 rounded-full mx-auto mb-2 border',
                color === 'white'
                    ? 'bg-white border-border-light dark:border-border-dark'
                    : 'bg-gray-800 border-gray-700'
            )}
        />
    );
}

const LABEL: Record<'white' | 'black' | 'random', string> = {
    white: 'White',
    black: 'Black',
    random: 'Random',
};

export function ColorPickerButton({ color, isSelected, onClick, className }: ColorPickerButtonProps) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'p-4 rounded-lg border-2 transition-all',
                isSelected
                    ? 'border-primary-light dark:border-primary-dark bg-primary-light/10 dark:bg-primary-dark/10'
                    : 'border-border-light dark:border-border-dark hover:border-muted-fg-light dark:hover:border-muted-fg-dark',
                className
            )}
        >
            <ColorSwatch color={color} />
            <p className="text-sm font-semibold">{LABEL[color]}</p>
        </button>
    );
}

import { Copy, Users } from 'lucide-react';

interface HeaderInfoProps {
    roomId: string | null;
    spectatorCount: number;
    statusText: string;
    status: string;
    isOnline: boolean;
    isConnected: boolean;
    onCopyRoomId: () => void;
}

export function HeaderInfo({
    roomId,
    spectatorCount,
    statusText,
    status,
    isOnline,
    isConnected,
    onCopyRoomId
}: HeaderInfoProps) {
    return (
        <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm">
            <div className="flex items-center gap-4">
                {isOnline && (
                    <div
                        onClick={onCopyRoomId}
                        className="flex items-center gap-2 px-3 py-1 bg-muted rounded cursor-pointer hover:bg-accent transition-colors"
                        title="Copy Room Code"
                    >
                        <span className="text-muted-foreground text-xs uppercase tracking-wider">Room</span>
                        <span className="font-mono font-bold text-blue-500">{roomId}</span>
                        <Copy className="w-3 h-3 text-muted-foreground" />
                    </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Users className="w-4 h-4" />
                    <span>{spectatorCount}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'check' ? 'bg-destructive/20 text-destructive animate-pulse' : 'bg-muted text-muted-foreground'
                    }`}>
                    {statusText}
                </div>
                {isOnline && (
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-destructive'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
                )}
            </div>
        </div>
    );
}

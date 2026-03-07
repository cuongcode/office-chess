import { Copy, Eye } from "lucide-react";

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
  onCopyRoomId,
}: HeaderInfoProps) {
  return (
    <div className="flex items-center justify-center gap-8">
      {isOnline && (
        <div
          onClick={onCopyRoomId}
          className="bg-muted hover:bg-accent flex cursor-pointer items-center gap-2 rounded px-3 py-1 transition-colors"
          title="Copy Room Code"
        >
          <span className="text-muted-foreground text-xs tracking-wider uppercase">
            Room
          </span>
          <span className="font-mono font-bold text-primary-light dark:text-primary-dark">
            {roomId}
          </span>
          <Copy className="text-muted-foreground h-3 w-3" />
        </div>
      )}
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Eye className="h-4 w-4" />
        <span>{spectatorCount}</span>
      </div>
      {/* <div className="flex items-center justify-between bg-card p-1 rounded-lg border border-border shadow-sm gap-4">
            </div> */}

      {/* <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'check' ? 'bg-destructive/20 text-destructive animate-pulse' : 'bg-muted text-muted-foreground'
                    }`}>
                    {statusText}
                </div>
                {isOnline && (
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-destructive'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
                )}
            </div> */}
    </div>
  );
}

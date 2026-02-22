-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "whitePlayerId" TEXT NOT NULL,
    "blackPlayerId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "resultMethod" TEXT NOT NULL,
    "movesPGN" TEXT NOT NULL,
    "movesArray" JSONB NOT NULL,
    "finalPosition" TEXT NOT NULL,
    "moveCount" INTEGER NOT NULL,
    "timeControl" TEXT NOT NULL,
    "whiteTimeLeft" INTEGER,
    "blackTimeLeft" INTEGER,
    "duration" INTEGER NOT NULL,
    "opening" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_whitePlayerId_fkey" FOREIGN KEY ("whitePlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_blackPlayerId_fkey" FOREIGN KEY ("blackPlayerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

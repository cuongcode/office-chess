import { prisma } from '../lib/prisma';
import { hash } from 'bcryptjs';

async function main() {
    console.log('🌱 Seeding leaderboard test data...');

    // Create 50 test users with varying stats
    const usernames = [
        'ChessMaster', 'KnightRider', 'QueenGambit', 'RookiePlayer', 'BishopBlitz',
        'PawnStorm', 'KingSlayer', 'CheckMate', 'CastleKing', 'EnPassant',
        'GrandMaster', 'Tactician', 'Strategist', 'Blitzer', 'EndgameExpert',
        'OpeningBook', 'MiddleGame', 'Sacrificer', 'Defender', 'Attacker',
        'PositionalPlay', 'TacticalGenius', 'TimeScramble', 'BulletKing', 'BlitzQueen',
        'RapidMaster', 'ClassicalChamp', 'TournamentPro', 'CasualPlayer', 'RankedWarrior',
        'ChessNinja', 'BoardDominator', 'PieceTrader', 'MaterialHunter', 'SpaceController',
        'InitiativeSeeker', 'CounterAttacker', 'QueenSacrifice', 'KnightFork', 'PinMaster',
        'SkeweredKing', 'DiscoveredCheck', 'DoubleAttack', 'Zugzwang', 'Stalemate',
        'DrawMaster', 'ResignationKing', 'TimeoutVictim', 'FlagFall', 'ClockMaster'
    ];

    const now = new Date();
    const hashedPassword = await hash('TestPassword123!', 10);

    for (let i = 0; i < 50; i++) {
        const username = usernames[i];
        const email = `${username.toLowerCase()}@chess.test`;

        // Vary the stats
        const totalGames = Math.floor(Math.random() * 200) + 10; // 10-210 games
        const winRate = Math.random() * 0.7 + 0.15; // 15-85% win rate
        const wins = Math.floor(totalGames * winRate);
        const losses = Math.floor(totalGames * (1 - winRate) * 0.7); // 70% of remaining are losses
        const draws = totalGames - wins - losses;

        // Rating based on win rate and games played
        const baseRating = Math.floor(winRate * 400 + 100); // 100-380
        const experienceBonus = Math.min(totalGames / 2, 100); // Up to 100 bonus
        const rating = Math.floor(baseRating + experienceBonus);

        // Vary last game time
        const daysAgo = Math.floor(Math.random() * 60); // 0-60 days ago
        const lastGameAt = new Date(now);
        lastGameAt.setDate(lastGameAt.getDate() - daysAgo);

        // Current streak (random)
        const currentStreak = Math.floor(Math.random() * 10);
        const longestStreak = currentStreak + Math.floor(Math.random() * 15);

        try {
            await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: username,
                    username,
                    emailVerified: new Date(),
                    avatar: null,
                    bio: `Test player ${i + 1}`,
                    totalGames,
                    wins,
                    losses,
                    draws,
                    rating,
                    currentStreak,
                    longestStreak,
                    lastGameAt,
                },
            });

            console.log(`✅ Created user: ${username} (Rating: ${rating}, Games: ${totalGames})`);
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.log(`⚠️  User ${username} already exists, skipping...`);
            } else {
                console.error(`❌ Error creating user ${username}:`, error.message);
            }
        }
    }

    console.log('✨ Seeding complete!');

    // Display summary
    const totalUsers = await prisma.user.count();
    const usersWithGames = await prisma.user.count({
        where: {
            totalGames: {
                gt: 0,
            },
        },
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with games: ${usersWithGames}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

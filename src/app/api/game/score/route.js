import { NextResponse } from 'next/server';
import { calculateYearlyScore, calculateGameResult } from '../../../../utils/gameScoring';
import { connectToDB } from '../../../../../utils/database';

let GameSession, Game;

try {
    GameSession = require('../../../../../models/gameSession').default;
    Game = require('../../../../../models/game').default;
    console.log("Models imported successfully");
} catch (importError) {
    console.error("Error importing models:", importError);
    GameSession = null;
    Game = null;
}

console.log("Models loaded:", { 
    GameSession: !!GameSession, 
    Game: !!Game,
    GameSessionType: typeof GameSession,
    GameType: typeof Game
});

export async function POST(request) {
    try {
        console.log("Starting POST request...");
        await connectToDB();
        console.log("Database connected successfully");
        
        // Check if models are available
        if (!GameSession || !Game) {
            throw new Error("Models not loaded properly");
        }
        
        // Test database connection by trying to count documents
        try {
            const sessionCount = await GameSession.countDocuments();
            console.log("Current GameSession count:", sessionCount);
        } catch (dbTestError) {
            console.error("Database test failed:", dbTestError);
        }
        
        const { userId, year, allocations } = await request.json();
        
        console.log("API called with:", { userId, year, allocations });
        
        if (!userId || !year || !allocations) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, year, allocations' },
                { status: 400 }
            );
        }
               const { health, education, safety } = allocations;
        const totalAllocation = health + education + safety;
        
        if (totalAllocation !== 100) {
            return NextResponse.json(
                { error: 'Total allocation must equal 100 points' },
                { status: 400 }
            );
        }
        
        
        const scoreResult = calculateYearlyScore(allocations);
        console.log("Score calculated:", scoreResult);
        
        console.log("Creating GameSession with data:", {
            userId,
            year,
            allocations,
            baseScore: scoreResult.baseScore,
            finalScore: scoreResult.finalScore,
            eventName: scoreResult.eventName,
            feedbackMessage: scoreResult.feedbackMessage
        });
        
        // Check if a session already exists for this user and year
        let existingSession = await GameSession.findOne({ userId, year });
        
        let gameSession;
        if (existingSession) {
            console.log("Updating existing GameSession for year", year);
            // Update existing session
            existingSession.allocations = allocations;
            existingSession.baseScore = scoreResult.baseScore;
            existingSession.finalScore = scoreResult.finalScore;
            existingSession.eventName = scoreResult.eventName;
            existingSession.feedbackMessage = scoreResult.feedbackMessage;
            await existingSession.save();
            gameSession = existingSession;
            console.log("GameSession updated:", gameSession._id);
        } else {
            console.log("Creating new GameSession for year", year);
            try {
                gameSession = new GameSession({
                    userId,
                    year,
                    allocations,
                    baseScore: scoreResult.baseScore,
                    finalScore: scoreResult.finalScore,
                    eventName: scoreResult.eventName,
                    feedbackMessage: scoreResult.feedbackMessage
                });
                
                console.log("GameSession created, attempting to save...");
                await gameSession.save();
                console.log("GameSession saved:", gameSession._id);
            } catch (modelError) {
                console.error("Error creating/saving GameSession:", modelError);
                throw modelError;
            }
        }
        
        
        console.log("Looking for existing game with userId:", userId);
        let game = await Game.findOne({ 
            userId, 
            gameStatus: 'in_progress' 
        });
        console.log("Found existing game:", game ? game._id : "None");
        
        // If no in-progress game exists, check if there's a completed game
        // If there is, we should start a new game
        if (!game) {
            const completedGame = await Game.findOne({ 
                userId, 
                gameStatus: 'completed' 
            });
            if (completedGame) {
                console.log("Found completed game, starting new game session");
            }
        }
        
        if (!game) {
            console.log("Creating new Game...");
            try {
                game = new Game({
                    userId,
                    gameSessions: [gameSession._id],
                    currentYear: year,
                    gameStatus: 'in_progress'
                });
                console.log("New Game created successfully");
            } catch (gameCreateError) {
                console.error("Error creating new Game:", gameCreateError);
                throw gameCreateError;
            }
        } else {
            console.log("Updating existing Game...");
            try {
                // Check if session ID is already in the array
                if (!game.gameSessions.includes(gameSession._id)) {
                    game.gameSessions.push(gameSession._id);
                }
                game.currentYear = year;
                console.log("Existing Game updated successfully");
            } catch (gameUpdateError) {
                console.error("Error updating existing Game:", gameUpdateError);
                throw gameUpdateError;
            }
        }
        
        
        if (year === 3) {
            console.log("Year 3 completed, calculating final results...");
            try {
                const allSessions = await GameSession.find({
                    _id: { $in: game.gameSessions }
                }).sort({ year: 1 });
                
                console.log("Found sessions for final calculation:", allSessions.length);
                
                const gameResult = calculateGameResult(allSessions);
                console.log("Final game result calculated:", gameResult);
                
                game.totalScore = gameResult.totalScore;
                game.averageScore = gameResult.averageScore;
                game.isReElected = gameResult.isReElected;
                game.performanceRating = gameResult.performanceRating;
                game.gameStatus = 'completed';
                game.completedAt = new Date();
                
                console.log("Game updated with final results");
            } catch (finalCalcError) {
                console.error("Error calculating final results:", finalCalcError);
                throw finalCalcError;
            }
        }
        
        try {
            await game.save();
            console.log("Game saved:", game._id);
        } catch (gameSaveError) {
            console.error("Error saving Game:", gameSaveError);
            throw gameSaveError;
        }
        
        return NextResponse.json({
            success: true,
            yearScore: scoreResult,
            gameSession: gameSession._id,
            gameId: game._id,
            isGameComplete: year === 3,
            gameResult: year === 3 ? {
                totalScore: game.totalScore,
                averageScore: game.averageScore,
                isReElected: game.isReElected,
                performanceRating: game.performanceRating
            } : null
        });
        
    } catch (error) {
        console.error('Error in game scoring:', error);
        console.error('Error stack:', error.stack);
        
        // Return more specific error information
        return NextResponse.json(
            { 
                error: 'Internal server error', 
                details: error.message,
                stack: error.stack 
            },
            { status: 500 }
        );
    }
}

export async function GET(request) {
    try {
        await connectToDB();
        
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const gameId = searchParams.get('gameId');
        
        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }
        
        let query = { userId };
        if (gameId) {
            query._id = gameId;
        }
        
        const games = await Game.find(query)
            .populate('gameSessions')
            .sort({ createdAt: -1 });
        
        return NextResponse.json({
            success: true,
            games
        });
        
    } catch (error) {
        console.error('Error fetching games:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 
import { Schema, model, models } from "mongoose";

const GameSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    gameSessions: [{
        type: Schema.Types.ObjectId,
        ref: 'GameSession'
    }],
    totalScore: {
        type: Number,
        required: false,
        min: 0,
        max: 300 // 3 years * 100 max score
    },
    averageScore: {
        type: Number,
        required: false,
        min: 0,
        max: 100
    },
    isReElected: {
        type: Boolean,
        required: false
    },
    performanceRating: {
        type: String,
        required: false,
        enum: ['Outstanding Mayor', 'Good Mayor', 'Average Mayor', 'Poor Mayor']
    },
    gameStatus: {
        type: String,
        required: true,
        enum: ['in_progress', 'completed'],
        default: 'in_progress'
    },
    currentYear: {
        type: Number,
        required: true,
        min: 1,
        max: 3,
        default: 1
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});


GameSchema.index({ userId: 1, gameStatus: 1 });


GameSchema.virtual('isComplete').get(function() {
    return this.gameStatus === 'completed' && this.gameSessions.length === 3;
});


GameSchema.methods.addYearSession = function(sessionId) {
    this.gameSessions.push(sessionId);
    this.currentYear = Math.min(3, this.currentYear + 1);
    
    if (this.gameSessions.length === 3) {
        this.gameStatus = 'completed';
        this.completedAt = new Date();
    }
    
    return this.save();
};


GameSchema.methods.calculateFinalResults = function() {
    if (this.gameSessions.length !== 3) {
        throw new Error('Cannot calculate final results: game not complete');
    }
    
 return {
        totalScore: this.totalScore,
        averageScore: this.averageScore,
        isReElected: this.isReElected,
        performanceRating: this.performanceRating
    };
};

// Clear any existing model to force refresh
if (models.Game) {
    delete models.Game;
}

export default model('Game', GameSchema); 
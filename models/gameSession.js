import { Schema, model, models } from "mongoose";

const GameSessionSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 3
    },
    allocations: {
        health: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        education: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        safety: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    baseScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    finalScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    eventName: {
        type: String,
        default: null
    },
    feedbackMessage: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure one game session per user per year
GameSessionSchema.index({ userId: 1, year: 1 }, { unique: true });

// Virtual for total allocation (should equal 100)
GameSessionSchema.virtual('totalAllocation').get(function() {
    return this.allocations.health + this.allocations.education + this.allocations.safety;
});


GameSessionSchema.pre('save', function(next) {
    const total = this.allocations.health + this.allocations.education + this.allocations.safety;
    if (total !== 100) {
        return next(new Error('Total allocation must equal 100 points'));
    }
    next();
});

// Clear any existing model to force refresh
if (models.GameSession) {
    delete models.GameSession;
}

export default model('GameSession', GameSessionSchema); 
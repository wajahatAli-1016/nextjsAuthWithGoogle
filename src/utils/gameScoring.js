
const SECTOR_WEIGHTS = {
    health: 0.2,    
    education: 0.4, 
    safety:0.4    
};


const RANDOM_EVENTS = [
    {
        name: "Flu Outbreak",
        probability: 0.15,
        condition: (allocations) => allocations.health < 30, 
        impact: -15, 
        message: "A flu outbreak occurred! Low health funding made it harder to contain."
    },
    {
        name: "School Protest",
        probability: 0.12, 
        condition: (allocations) => allocations.education < 25, 
        impact: -10, 
        message: "Students protested against poor educational facilities due to low funding."
    },
    {
        name: "Crime Wave",
        probability: 0.10, 
        condition: (allocations) => allocations.safety < 20, 
        impact: -12, 
        message: "A crime wave hit the city! Insufficient safety funding made it difficult to respond."
    },
    {
        name: "Economic Boom",
        probability: 0.08, 
        condition: (allocations) => allocations.education > 40 && allocations.health > 35,
        impact: 8, 
        message: "The city experienced an economic boom due to excellent education and health infrastructure!"
    },
    {
        name: "Community Harmony",
        probability: 0.06, 
        condition: (allocations) => allocations.safety > 30 && allocations.health > 30,
        impact: 6, 
        message: "The community is thriving with excellent safety and health services!"
    }
];

/**
 
 * @param {Object} allocations - Object containing health, education, safety allocations
 * @returns {number} - Base score (0-100)
 */
function calculateBaseScore(allocations, sectorWeights = SECTOR_WEIGHTS) {
    let baseScore = 0;
    
    console.log('Allocations:', allocations);
    console.log('Weights:', sectorWeights);
    
    // Calculate base score using the formula: allocation × weight for each sector
    Object.keys(sectorWeights).forEach(sector => {
        const allocation = allocations[sector] || 0;
        const weight = sectorWeights[sector];
        const sectorScore = allocation * weight;
        
        console.log(`${sector}: ${allocation} × ${weight} = ${sectorScore}`);
        baseScore += sectorScore;
    });
    
    console.log('Total base score:', baseScore);
    return Math.round(Math.min(100, Math.max(0, baseScore)));
}

/**
 * Check for random events based on allocations
 * @param {Object} allocations - Object containing health, education, safety allocations
 * @returns {Object|null} - Event object if triggered, null otherwise
 */
function checkRandomEvents(allocations) {
    const triggeredEvents = [];
    
    RANDOM_EVENTS.forEach(event => {
    
        if (Math.random() < event.probability && event.condition(allocations)) {
            triggeredEvents.push(event);
        }
    });
    
    
    return triggeredEvents.length > 0 ? triggeredEvents[0] : null;
}

/**
 * Calculate final yearly score with events
 * @param {Object} allocations - Object containing health, education, safety allocations
 * @returns {Object} - Score result with details
 */
function calculateYearlyScore(allocations, sectorWeights = SECTOR_WEIGHTS) {
      const baseScore = calculateBaseScore(allocations, sectorWeights);
    
  
    const randomEvent = checkRandomEvents(allocations);
    
  
    let finalScore = baseScore;
    let eventName = null;
    let eventImpact = null;
    let feedbackMessage = "";
    
    if (randomEvent) {
        finalScore += randomEvent.impact;
        eventName = randomEvent.name;
        eventImpact = randomEvent.impact;
        feedbackMessage = randomEvent.message;
    }
    
  
    finalScore = Math.max(0, Math.min(100, finalScore));
    
  
    if (!feedbackMessage) {
        if (finalScore >= 80) {
            feedbackMessage = "Excellent job! The city is thriving under your leadership.";
        } else if (finalScore >= 60) {
            feedbackMessage = "Good work! The city is doing well with room for improvement.";
        } else if (finalScore >= 40) {
            feedbackMessage = "The city is struggling. Consider rebalancing your budget allocations.";
        } else {
            feedbackMessage = "The city is in crisis. Major changes are needed in budget priorities.";
        }
    }
    
    return {
        baseScore,
        finalScore: Math.round(finalScore),
        eventName,
        eventImpact,
        feedbackMessage,
        allocations
    };
}

/**
 * Calculate overall game performance after 3 years
 * @param {Array} yearlyScores - Array of 3 yearly score objects
 * @returns {Object} - Overall game result
 */
function calculateGameResult(yearlyScores) {
    if (yearlyScores.length !== 3) {
        throw new Error("Game result requires exactly 3 years of scores");
    }
    
    const totalScore = yearlyScores.reduce((sum, year) => sum + year.finalScore, 0);
    const averageScore = totalScore / 3;
    
  
    const isReElected = averageScore >= 30;
    
  
    let performanceRating = "";
    if (averageScore >= 35) {
        performanceRating = "Outstanding Mayor";
    } else if (averageScore >= 32) {
        performanceRating = "Good Mayor";
    } else if (averageScore >= 30) {
        performanceRating = "Average Mayor";
    } else {
        performanceRating = "Poor Mayor";
    }
    
    return {
        totalScore,
        averageScore: Math.round(averageScore),
        isReElected,
        performanceRating,
        yearlyScores
    };
}

export {
    calculateBaseScore,
    checkRandomEvents,
    calculateYearlyScore,
    calculateGameResult,
    SECTOR_WEIGHTS,
    RANDOM_EVENTS
}; 
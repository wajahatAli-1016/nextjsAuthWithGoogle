"use client"

import { useState } from "react";
import styles from "../../../game.module.css"
import dollar from "../../assets/dollar.png";
import health from "../../assets/hospital.png";
import education from "../../assets/education.png";
import safety from "../../assets/safety.png";
import { calculateYearlyScore } from "../../utils/gameScoring";
import { useRouter } from "next/navigation";


const Game = () => {
    const [points, setPoints] = useState(100);
    const [inputValues, setInputValues] = useState({
        category1: "",
        category2: "",
        category3: ""
    });
    const [allocations, setAllocations] = useState({
        category1: 0,
        category2: 0,
        category3: 0
    });
    const [errors, setErrors] = useState({
        category1: "",
        category2: "",
        category3: ""
    });
    const [happiness, setHappiness] = useState(0)
    const [currentYear, setCurrentYear] = useState(1)
    const [yearResult, setYearResult] = useState(null)
    const [showYearResult, setShowYearResult] = useState(false)
    const [gameHistory, setGameHistory] = useState([])
    const [showGameHistory, setShowGameHistory] = useState(false)
    
    // New state for dynamic weights
    const [sectorWeights, setSectorWeights] = useState({
        health: 0.2,
        education: 0.4,
        safety: 0.4
    });
    const [weightInputs, setWeightInputs] = useState({
        health: "20",
        education: "40", 
        safety: "40"
    });
    const [weightErrors, setWeightErrors] = useState({
        health: "",
        education: "",
        safety: ""
    });
    const [showWeightSetup, setShowWeightSetup] = useState(true);
    const [gameStarted, setGameStarted] = useState(false);


    const handleInputChange = (category, value) => {
        console.log(`Input changed for ${category}:`, value);
        setInputValues(prev => ({
            ...prev,
            [category]: value
        }));
    };

    // New function to handle weight input changes
    const handleWeightChange = (sector, value) => {
        setWeightInputs(prev => ({
            ...prev,
            [sector]: value
        }));
        
        // Clear error for this sector
        setWeightErrors(prev => ({
            ...prev,
            [sector]: ""
        }));
    };

    // New function to validate and set weights
    const validateAndSetWeights = () => {
        const newErrors = {};
        const newWeights = {};
        let totalWeight = 0;

        // Validate each weight input
        Object.keys(weightInputs).forEach(sector => {
            const value = parseFloat(weightInputs[sector]);
            
            if (isNaN(value) || value < 0) {
                newErrors[sector] = "Please enter a valid positive number";
            } else {
                newWeights[sector] = value / 100; // Convert to decimal (e.g., 20 -> 0.2)
                totalWeight += value;
            }
        });

        // Check if total equals 100
        if (Math.abs(totalWeight - 100) > 0.01) {
            Object.keys(newErrors).forEach(sector => {
                if (!newErrors[sector]) {
                    newErrors[sector] = `Total weights must equal 100% (currently ${totalWeight.toFixed(1)}%)`;
                }
            });
        }

        setWeightErrors(newErrors);

        // If no errors, set the weights and start the game
        if (Object.keys(newErrors).length === 0) {
            setSectorWeights(newWeights);
            setShowWeightSetup(false);
            setGameStarted(true);
        }
    };
    const router = useRouter();


    const handleClick = (category) => {
        console.log("Current inputValues:", inputValues);
        const inputValue = parseInt(inputValues[category]) || 0;
        console.log(`Input value for ${category}:`, inputValue);

        setErrors(prev => ({
            ...prev,
            [category]: ""
        }));

        if (inputValue <= 0) {
            setErrors(prev => ({
                ...prev,
                [category]: "Please enter a positive number"
            }));
            return;
        }

        if (inputValue > points) {
            setErrors(prev => ({
                ...prev,
                [category]: "Cannot allocate more points than available"
            }));
            return;
        }

        setPoints(prev => prev - inputValue);
        setAllocations(prev => {
            const newAllocations = {
                ...prev,
                [category]: prev[category] + inputValue
            };
            const totalAllocated = newAllocations.category1 + newAllocations.category2 + newAllocations.category3;
            setHappiness(totalAllocated);
            return newAllocations;
        });
    }

    const completeYear = async () => {
        // Check if all budget is allocated
        const totalAllocated = allocations.category1 + allocations.category2 + allocations.category3;
        
        console.log("Total allocated:", totalAllocated);
        console.log("Allocations:", allocations);
        
        if (totalAllocated !== 100) {
            alert("Please allocate all 100 points before completing the year!");
            return;
        }
        
        // Calculate yearly score using dynamic weights
        const allocationsForScoring = {
            health: allocations.category1,
            education: allocations.category2,
            safety: allocations.category3
        };
        
        console.log("Allocations for scoring:", allocationsForScoring);
        console.log("Using dynamic weights:", sectorWeights);
        
        const result = calculateYearlyScore(allocationsForScoring, sectorWeights);
        console.log("Year result:", result);
        
        // Log event information for debugging
        if (result.eventName) {
            console.log(`🎉 Event triggered: ${result.eventName} with impact: ${result.eventImpact} points`);
        } else {
            console.log("No events triggered this year");
        }
        
        // Save game data to database
        try {
            const response = await fetch('/api/game/score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: 'temp-user-id', // You can replace this with actual user ID from authentication
                    year: currentYear,
                    allocations: allocationsForScoring,
                    eventName: result.eventName,
                    eventImpact: result.eventImpact
                })
            });
            
            const data = await response.json();
            console.log("API response:", data);
            
            if (data.success) {
                console.log("Game data saved successfully!");
            } else {
                console.error("Failed to save game data:", data.error);
                console.error("Error details:", data.details);
                alert(`Failed to save game data: ${data.error}\nDetails: ${data.details}`);
            }
        } catch (error) {
            console.error("Error saving game data:", error);
        }
        
        setYearResult(result);
        setShowYearResult(true);

    }

    const startNextYear = () => {
        if (currentYear < 3) {
            setCurrentYear(prev => prev + 1);
            setPoints(100);
            setAllocations({
                category1: 0,
                category2: 0,
                category3: 0
            });
            setHappiness(0);
            setShowYearResult(false);
            setYearResult(null);
        } else {
            // Game complete - show final results
            alert("Congratulations! You've completed all 3 years as mayor!");
            router.push('/result')
        }
    }

    const fetchGameHistory = async () => {
        try {
            const response = await fetch('/api/game/score?userId=temp-user-id');
            const data = await response.json();
            
            if (data.success) {
                setGameHistory(data.games);
                setShowGameHistory(true);
            } else {
                console.error("Failed to fetch game history:", data.error);
            }
        } catch (error) {
            console.error("Error fetching game history:", error);
        }
    }



    return (
        <div className={styles.container}>
            {/* Weight Setup Modal */}
            {showWeightSetup && (
                <div className={styles.resultModal}>
                    <div className={styles.resultContent}>
                        <h2>Set Sector Weights</h2>
                        <p>Configure how much each sector should be weighted in scoring (total must equal 100%)</p>
                        
                        <div className={styles.weightInputs}>
                            <div className={styles.weightInput}>
                                <label>Health Weight (%):</label>
                                <input
                                    type="number"
                                    value={weightInputs.health}
                                    onChange={(e) => handleWeightChange("health", e.target.value)}
                                    className={styles.input}
                                />
                                {weightErrors.health && <p className={styles.error}>{weightErrors.health}</p>}
                            </div>
                            
                            <div className={styles.weightInput}>
                                <label>Education Weight (%):</label>
                                <input
                                    type="number"
                                    value={weightInputs.education}
                                    onChange={(e) => handleWeightChange("education", e.target.value)}
                                    className={styles.input}
                                />
                                {weightErrors.education && <p className={styles.error}>{weightErrors.education}</p>}
                            </div>
                            
                            <div className={styles.weightInput}>
                                <label>Safety Weight (%):</label>
                                <input
                                    type="number"
                                    value={weightInputs.safety}
                                    onChange={(e) => handleWeightChange("safety", e.target.value)}
                                    className={styles.input}
                                />
                                {weightErrors.safety && <p className={styles.error}>{weightErrors.safety}</p>}
                            </div>
                        </div>
                        
                        <button onClick={validateAndSetWeights} className={styles.btn}>
                            Start Game
                        </button>
                    </div>
                </div>
            )}

            {gameStarted && (
                <>
                    <div className={styles.header}>
                        <div><h1 className={styles.title}>City Budget Sim</h1></div>
                        <div><h4 className={styles.title}>Year {currentYear} of 3</h4></div>
                        <div className={styles.pointContainer}>
                            <div className={styles.labelsRow}>
                                <h3>Annual Budget {points} </h3>
                                <h3>Citizen Happiness</h3>
                            </div>
                            <div className={styles.valuesRow}>
                                
                                    <img src={dollar.src} className={styles.img} />
                                
                                <div className={styles.happinessSection}>
                                    <progress value={happiness} className={`${styles.customProgress} ${styles.orrange}`} max="100"></progress>
                                    <span>Happiness: {happiness}/100</span>
                                </div>
                            </div>
                        </div>
                    </div>
            <div className={styles.cards}>
                <div className={styles.card}>
                    <img src={health.src} className={styles.img} />
                    <div>
                        <label className={styles.label}>Health</label>
                        <input
                            type="number"
                            className={styles.input}
                            id="category1"
                            value={inputValues.category1}
                            onChange={(e) => handleInputChange("category1", e.target.value)}
                        />
                        {errors.category1 && <p className={styles.error}>{errors.category1}</p>}
                        <progress value={allocations.category1} className={`${styles.customProgress} ${styles.green}`} max="100"></progress>
                        <div className={styles.select}>
                        <label className={styles.selectText}>Select event </label>
                        <select className={styles.select1}>
                            <option>Flu outbreak</option>
                            <option>School protest</option>
                        </select>

                        </div>

                        <button onClick={() => handleClick("category1")} className={styles.btn}>Allocate</button>
                        
                    </div>
                </div>
                <div className={styles.card}>
                    <img src={education.src} className={styles.img} />
                    <div>
                        <label className={styles.label}>Education</label>
                        <input
                            type="number"
                            className={styles.input}
                            id="category2"
                            value={inputValues.category2}
                            onChange={(e) => handleInputChange("category2", e.target.value)}
                        />
                        {errors.category2 && <p className={styles.error}>{errors.category2}</p>}
                        <progress value={allocations.category2} className={`${styles.customProgress} ${styles.yellow}`} max="100"></progress>
                        <div className={styles.select}>
                        <label className={styles.selectText}>Select event </label>
                        <select className={styles.select1}>
                            <option>Flu outbreak</option>
                            <option>School protest</option>
                        </select>

                        </div>
                       
                        <button onClick={() => handleClick("category2")} className={styles.btn}>Allocate</button>
                    </div>
                </div>
                <div className={styles.card}>
                    <img src={safety.src} className={styles.img} />
                    <div>
                        <label className={styles.label}>Safety</label>
                        <input
                            type="number"
                            className={styles.input}
                            id="category3"
                            value={inputValues.category3}
                            onChange={(e) => handleInputChange("category3", e.target.value)}
                        />
                        {errors.category3 && <p className={styles.error}>{errors.category3}</p>}
                        <progress value={allocations.category3} className={`${styles.customProgress} ${styles.red}`} max="100"></progress>
                        <div className={styles.select}>
                        <label className={styles.selectText}>Select event </label>
                        <select className={styles.select1}>
                            <option>Flu outbreak</option>
                            <option>School protest</option>
                        </select>

                        </div>

                        <button onClick={() => handleClick("category3")} className={styles.btn}>Allocate</button>
                    </div>
                </div>
            </div>
            
            {/* Complete Year Button */}
            <div className={styles.completeYearSection}>
                <button 
                    onClick={completeYear} 
                    className={styles.btn}
                    disabled={points > 0}
                >
                    Complete Year {currentYear}
                </button>
                <button 
                    onClick={fetchGameHistory} 
                    className={styles.btn}
                    style={{ marginLeft: '10px' }}
                >
                    View Game History
                </button>
            </div>

            {/* Year Result Modal */}
            {showYearResult && yearResult && (
                <div className={styles.resultModal}>
                    <div className={styles.resultContent}>
                        <h2>Year {currentYear} Results</h2>
                        <div className={styles.scoreDisplay}>
                            <p><strong>Base Score:</strong> {yearResult.baseScore}/100</p>
                            <p><strong>Final Score:</strong> {yearResult.finalScore}/100</p>
                            {yearResult.eventName ? (
                                <div className={styles.eventDisplay}>
                                    <h3>🎉 Special Event Occurred!</h3>
                                    <p><strong>Event:</strong> {yearResult.eventName}</p>
                                    <p><strong>Impact:</strong> <span style={{ color: yearResult.eventImpact > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                        {yearResult.eventImpact > 0 ? '+' : ''}{yearResult.eventImpact} points
                                    </span></p>
                                </div>
                            ) : (
                                <div className={styles.eventDisplay} style={{ backgroundColor: '#e8f5e8', borderColor: '#4caf50' }}>
                                    <h3>📊 Normal Year</h3>
                                    <p>No special events occurred this year.</p>
                                </div>
                            )}
                            <p><strong>Feedback:</strong> {yearResult.feedbackMessage}</p>
                        </div>
                        <div className={styles.allocationSummary}>
                            <h3>Your Allocations:</h3>
                            <p>Health: {allocations.category1} points</p>
                            <p>Education: {allocations.category2} points</p>
                            <p>Safety: {allocations.category3} points</p>
                        </div>
                        <button 
                            onClick={startNextYear} 
                            className={styles.btn}
                        >
                            {currentYear < 3 ? `Start Year ${currentYear + 1}` : 'View Final Results'}
                        </button>
                    </div>
                </div>
            )}

            {/* Game History Modal */}
            {showGameHistory && (
                <div className={styles.resultModal}>
                    <div className={styles.resultContent}>
                        <h2>Game History</h2>
                        {gameHistory.length === 0 ? (
                            <p>No games found. Complete a year to see your history!</p>
                        ) : (
                            <div className={styles.gameHistoryList}>
                                {gameHistory.map((game, index) => (
                                    <div key={game._id || index} className={styles.gameHistoryItem}>
                                        <h3>Game {index + 1}</h3>
                                        <p><strong>Status:</strong> {game.gameStatus}</p>
                                        <p><strong>Current Year:</strong> {game.currentYear}</p>
                                        {game.gameStatus === 'completed' && (
                                            <>
                                                <p><strong>Total Score:</strong> {game.totalScore}/300</p>
                                                <p><strong>Average Score:</strong> {game.averageScore}/100</p>
                                                <p><strong>Performance:</strong> {game.performanceRating}</p>
                                                <p><strong>Re-elected:</strong> {game.isReElected ? 'Yes' : 'No'}</p>
                                            </>
                                        )}
                                        <p><strong>Started:</strong> {new Date(game.startedAt).toLocaleDateString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <button 
                            onClick={() => setShowGameHistory(false)} 
                            className={styles.btn}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
                </>
            )}
        </div>
    )
}

export default Game;
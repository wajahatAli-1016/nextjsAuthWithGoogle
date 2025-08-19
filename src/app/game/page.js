"use client"

import { useState, Suspense } from "react";
import styles from "../../../game.module.css"
import dollar from "../../assets/dollar.png";
import health from "../../assets/hospital.png";
import education from "../../assets/education.png";
import safety from "../../assets/safety.png";
import { calculateYearlyScore } from "../../utils/gameScoring";
import { useRouter } from "next/navigation";
import useTranslation from "../../i18n/useTranslation";
import LanguageSwitcher from "../../components/LanguageSwitcher";


const GameContent = () => {
    const { t } = useTranslation();
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
        console.log('Previous input values:', inputValues);
        setInputValues(prev => {
            const newValues = {
                ...prev,
                [category]: value
            };
            console.log('New input values:', newValues);
            return newValues;
        });
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
                newErrors[sector] = t('weightSetup.validation.invalidNumber');
            } else {
                newWeights[sector] = value / 100; // Convert to decimal (e.g., 30 -> 0.3)
                totalWeight += value;
            }
        });

        // Check if total equals 100
        if (Math.abs(totalWeight - 100) > 0.01) {
            Object.keys(newErrors).forEach(sector => {
                if (!newErrors[sector]) {
                    newErrors[sector] = t('weightSetup.validation.totalMustBe100', { total: totalWeight.toFixed(1) });
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
        const inputValue = parseFloat(inputValues[category]);
        
        console.log(`Allocating ${inputValue} to ${category}`);
        console.log('Current input values:', inputValues);
        
        if (isNaN(inputValue) || inputValue < 0) {
            setErrors(prev => ({
                ...prev,
                [category]: t('errors.invalidInput')
            }));
            return;
        }
        
        // Calculate remaining budget correctly
        const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);
        const remainingBudget = 100 - totalAllocated;
        
        console.log(`Total allocated: ${totalAllocated}, Remaining budget: ${remainingBudget}, Trying to allocate: ${inputValue}`);
        
        if (inputValue > remainingBudget) {
            setErrors(prev => ({
                ...prev,
                [category]: t('errors.exceedsBudget')
            }));
            return;
        }
        
        // Update allocations and happiness in a single state update
        setAllocations(prev => {
            const newAllocations = {
                ...prev,
                [category]: inputValue
            };
            const newTotalAllocated = newAllocations.category1 + newAllocations.category2 + newAllocations.category3;
            setHappiness(newTotalAllocated);
            return newAllocations;
        });
        
        // Keep the input value visible for user reference
        // setInputValues(prev => ({
        //     ...prev,
        //     [category]: ""
        // }));
        
        setErrors(prev => ({
            ...prev,
            [category]: ""
        }));
        
        console.log('Allocation completed for', category);
        
       
        setPoints(points - inputValue)
    };

    const completeYear = async () => {
        // Check if all budget is allocated
        const totalAllocated = allocations.category1 + allocations.category2 + allocations.category3;
        
        console.log("Total allocated:", totalAllocated);
        console.log("Allocations:", allocations);
        
        if (totalAllocated !== 100) {
            alert(t('errors.allocateAllPoints'));
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
                }),
            });

            if (response.ok) {
                console.log('Game data saved successfully');
            } else {
                console.error('Failed to save game data');
            }
        } catch (error) {
            console.error('Error saving game data:', error);
        }
        
        setYearResult(result);
        setShowYearResult(true);
    };

    const startNextYear = () => {
        if (currentYear < 3) {
            setCurrentYear(prev => prev + 1);
            setPoints(100);
            setInputValues({
                category1: "",
                category2: "",
                category3: ""
            });
            setAllocations({
                category1: 0,
                category2: 0,
                category3: 0
            });
            setErrors({
                category1: "",
                category2: "",
                category3: ""
            });
            setHappiness(0);
            setShowYearResult(false);
            setYearResult(null);
        } else {
            // Game completed, redirect to results page
            router.push('/result?userId=temp-user-id');
        }
    };

    const closeYearResultModal = () => {
        setShowYearResult(false);
        setYearResult(null);
    };

    const fetchGameHistory = async () => {
        try {
            const response = await fetch('/api/game/score?userId=temp-user-id');
            if (response.ok) {
                const data = await response.json();
                setGameHistory(data.games || []);
                setShowGameHistory(true);
                // Prevent body scroll when modal is open
                document.body.classList.add('modal-open');
            }
        } catch (error) {
            console.error('Error fetching game history:', error);
        }
    };

    const closeGameHistory = () => {
        setShowGameHistory(false);
        // Restore body scroll when modal is closed
        document.body.classList.remove('modal-open');
    };

    if (showWeightSetup) {
        return (
            <div className={styles.container}>
                <div className={styles.weightSetup}>
                    <h2>{t('weightSetup.title')}</h2>
                    <p>{t('weightSetup.description')}</p>
                    
                    <div className={styles.weightInputs}>
                        <div className={styles.weightInput}>
                            <label>{t('weightSetup.healthWeight')}</label>
                            <input
                                type="number"
                                value={weightInputs.health}
                                onChange={(e) => handleWeightChange('health', e.target.value)}
                                placeholder="20"
                            />
                            {weightErrors.health && <span className={styles.error}>{weightErrors.health}</span>}
                        </div>
                        
                        <div className={styles.weightInput}>
                            <label>{t('weightSetup.educationWeight')}</label>
                            <input
                                type="number"
                                value={weightInputs.education}
                                onChange={(e) => handleWeightChange('education', e.target.value)}
                                placeholder="40"
                            />
                            {weightErrors.education && <span className={styles.error}>{weightErrors.education}</span>}
                        </div>
                        
                        <div className={styles.weightInput}>
                            <label>{t('weightSetup.safetyWeight')}</label>
                            <input
                                type="number"
                                value={weightInputs.safety}
                                onChange={(e) => handleWeightChange('safety', e.target.value)}
                                placeholder="40"
                            />
                            {weightErrors.safety && <span className={styles.error}>{weightErrors.safety}</span>}
                        </div>
                    </div>
                    
                    <button onClick={validateAndSetWeights} className={styles.startButton}>
                        {t('game.startGame')}
                    </button>
                </div>
            </div>
        );
    }

    // Game History Modal
    if (showGameHistory) {
        return (
            <div className={styles.gameHistoryModal}>
                <div className={styles.gameHistoryContent}>
                    <div className={styles.gameHistoryHeader}>
                        <h2>📊 {t('gameHistory.title')}</h2>
                        <button 
                            onClick={closeGameHistory} 
                            className={styles.gameHistoryCloseButton}
                        >
                            ×
                        </button>
                    </div>
                    
                    {gameHistory.length === 0 ? (
                        <div className={styles.gameHistoryEmpty}>
                            <div className={styles.gameHistoryEmptyIcon}>📋</div>
                            <h3>No Games Found</h3>
                            <p>Complete your first game to see your history here!</p>
                        </div>
                    ) : (
                        <div className={styles.gameHistoryList}>
                            {gameHistory.map((game, index) => (
                                <div key={index} className={styles.gameHistoryItem}>
                                    <div className={styles.gameHistoryItemHeader}>
                                        <span className={styles.gameHistoryGameNumber}>
                                            Game #{index + 1}
                                        </span>
                                        <span className={`${styles.gameHistoryStatus} ${
                                            game.currentYear === 3 ? styles.completed : styles.inProgress
                                        }`}>
                                            {game.currentYear === 3 ? 'Completed' : 'In Progress'}
                                        </span>
                                    </div>
                                    
                                    {/* Game Overview */}
                                    <div className={styles.gameHistoryDetails}>
                                        <div className={styles.gameHistoryDetail}>
                                            <div className={styles.gameHistoryDetailLabel}>Year</div>
                                            <div className={styles.gameHistoryDetailValue}>
                                                {game.currentYear}/3
                                            </div>
                                        </div>
                                        <div className={styles.gameHistoryDetail}>
                                            <div className={styles.gameHistoryDetailLabel}>Total Score</div>
                                            <div className={styles.gameHistoryDetailValue}>
                                                {game.totalScore || 0}
                                            </div>
                                        </div>
                                        <div className={styles.gameHistoryDetail}>
                                            <div className={styles.gameHistoryDetailLabel}>Average</div>
                                            <div className={styles.gameHistoryDetailValue}>
                                                {game.averageScore || 0}
                                            </div>
                                        </div>
                                        <div className={styles.gameHistoryDetail}>
                                            <div className={styles.gameHistoryDetailLabel}>Status</div>
                                            <div className={styles.gameHistoryDetailValue}>
                                                {game.currentYear === 3 ? '🏆' : '⏳'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Yearly Breakdown */}
                                    {game.yearlyScores && game.yearlyScores.length > 0 && (
                                        <div className={styles.gameHistoryYearlyBreakdown}>
                                            <h4 className={styles.gameHistorySectionTitle}>📅 Yearly Performance</h4>
                                            <div className={styles.gameHistoryYearlyGrid}>
                                                {game.yearlyScores.map((year, yearIndex) => (
                                                    <div key={yearIndex} className={styles.gameHistoryYearCard}>
                                                        <div className={styles.gameHistoryYearHeader}>
                                                            <span className={styles.gameHistoryYearNumber}>
                                                                Year {year.year || yearIndex + 1}
                                                            </span>
                                                            <span className={styles.gameHistoryYearScore}>
                                                                {year.finalScore || 0}
                                                            </span>
                                                        </div>
                                                        <div className={styles.gameHistoryYearDetails}>
                                                            <div className={styles.gameHistoryYearDetail}>
                                                                <span className={styles.gameHistoryYearLabel}>Base:</span>
                                                                <span className={styles.gameHistoryYearValue}>
                                                                    {year.baseScore || 0}
                                                                </span>
                                                            </div>
                                                            {year.eventName && (
                                                                <div className={styles.gameHistoryYearDetail}>
                                                                    <span className={styles.gameHistoryYearLabel}>Event:</span>
                                                                    <span className={styles.gameHistoryYearEvent}>
                                                                        {year.eventName}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {year.allocations && (
                                                            <div className={styles.gameHistoryAllocations}>
                                                                <div className={styles.gameHistoryAllocationItem}>
                                                                    <span className={styles.gameHistoryAllocationLabel}>🏥</span>
                                                                    <span className={styles.gameHistoryAllocationValue}>
                                                                        {year.allocations.health || 0}%
                                                                    </span>
                                                                </div>
                                                                <div className={styles.gameHistoryAllocationItem}>
                                                                    <span className={styles.gameHistoryAllocationLabel}>🎓</span>
                                                                    <span className={styles.gameHistoryAllocationValue}>
                                                                        {year.allocations.education || 0}%
                                                                    </span>
                                                                </div>
                                                                <div className={styles.gameHistoryAllocationItem}>
                                                                    <span className={styles.gameHistoryAllocationLabel}>🛡️</span>
                                                                    <span className={styles.gameHistoryAllocationValue}>
                                                                        {year.allocations.safety || 0}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Game Performance Summary */}
                                    {game.currentYear === 3 && (
                                        <div className={styles.gameHistoryPerformance}>
                                            <h4 className={styles.gameHistorySectionTitle}>🏆 Final Performance</h4>
                                            <div className={styles.gameHistoryPerformanceGrid}>
                                                <div className={styles.gameHistoryPerformanceItem}>
                                                    <div className={styles.gameHistoryPerformanceLabel}>Performance Rating</div>
                                                    <div className={styles.gameHistoryPerformanceValue}>
                                                        {game.performanceRating || 'N/A'}
                                                    </div>
                                                </div>
                                                <div className={styles.gameHistoryPerformanceItem}>
                                                    <div className={styles.gameHistoryPerformanceLabel}>Re-election</div>
                                                    <div className={styles.gameHistoryPerformanceValue}>
                                                        {game.isReElected ? '✅ Yes' : '❌ No'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setShowGameHistory(false)} 
                        className={styles.gameHistoryBackButton}
                    >
                        ← Back to Game
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.gameContainer}>
            {/* Language Switcher */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                <LanguageSwitcher />
            </div>

            {/* Point Card on Top */}
            <div className={styles.pointCard}>
                <h1>{t('game.title')}</h1>
                <h2>{t('game.year')} {currentYear} {t('game.of')} 3</h2>
                <div className={styles.pointInfo}>
                    <div className={styles.budgetInfo}>
                        <img src={dollar.src} alt="Budget" />
                        <span>{t('game.annualBudget')}: {points}</span>
                    </div>
                    <div className={styles.happinessInfo}>
                        <span>{t('game.citizenHappiness')}: {happiness}%</span>
                    </div>
                </div>
            </div>

            {/* Category Cards Row */}
            <div className={styles.categoryCardsContainer}>
                <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <img src={health.src} alt="Health" />
                        <h3>{t('categories.health')}</h3>
                    </div>
                    <div className={styles.inputSection}>
                        <input
                            type="number"
                            value={inputValues.category1}
                            onChange={(e) => handleInputChange('category1', e.target.value)}
                            placeholder="0"
                            className={styles.allocationInput}
                        />
                        <button onClick={() => handleClick('category1')} className={styles.allocateButton}>
                            {t('game.allocate')}
                        </button>
                    </div>
                    {errors.category1 && <span className={styles.error}>{errors.category1}</span>}
                    <div className={styles.progressSection}>
                        <div className={styles.progressLabel}>
                            <span>{t('game.allocated')}: {allocations.category1}%</span>
                            <span>{t('game.remaining')}: {points - allocations.category1}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill} 
                                style={{ width: `${allocations.category1}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <img src={education.src} alt="Education" />
                        <h3>{t('categories.education')}</h3>
                    </div>
                    <div className={styles.inputSection}>
                        <input
                            type="number"
                            value={inputValues.category2}
                            onChange={(e) => handleInputChange('category2', e.target.value)}
                            placeholder="0"
                            className={styles.allocationInput}
                        />
                        <button onClick={() => handleClick('category2')} className={styles.allocateButton}>
                            {t('game.allocate')}
                        </button>
                    </div>
                    {errors.category2 && <span className={styles.error}>{errors.category2}</span>}
                    <div className={styles.progressSection}>
                        <div className={styles.progressLabel}>
                            <span>{t('game.allocated')}: {allocations.category2}%</span>
                            <span>{t('game.remaining')}: {points - allocations.category2}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill} 
                                style={{ width: `${allocations.category2}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                        <img src={safety.src} alt="Safety" />
                        <h3>{t('categories.safety')}</h3>
                    </div>
                    <div className={styles.inputSection}>
                        <input
                            type="number"
                            value={inputValues.category3}
                            onChange={(e) => handleInputChange('category3', e.target.value)}
                            placeholder="0"
                            className={styles.allocationInput}
                        />
                        <button onClick={() => handleClick('category3')} className={styles.allocateButton}>
                            {t('game.allocate')}
                        </button>
                    </div>
                    {errors.category3 && <span className={styles.error}>{errors.category3}</span>}
                    <div className={styles.progressSection}>
                        <div className={styles.progressLabel}>
                            <span>{t('game.allocated')}: {allocations.category3}%</span>
                            <span>{t('game.remaining')}: {points - allocations.category3}%</span>
                        </div>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill} 
                                style={{ width: `${allocations.category3}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.actions}>
                <button onClick={completeYear} className={styles.completeButton}>
                    {t('game.completeYear')} {currentYear}
                </button>
                <button onClick={fetchGameHistory} className={styles.completeButton}>
                    {t('game.viewGameHistory')}
                </button>
            </div>

            {/* Year Result Modal */}
            {showYearResult && yearResult && (
                <div className={styles.yearResultModal}>
                    <div className={styles.yearResultContent}>
                        <div className={styles.modalHeader}>
                            <h2>{t('yearResults.title', { year: currentYear })}</h2>
                            <button onClick={closeYearResultModal} className={styles.closeButton}>
                                ×
                            </button>
                        </div>
                        
                        <div className={styles.scoreSection}>
                            <div className={styles.scoreItem}>
                                <span>{t('yearResults.baseScore')}:</span>
                                <span>{yearResult.baseScore}</span>
                            </div>
                            <div className={styles.scoreItem}>
                                <span>{t('yearResults.finalScore')}:</span>
                                <span>{yearResult.finalScore}</span>
                            </div>
                        </div>
                        
                        {yearResult.eventName ? (
                            <div className={styles.eventSection}>
                                <h3>{t('yearResults.specialEvent')}</h3>
                                <div className={styles.eventDetails}>
                                    <div><strong>{t('yearResults.event')}:</strong> {yearResult.eventName}</div>
                                    <div><strong>{t('yearResults.impact')}:</strong> {yearResult.eventImpact} {t('yearResults.points')}</div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.eventSection}>
                                <h3>{t('yearResults.normalYear')}</h3>
                                <p>{t('yearResults.noEvents')}</p>
                            </div>
                        )}
                        
                        <div className={styles.feedbackSection}>
                            <h3>{t('yearResults.feedback')}</h3>
                            <p>{yearResult.feedback}</p>
                        </div>
                        
                        <div className={styles.allocationSection}>
                            <h3>{t('yearResults.yourAllocations')}</h3>
                            <div className={styles.allocationGrid}>
                                <div className={styles.allocationItem}>
                                    <img src={health.src} alt="Health" />
                                    <span>{t('categories.health')}: {allocations.category1}%</span>
                                </div>
                                <div className={styles.allocationItem}>
                                    <img src={education.src} alt="Education" />
                                    <span>{t('categories.education')}: {allocations.category2}%</span>
                                </div>
                                <div className={styles.allocationItem}>
                                    <img src={safety.src} alt="Safety" />
                                    <span>{t('categories.safety')}: {allocations.category3}%</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className={styles.modalActions}>
                            {currentYear < 3 ? (
                                <button onClick={startNextYear} className={styles.nextYearButton}>
                                    {t('yearResults.startNextYear', { year: currentYear + 1 })}
                                </button>
                            ) : (
                                <button onClick={startNextYear} className={styles.finalResultsButton}>
                                    {t('yearResults.viewFinalResults')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Game = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GameContent />
        </Suspense>
    );
};

export default Game; 
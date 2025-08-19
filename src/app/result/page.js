"use client"
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Head from 'next/head';
import styles from '../../../game.module.css';

const ResultsChart = ({ results }) => {
  if (typeof window === 'undefined') return (
    <div className={styles.chartLoading}>
      <div className={styles.chartPlaceholder}></div>
    </div>
  );
  
  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>📊 Performance Trends</h3>
        <div className={styles.chartGrid}>
          {results.map((year, index) => (
            <div key={year._id} className={styles.chartItem}>
              <div className={styles.chartLabel}>Year {year.year}</div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill}
                    style={{ width: `${year.finalScore}%` }}
                  ></div>
                </div>
                <div className={styles.progressValue}>{year.finalScore}/100</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function GameResultsContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        if (!userId) {
          setError('No user ID provided. Please complete a game first or add ?userId=temp-user-id to the URL to see sample results.');
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/result?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch results');
        const data = await response.json();
        setResults(data.results || []);
        
        if (!data.results || data.results.length === 0) {
          setError(`No game results found for user: ${userId}. Please complete a game first.`);
          return;
        }
        
        if (data.results && data.results.length === 3) {
          const { calculateGameResult } = await import('../../utils/gameScoring.js');
          const yearlyScores = data.results.map(year => ({
            finalScore: year.finalScore,
            baseScore: year.baseScore,
            allocations: year.allocations
          }));
          const overallResult = calculateGameResult(yearlyScores);
          setGameResult(overallResult);
        } else if (data.results.length > 0) {
          setError(`Game in progress. You have completed ${data.results.length} out of 3 years. Please complete all years to see final results.`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [userId]);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <h2 className={styles.loadingTitle}>Loading your results...</h2>
      <p className={styles.loadingSubtitle}>Preparing your mayoral performance report</p>
    </div>
  );

  if (error) return (
    <div className={styles.errorContainer}>
      <div className={styles.errorCard}>
        <div className={styles.errorIcon}>📊</div>
        <h2 className={styles.errorTitle}>No Results Found</h2>
        <p className={styles.errorMessage}>{error}</p>
        <div className={styles.errorInstructions}>
          <h3>To see your results:</h3>
          <ol className={styles.instructionList}>
            <li><span className={styles.instructionNumber}>1</span>Complete all 3 years of the game</li>
            <li><span className={styles.instructionNumber}>2</span>You&apos;ll be automatically redirected to this page</li>
            <li><span className={styles.instructionNumber}>3</span>Or manually add <code>?userId=temp-user-id</code> to the URL</li>
          </ol>
        </div>
        <Link href="/game" className={styles.startGameBtn}>🎮 Start New Game</Link>
      </div>
    </div>
  );

  return (
    <div className={styles.resultsPage}>
      <Head>
        <title>Game Results | Yearly Progress</title>
      </Head>
      
      <div className={styles.resultsContainer}>
        <header className={styles.heroHeader}>
          <div className={styles.heroCard}>
            <div className={styles.heroIcon}>🏆</div>
            <h1 className={styles.heroTitle}>Your 3-Year Mayoral Journey</h1>
            <p className={styles.heroSubtitle}>A comprehensive review of your city management strategy</p>
          </div>
        </header>

        {gameResult && (
          <section className={styles.performanceSection}>
            <div className={styles.performanceCard}>
              <h2 className={styles.performanceTitle}>🏆 Final Performance Report</h2>
              <div className={styles.performanceGrid}>
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>📈</div>
                  <h3>Total Final Score</h3>
                  <p className={styles.performanceValue}>{gameResult.totalScore}</p>
                  <p className={styles.performanceLabel}>out of 300</p>
                </div>
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>🎯</div>
                  <h3>Cumulative Base Score</h3>
                  <p className={styles.performanceValue}>
                    {results.reduce((sum, year) => sum + year.baseScore, 0)}
                  </p>
                  <p className={styles.performanceLabel}>Base Score 1 + 2 + 3</p>
                </div>
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>📊</div>
                  <h3>Average Score</h3>
                  <p className={styles.performanceValue}>{gameResult.averageScore}</p>
                  <p className={styles.performanceLabel}>per year</p>
                </div>
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>⭐</div>
                  <h3>Performance</h3>
                  <p className={styles.performanceValue}>{gameResult.performanceRating}</p>
                </div>
                <div className={styles.performanceItem}>
                  <div className={styles.performanceIcon}>{gameResult.isReElected ? '✅' : '❌'}</div>
                  <h3>Re-election</h3>
                  <p className={styles.performanceValue}>{gameResult.isReElected ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        <section className={styles.breakdownSection}>
          <div className={styles.breakdownCard}>
            <div className={styles.breakdownHeader}>
              <h2 className={styles.breakdownTitle}>📋 Yearly Performance Breakdown</h2>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>🏥 Health</th>
                    <th>🎓 Education</th>
                    <th>🛡️ Safety</th>
                    <th>Base Score</th>
                    <th>Final Score</th>
                    <th>Events</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((yearData, index) => (
                    <tr key={yearData._id} className={styles.tableRow}>
                      <td>
                        <div className={styles.yearCell}>
                          <div className={styles.yearBadge}>{yearData.year}</div>
                          <span>Year {yearData.year}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.allocationCell}>
                          <div className={styles.allocationBar}>
                            <div 
                              className={styles.allocationFill}
                              style={{ width: `${yearData.allocations.health}%` }}
                            ></div>
                          </div>
                          <span>{yearData.allocations.health}%</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.allocationCell}>
                          <div className={styles.allocationBar}>
                            <div 
                              className={styles.allocationFill}
                              style={{ width: `${yearData.allocations.education}%` }}
                            ></div>
                          </div>
                          <span>{yearData.allocations.education}%</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.allocationCell}>
                          <div className={styles.allocationBar}>
                            <div 
                              className={styles.allocationFill}
                              style={{ width: `${yearData.allocations.safety}%` }}
                            ></div>
                          </div>
                          <span>{yearData.allocations.safety}%</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.scoreCell}>
                          <span className={styles.scoreValue}>{yearData.baseScore}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.scoreCell}>
                          <span className={`${styles.scoreValue} ${styles.finalScore}`}>
                            {yearData.finalScore}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.eventCell}>
                          {yearData.eventName ? (
                            <div className={styles.eventBadge}>
                              🎉 Event: {yearData.eventName}
                            </div>
                          ) : (
                            <span className={styles.noEvent}>None</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <ResultsChart results={results} />

        <section className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>📊 Allocation Summary</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <h3>🏥 Health</h3>
                <p className={styles.summaryValue}>
                  {Math.round(results.reduce((sum, year) => sum + year.allocations.health, 0) / results.length)}%
                </p>
                <p className={styles.summaryLabel}>Average Allocation</p>
              </div>
              <div className={styles.summaryItem}>
                <h3>🎓 Education</h3>
                <p className={styles.summaryValue}>
                  {Math.round(results.reduce((sum, year) => sum + year.allocations.education, 0) / results.length)}%
                </p>
                <p className={styles.summaryLabel}>Average Allocation</p>
              </div>
              <div className={styles.summaryItem}>
                <h3>🛡️ Safety</h3>
                <p className={styles.summaryValue}>
                  {Math.round(results.reduce((sum, year) => sum + year.allocations.safety, 0) / results.length)}%
                </p>
                <p className={styles.summaryLabel}>Average Allocation</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.feedbackSection}>
          <div className={styles.feedbackCard}>
            <h2 className={styles.feedbackTitle}>💬 Yearly Feedback & Insights</h2>
            <div className={styles.feedbackGrid}>
              {results.map((yearData, index) => (
                <div key={yearData._id} className={styles.feedbackItem}>
                  <div className={styles.feedbackHeader}>
                    <h3>Year {yearData.year}</h3>
                    <div className={styles.feedbackScore}>{yearData.finalScore}/100</div>
                  </div>
                  <p className={styles.feedbackText}>
                    {yearData.eventName 
                      ? `🎉 Event: ${yearData.eventName} - ${yearData.eventImpact} points`
                      : 'No special events occurred this year.'
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>Ready for another term?</h2>
            <p className={styles.ctaText}>Test different strategies and see how they affect your city&apos;s performance!</p>
            <Link href="/game" className={styles.ctsButton}>🎮 Play Again</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function GameResults() {
  return (
    <Suspense fallback={
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <h2 className={styles.loadingTitle}>Loading...</h2>
      </div>
    }>
      <GameResultsContent />
    </Suspense>
  );
} 
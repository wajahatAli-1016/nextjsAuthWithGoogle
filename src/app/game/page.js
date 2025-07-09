"use client"

import { useState } from "react";
import styles from "../../../game.module.css"
import dollar from "../../assets/dollar.png";
import health from "../../assets/hospital.png";
import education from "../../assets/education.png";
import safety from "../../assets/safety.png";

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

    const handleInputChange = (category, value) => {
        console.log(`Input changed for ${category}:`, value);
        setInputValues(prev => ({
            ...prev,
            [category]: value
        }));
    };

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
        setAllocations(prev => ({
            ...prev,
            [category]: prev[category] + inputValue
        }));
    }

    

    return (
        <div className={styles.container}>
            <div><h1 className={styles.title}>Points Allocation</h1></div>
            <div className={styles.points}>
                <h1> Total points: {points}</h1>
                <img src={dollar.src} className={styles.img} />
            </div>
            <div className={styles.cards}>
                <div className={styles.card}>
                    <img src={health.src} className={styles.img} />
                    <div>
                        <label>Health</label>
                        <input 
                            type="number" 
                            className={styles.input} 
                            id="category1"
                            value={inputValues.category1}
                            onChange={(e) => handleInputChange("category1", e.target.value)}
                        />
                        {errors.category1 && <p className={styles.error}>{errors.category1}</p>}
                        <button onClick={()=>{handleClick("category1"); health();}} className={styles.btn}>Allocate</button>
                    </div>
                </div>
                <div className={styles.card}>
                    <img src={education.src} className={styles.img} />
                    <div>
                        <label>Education</label>
                        <input 
                            type="number" 
                            className={styles.input} 
                            id="category2"
                            value={inputValues.category2}
                            onChange={(e) => handleInputChange("category2", e.target.value)}
                        />
                        {errors.category2 && <p className={styles.error}>{errors.category2}</p>}
                        <button onClick={()=>handleClick("category2")} className={styles.btn}>Allocate</button>
                    </div>
                </div>
                <div className={styles.card}>
                    <img src={safety.src} className={styles.img} />
                    <div>
                        <label>Safety</label>
                        <input 
                            type="number" 
                            className={styles.input} 
                            id="category3"
                            value={inputValues.category3}
                            onChange={(e) => handleInputChange("category3", e.target.value)}
                        />
                        {errors.category3 && <p className={styles.error}>{errors.category3}</p>}
                        <button onClick={()=>handleClick("category3")} className={styles.btn}>Allocate</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Game;
console.log('Script file loaded');

// Make startQuiz available globally for the backup handler
window.startQuiz = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded event fired');
    
    // DOM Elements - with error checking
    try {
        const startScreen = document.getElementById('start-screen');
        const questionScreen = document.getElementById('question-screen');
        const resultsScreen = document.getElementById('results-screen');
        
        const startButton = document.getElementById('start-button');
        console.log('Start button found:', !!startButton);
        
        const submitButton = document.getElementById('submit-button');
        const showAnswerButton = document.getElementById('show-answer-button');
        const nextButton = document.getElementById('next-button');
        const restartButton = document.getElementById('restart-button');
        
        const questionElement = document.getElementById('question');
        const answerInput = document.getElementById('answer-input');
        const feedbackElement = document.getElementById('feedback');
        const currentQuestionElement = document.getElementById('current-question');
        const progressBar = document.getElementById('progress');
        
        const correctCountElement = document.getElementById('correct-count');
        const percentageElement = document.getElementById('percentage');
        const encouragementElement = document.getElementById('encouragement');
        
        // Add audio elements
        const successSound = document.getElementById('success-sound');
        const wrongSound = document.getElementById('wrong-sound');
        
        // Function to play sounds with error handling
        function playSound(sound) {
            try {
                if (sound) {
                    sound.currentTime = 0; // Reset the audio to start
                    sound.play().catch(error => {
                        console.error('Error playing sound:', error);
                    });
                }
            } catch (error) {
                console.error('Error playing sound:', error);
            }
        }
        
        // Game state
        let questions = [];
        let currentQuestionIndex = 0;
        let correctAnswers = 0;
        let currentAnswer = null;
        let retryAttempted = false;
        
        // Define startQuiz function and make it globally available
        function startQuiz() {
            console.log('Start quiz function called');
            // Reset game state
            questions = generateQuestions(100);
            currentQuestionIndex = 0;
            correctAnswers = 0;
            
            // Show question screen, hide other screens
            startScreen.classList.remove('active');
            resultsScreen.classList.remove('active');
            questionScreen.classList.add('active');
            
            // Load first question
            loadQuestion();
        }
        
        // Make it available globally
        window.startQuiz = startQuiz;
        
        // Event listeners with explicit error handling
        if (startButton) {
            startButton.addEventListener('click', function(e) {
                console.log('Start button clicked');
                startQuiz();
                e.preventDefault();
            });
            
            // Also set the onclick handler directly
            startButton.onclick = function(e) {
                console.log('Start button onclick triggered');
                startQuiz();
                return false;
            };
        } else {
            console.error('Start button not found');
        }
        
        if (submitButton) {
            submitButton.addEventListener('click', checkAnswer);
        } else {
            console.error('Submit button not found');
        }

        if (showAnswerButton) {
            showAnswerButton.addEventListener('click', showAnswer);
        } else {
            console.error('Show answer button not found');
        }

        if (nextButton) {
            nextButton.addEventListener('click', nextQuestion);
        } else {
            console.error('Next button not found');
        }

        if (restartButton) {
            restartButton.addEventListener('click', startQuiz);
        } else {
            console.error('Restart button not found');
        }
        
        // Keyboard shortcuts
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
        
        // Question generation functions
        function generateAdditionQuestion() {
            const num1 = Math.floor(Math.random() * 1000) + 1;
            const num2 = Math.floor(Math.random() * 1000) + 1;
            const answer = num1 + num2;
            return {
                question: `${num1} + ${num2} = ?`,
                answer: answer
            };
        }
        
        function generateSubtractionQuestion() {
            let num1 = Math.floor(Math.random() * 1000) + 1;
            let num2 = Math.floor(Math.random() * num1) + 1; // Ensure num2 <= num1 to avoid negative results
            const answer = num1 - num2;
            return {
                question: `${num1} - ${num2} = ?`,
                answer: answer
            };
        }
        
        function generateMultiplicationQuestion() {
            // Randomly choose between 2-digit × 1-digit or 2-digit × 2-digit
            const isHarderQuestion = Math.random() > 0.5;
            
            let num1, num2;
            if (isHarderQuestion) {
                // 2-digit × 2-digit
                num1 = Math.floor(Math.random() * 90) + 10; // 10-99
                num2 = Math.floor(Math.random() * 90) + 10; // 10-99
            } else {
                // 2-digit × 1-digit
                num1 = Math.floor(Math.random() * 90) + 10; // 10-99
                num2 = Math.floor(Math.random() * 9) + 1; // 1-9
            }
            
            const answer = num1 * num2;
            return {
                question: `${num1} × ${num2} = ?`,
                answer: answer
            };
        }
        
        function generateDivisionQuestion() {
            // Generate integer division questions with dividend ≤ 144
            // First, choose a divisor (1-12)
            const divisor = Math.floor(Math.random() * 12) + 1;
            
            // Then, choose a quotient (1-12)
            const quotient = Math.floor(Math.random() * 12) + 1;
            
            // Calculate the dividend to ensure clean division, will be ≤ 144
            const dividend = divisor * quotient;
            
            return {
                question: `${dividend} ÷ ${divisor} = ?`,
                answer: quotient
            };
        }
        
        function generateQuestions(count) {
            const questions = [];
            
            for (let i = 0; i < count; i++) {
                // Randomly choose question type
                const questionType = Math.floor(Math.random() * 4);
                
                let question;
                switch (questionType) {
                    case 0:
                        question = generateAdditionQuestion();
                        break;
                    case 1:
                        question = generateSubtractionQuestion();
                        break;
                    case 2:
                        question = generateMultiplicationQuestion();
                        break;
                    case 3:
                        question = generateDivisionQuestion();
                        break;
                }
                
                questions.push(question);
            }
            
            return questions;
        }
        
        // Game functions
        function loadQuestion() {
            console.log('Loading question', currentQuestionIndex + 1);
            const question = questions[currentQuestionIndex];
            
            // Update UI
            questionElement.textContent = question.question;
            currentQuestionElement.textContent = currentQuestionIndex + 1;
            progressBar.style.width = `${(currentQuestionIndex / questions.length) * 100}%`;
            
            // Reset for new question
            answerInput.value = '';
            answerInput.focus();
            feedbackElement.classList.add('hidden');
            showAnswerButton.classList.add('hidden');
            nextButton.classList.add('hidden');
            
            // Store current answer
            currentAnswer = question.answer;
            retryAttempted = false;
        }
        
        function checkAnswer() {
            const userAnswer = parseInt(answerInput.value);
            
            // Validate input
            if (isNaN(userAnswer)) {
                feedbackElement.textContent = 'Please enter a number';
                feedbackElement.className = 'feedback incorrect';
                feedbackElement.classList.remove('hidden');
                playSound(wrongSound); // Play wrong sound for invalid input
                return;
            }
            
            // Check answer
            if (userAnswer === currentAnswer) {
                // Correct answer
                feedbackElement.textContent = 'Correct!';
                feedbackElement.className = 'feedback correct';
                correctAnswers++;
                showAnswerButton.classList.add('hidden');
                nextButton.classList.remove('hidden');
                playSound(successSound); // Play success sound
            } else {
                // Incorrect answer
                if (!retryAttempted) {
                    feedbackElement.textContent = 'Try again';
                    feedbackElement.className = 'feedback incorrect';
                    retryAttempted = true;
                    answerInput.value = '';
                    answerInput.focus();
                    showAnswerButton.classList.remove('hidden');
                    playSound(wrongSound); // Play wrong sound
                } else {
                    feedbackElement.textContent = `Incorrect. The answer is ${currentAnswer}`;
                    feedbackElement.className = 'feedback incorrect';
                    showAnswerButton.classList.add('hidden');
                    nextButton.classList.remove('hidden');
                    playSound(wrongSound); // Play wrong sound
                }
            }
            
            feedbackElement.classList.remove('hidden');
        }
        
        function showAnswer() {
            feedbackElement.textContent = `The answer is ${currentAnswer}`;
            feedbackElement.className = 'feedback incorrect';
            showAnswerButton.classList.add('hidden');
            nextButton.classList.remove('hidden');
            playSound(wrongSound); // Play wrong sound when showing answer
        }
        
        function nextQuestion() {
            currentQuestionIndex++;
            
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                showResults();
            }
        }
        
        function showResults() {
            // Switch to results screen
            questionScreen.classList.remove('active');
            resultsScreen.classList.add('active');
            
            // Calculate and display results
            const percentage = Math.round((correctAnswers / questions.length) * 100);
            correctCountElement.textContent = correctAnswers;
            percentageElement.textContent = percentage;
            
            // Play sound based on score
            if (percentage >= 50) {
                playSound(successSound); // Play success sound for good scores
            } else {
                playSound(wrongSound); // Play wrong sound for poor scores
            }
            
            // Show encouraging message based on score
            if (percentage >= 90) {
                encouragementElement.textContent = 'Outstanding! You\'re a maths superstar!';
            } else if (percentage >= 75) {
                encouragementElement.textContent = 'Great job! You have strong maths skills!';
            } else if (percentage >= 50) {
                encouragementElement.textContent = 'Good effort! Keep practicing to improve!';
            } else {
                encouragementElement.textContent = 'Keep practicing! You\'ll get better each time!';
            }
        }
        
    } catch (error) {
        console.error('Error initializing the app:', error);
        alert('There was an error loading the application. Please refresh the page.');
    }
});

// Shared data and functions for both user and admin pages

// Initialize competitions data
let competitions = [];
let completedCompetitions = [];
let allRegistrations = [];

// Current competition selected for registration
let selectedCompetition = null;

// Initialize the application
function initCompetitions() {
    // Load data from localStorage
    const savedCompetitions = localStorage.getItem('tradenow_competitions');
    const savedCompleted = localStorage.getItem('tradenow_completed');
    const savedRegistrations = localStorage.getItem('tradenow_registrations');
    
    // Initialize competitions
    if (savedCompetitions) {
        competitions = JSON.parse(savedCompetitions);
    } else {
        // Default competition data
        competitions = [
            {
                id: 1,
                entryFee: 1,
                maxCompetitors: 5,
                prize: "$5,000 Prop Account",
                currentCompetitors: Math.floor(Math.random() * 3) + 1,
                competitionId: "TN-USD1-" + Math.floor(1000 + Math.random() * 9000),
                timer: getRandomTimer(),
                startDate: "December 8, 2025"
            },
            {
                id: 2,
                entryFee: 5,
                maxCompetitors: 5,
                prize: "$30 Cash",
                currentCompetitors: Math.floor(Math.random() * 3) + 1,
                competitionId: "TN-USD5-" + Math.floor(1000 + Math.random() * 9000),
                timer: getRandomTimer(),
                startDate: "December 8, 2025"
            },
            {
                id: 3,
                entryFee: 10,
                maxCompetitors: 10,
                prize: "$70 Cash",
                currentCompetitors: Math.floor(Math.random() * 6) + 1,
                competitionId: "TN-USD10-" + Math.floor(1000 + Math.random() * 9000),
                timer: getRandomTimer(),
                startDate: "December 8, 2025"
            },
            {
                id: 4,
                entryFee: 50,
                maxCompetitors: 10,
                prize: "$400 Cash",
                currentCompetitors: Math.floor(Math.random() * 7) + 1,
                competitionId: "TN-USD50-" + Math.floor(1000 + Math.random() * 9000),
                timer: getRandomTimer(),
                startDate: "December 8, 2025"
            },
            {
                id: 5,
                entryFee: 100,
                maxCompetitors: 5,
                prize: "$600 Cash",
                currentCompetitors: Math.floor(Math.random() * 3) + 1,
                competitionId: "TN-USD100-" + Math.floor(1000 + Math.random() * 9000),
                timer: getRandomTimer(),
                startDate: "December 8, 2025"
            }
        ];
        
        localStorage.setItem('tradenow_competitions', JSON.stringify(competitions));
    }
    
    // Initialize completed competitions
    if (savedCompleted) {
        completedCompetitions = JSON.parse(savedCompleted);
    } else {
        completedCompetitions = [];
        localStorage.setItem('tradenow_completed', JSON.stringify(completedCompetitions));
    }
    
    // Initialize registrations
    if (savedRegistrations) {
        allRegistrations = JSON.parse(savedRegistrations);
    } else {
        allRegistrations = [];
        localStorage.setItem('tradenow_registrations', JSON.stringify(allRegistrations));
    }
}

// Get a random timer value
function getRandomTimer() {
    const hours = Math.floor(Math.random() * 10).toString().padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const seconds = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Get competitions array
function getCompetitions() {
    return competitions;
}

// Get completed competitions array
function getCompletedCompetitions() {
    return completedCompetitions;
}

// Get all registrations
function getAllRegistrations() {
    return allRegistrations;
}

// Add a completed competition
function addCompletedCompetition(competition) {
    const completedComp = {
        id: competition.competitionId,
        prize: competition.prize,
        entryFee: competition.entryFee,
        completedDate: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        })
    };
    
    completedCompetitions.push(completedComp);
    localStorage.setItem('tradenow_completed', JSON.stringify(completedCompetitions));
}

// Register a user for a competition
function registerUserForCompetition(userName, userEmail, competition) {
    // Validate inputs
    if (!userName || !userEmail) {
        return { success: false, message: 'Please enter your name and email address' };
    }
    
    if (!isValidEmail(userEmail)) {
        return { success: false, message: 'Please enter a valid email address' };
    }
    
    // Generate registration ID
    const registrationId = 'TR-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
    
    // Create registration record
    const registration = {
        id: Date.now(),
        name: userName,
        email: userEmail,
        competitionId: competition.competitionId,
        competitionFee: competition.entryFee,
        competitionPrize: competition.prize,
        registrationId: registrationId,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // Add to registrations
    allRegistrations.push(registration);
    localStorage.setItem('tradenow_registrations', JSON.stringify(allRegistrations));
    
    // Increment competitor count for the competition
    competition.currentCompetitors++;
    
    // Check if competition is now full
    if (competition.currentCompetitors >= competition.maxCompetitors) {
        // Add to completed competitions
        addCompletedCompetition(competition);
        
        // Generate new competition ID
        competition.competitionId = `TN-USD${competition.entryFee}-` + Math.floor(1000 + Math.random() * 9000);
        competition.currentCompetitors = 0;
    }
    
    // Save updated competitions
    localStorage.setItem('tradenow_competitions', JSON.stringify(competitions));
    
    return { success: true, registrationId: registrationId };
}

// Email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Start the simulation
function startSimulation() {
    // Update timers every second
    setInterval(updateTimers, 1000);
    
    // Randomly update participant counts every 5-10 minutes
    setInterval(randomlyUpdateParticipants, getRandomInterval(300000, 600000)); // 5-10 minutes
    
    // Randomly change competition IDs every 10-15 minutes
    setInterval(randomlyChangeIds, getRandomInterval(600000, 900000)); // 10-15 minutes
}

// Get random interval based on simulation speed
function getRandomInterval(min, max) {
    const speed = localStorage.getItem('tradenow_simulation_speed') || 'normal';
    
    if (speed === 'fast') {
        return Math.floor(min / 2 + Math.random() * (max / 2 - min / 2));
    } else if (speed === 'slow') {
        return Math.floor(min * 2 + Math.random() * (max * 2 - min * 2));
    } else {
        return Math.floor(min + Math.random() * (max - min));
    }
}

// Update competition timers
function updateTimers() {
    let needsSave = false;
    
    competitions.forEach(comp => {
        // Simulate timer countdown
        const timerParts = comp.timer.split(':');
        let hours = parseInt(timerParts[0]);
        let minutes = parseInt(timerParts[1]);
        let seconds = parseInt(timerParts[2]);
        
        seconds--;
        
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            
            if (minutes < 0) {
                minutes = 59;
                hours--;
                
                if (hours < 0) {
                    // Reset timer (simulating a new countdown)
                    hours = Math.floor(Math.random() * 10) + 1;
                    minutes = Math.floor(Math.random() * 60);
                    seconds = Math.floor(Math.random() * 60);
                }
            }
        }
        
        // Format the timer
        comp.timer = 
            hours.toString().padStart(2, '0') + ':' + 
            minutes.toString().padStart(2, '0') + ':' + 
            seconds.toString().padStart(2, '0');
        
        needsSave = true;
    });
    
    // Save updated timers if needed
    if (needsSave) {
        localStorage.setItem('tradenow_competitions', JSON.stringify(competitions));
    }
}

// Randomly update participant counts
function randomlyUpdateParticipants() {
    let needsSave = false;
    
    competitions.forEach(comp => {
        // Only update if competition is not full
        if (comp.currentCompetitors < comp.maxCompetitors) {
            // 30% chance to increment by 1
            if (Math.random() < 0.3) {
                comp.currentCompetitors++;
                needsSave = true;
                
                // Check if competition is now full
                if (comp.currentCompetitors >= comp.maxCompetitors) {
                    // Add to completed competitions
                    addCompletedCompetition(comp);
                    
                    // Generate new competition ID
                    comp.competitionId = `TN-USD${comp.entryFee}-` + Math.floor(1000 + Math.random() * 9000);
                    comp.currentCompetitors = 0;
                }
            }
        }
    });
    
    // Save updated competitions if needed
    if (needsSave) {
        localStorage.setItem('tradenow_competitions', JSON.stringify(competitions));
    }
}

// Randomly change competition IDs
function randomlyChangeIds() {
    let needsSave = false;
    
    competitions.forEach(comp => {
        // 20% chance to change ID
        if (Math.random() < 0.2) {
            comp.competitionId = `TN-USD${comp.entryFee}-` + Math.floor(1000 + Math.random() * 9000);
            needsSave = true;
        }
    });
    
    // Save updated competitions if needed
    if (needsSave) {
        localStorage.setItem('tradenow_competitions', JSON.stringify(competitions));
    }
}
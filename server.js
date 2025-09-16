
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;


import express from 'express';



// Basic Express app using ES Module syntax
const app = express();

app.get('/', (req, res) => {
    res.send('API Challenge');
});

app.get('/api-challenge', (req, res) => {
        
    const { team, a, b } = req.query;
    const teamNum = parseInt(team, 10);
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);

    // Validation
    if (
        !Number.isInteger(teamNum) || teamNum < 1 || teamNum > 10 ||
        !Number.isInteger(numA) || !Number.isInteger(numB)
    ) {
        return res.status(400).json({
            error: 'Invalid input. Usage: /api-challenge?team=1-10&a=integer&b=integer'
        });
    }

    // Load teams from .env
    let teams;
    try {
        if (!process.env.TEAMS_JSON) throw new Error('TEAMS_JSON not set in .env');
        teams = JSON.parse(process.env.TEAMS_JSON);
    } catch (err) {
        return res.status(500).json({ error: `Could not load team data from .env: ${err.message}` });
    }

    const teamEntry = teams.find(t => t.team === teamNum);
    if (!teamEntry) {
        return res.status(404).json({ error: 'Team not found' });
    }

    if (teamEntry.a === numA && teamEntry.b === numB) {
        return res.json({
            team: teamNum,
            a: numA,
            b: numB,
            message: 'Correct combination!'
        });
    } else {
        // Hints set, add sign hint only if guessed sign is wrong
        const aSign = teamEntry.a > 0 ? 'positive' : (teamEntry.a < 0 ? 'negative' : 'zero');
        const bSign = teamEntry.b > 0 ? 'positive' : (teamEntry.b < 0 ? 'negative' : 'zero');
        const guessedASign = numA > 0 ? 'positive' : (numA < 0 ? 'negative' : 'zero');
        const guessedBSign = numB > 0 ? 'positive' : (numB < 0 ? 'negative' : 'zero');
        const signHint = `The correct a is ${aSign}. The correct b is ${bSign}.`;
        const sumHint = `The sum of the integers is ${teamEntry.a + teamEntry.b}.`;

        let hints = [];
        if ((numA + numB) !== (teamEntry.a + teamEntry.b)) {
            hints.push(sumHint);
        }
        // Add sign hint if sign is wrong
        if (aSign !== guessedASign || bSign !== guessedBSign) {
            hints.push(signHint);
        }
        // Add digit count hint if digit count is wrong
        const digitCount = n => Math.abs(n).toString().length;
        if (digitCount(numA) !== digitCount(teamEntry.a) || digitCount(numB) !== digitCount(teamEntry.b)) {
            hints.push('3 digit count for both integers');
        }
        // Add 'not equal' hint if a and b are equal
        if (numA === numB) {
            hints.push('The numbers are not equal');
        }
        // Add parity hints for a and b
        const parity = n => (n % 2 === 0 ? 'even' : 'odd');
        if (parity(numA) !== parity(teamEntry.a)) {
            hints.push(`Integer 'a' is ${parity(teamEntry.a)}`);
        }
        if (parity(numB) !== parity(teamEntry.b)) {
            hints.push(`Integer 'b' is ${parity(teamEntry.b)}`);
        }
        // Add most significant digit hint for a and b if needed
        const msd = n => Math.abs(n).toString()[0];
        if (msd(numA) !== msd(teamEntry.a)) {
            hints.push(`The most significant digit in integer 'a' is ${msd(teamEntry.a)}`);
        }
        if (msd(numB) !== msd(teamEntry.b)) {
            hints.push(`The most significant digit in integer 'b' is ${msd(teamEntry.b)}`);
        }
        // Add digit sum hint for a and b if needed
        const digitSum = n => Math.abs(n).toString().split('').reduce((sum, d) => sum + Number(d), 0);
        if (digitSum(numA) !== digitSum(teamEntry.a)) {
            hints.push(`The sum of the digits in integer 'a' is ${digitSum(teamEntry.a)}`);
        }
        if (digitSum(numB) !== digitSum(teamEntry.b)) {
            hints.push(`The sum of the digits in integer 'b' is ${digitSum(teamEntry.b)}`);
        }
        // If no hints, add fallback difference hint
        if (hints.length === 0) {
            const diff = (teamEntry.a - teamEntry.b) ;
            hints.push(`The difference between Integer 'a' and 'b' is ${diff}`);
        }
        const hint = hints[Math.floor(Math.random() * hints.length)];
        return res.json({
            team: teamNum,
            a: numA,
            b: numB,
            hint
        });
    }
});


///--------------------------------------------------------------------------------
// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(err); // minimal logging
	res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

export default app;

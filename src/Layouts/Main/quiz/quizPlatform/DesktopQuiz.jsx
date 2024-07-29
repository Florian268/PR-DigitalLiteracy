import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AnswerQuiz from '../answerQuiz/answerQuiz';
import Result from '../results';
import questions from '../quizData/questions';
import desktopIcon from '../../../../assets/quizImages/desktop.png';
import { retrieveAllQuestionsForPlatform } from '../../AddQuizQuestion/addQuizFirestore';

export default function DesktopQuiz() {
	const [result, setResult] = useState(null);
	const [desktopQuestions, setDesktopQuestions] = useState([]);

	useEffect(() => {
		async function fetchData() {
			try {
				const fetchedQuestions = await retrieveAllQuestionsForPlatform('desktop');
				setDesktopQuestions(fetchedQuestions.desktop);
			} catch (error) {
				console.error('Error fetching questions:', error);
			}
		}
		fetchData();
	}, []);

	console.log('desktopQuestions:', desktopQuestions);
	console.log('questions.desktop:', questions.desktop);

	return (
		<div className="max-w-lg mx-auto bg-white p-8 shadow-md rounded mt-8">
			<Box display="flex" alignItems="center" mb={2}>
				<Typography variant="h3" gutterBottom>
					Desktop Quiz
				</Typography>
				<img src={desktopIcon} alt="Quiz Logo" style={{ marginRight: 16, height: '10em' }} />
			</Box>

			{result && <Result result={result} setResult={setResult} />}
			{!result && <AnswerQuiz setResult={setResult} questions={questions.desktop} />}
		</div>
	);
}

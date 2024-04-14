import React, { useState, useEffect, useRef } from 'react';//temp added useRef remove if removed
import { addVideoData } from '../../../../firebase/firebaseReadWrite';
import { Colors } from '../../../../constants/Colors';
import { inputStyle, multiLineInputStyle } from '../../ResumeBuilder/styles.js';
import {
	Box,
	Grid,
	FormControl,
	FormControlLabel,
	Checkbox,
	InputLabel,
	Select,
	MenuItem,
	TextField,
	Button,
	Divider,
} from '@mui/material';
import YouTube from 'react-youtube';
import { TagsInput } from 'react-tag-input-component';
import './styles.css';
import Swal from 'sweetalert2';
import { filter } from 'lodash';
import { string } from 'prop-types';

function YouTubeVideo() {
	const [url, setUrl] = useState('');
	const [tags, setTags] = useState([]);
	const [operating_system, setOs] = useState('');
	const [category, setCategory] = useState('');
	const [videoId, setVideoId] = useState('');
	const [opts, setOpts] = useState({});

	const [count, setCount] = useState(0); // as far as i can tell this variable does like actually nothing?

	// adding for checkbox
	const [isChecked, setIsChecked] = useState(false);
	const handleCheckboxChange = () => {
		setIsChecked(!isChecked);
	};

	const [isChapter, setIsChapter] = useState(false);

	const [duration, setDuration] = useState(0);

	const handleUrlChange = async (e) => {
		const newurl = e.target.value;
		setUrl(newurl);
		setVideoId(getVideoId(newurl));

		// here check if can have default checkbox (later might be good idea to consolidate this so we dont have to make fetch calls twice)
		// first is check if chapters
		try {
			const response = await fetch(
				`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${getVideoId(newurl)}&key=${process.env.REACT_APP_YOUTUBE_API_KEY
				}`,
			);
			const data = await response.json();
			const video = data.items[0];

			const desc = video.snippet.description;
			const lines = desc.split('\n');
			const filteredLines = lines.filter((line) => /^\s*\d+:\d+/.test(line));

			// if there are chapter then make isChapter true which will unhide the checkbox
			if (filteredLines.length > 0) {
				//alert("HAS CHAPTERS");
				setIsChapter(true);
			} else {
				//alert("Thinks has no chapters?");
				setIsChapter(false);
			}

			//make another call for the duration
			const response2 = await fetch(
				`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${getVideoId(newurl)}&key=${process.env.REACT_APP_YOUTUBE_API_KEY
				}`,
			);
			const data2 = await response2.json();
			const duration2 = data2.items[0].contentDetails.duration;
			const match = duration2.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
			const min = (parseInt(match[2]) || 0);
			const sec = (parseInt(match[3]) || 0);
			let temp = min*60 + sec;
			console.log(temp);
			setDuration(temp);
			//console.log("Duration: " + duration + "\nMin: " + min + "\nSec: " + sec);


		} catch (e) {
			console.log(e);
		}
	};

	const getVideoId = (url) => {
		const videoIdRegex =
			/(?:(?:https?:\/\/)?(?:www\.)?)?youtu(?:\.be\/|be.com\/(?:watch\?(?:.*&)?v=|(?:embed|v)\/))([\w'-]+)/i;
		const match = url.match(videoIdRegex);
		if (match && match[1]) {
			return match[1];
		}
		setVideoId('');
		setUrl('');
		Swal.fire({
			width: '30rem',
			height: '20rem',
			icon: 'error',
			title: 'Oops...',
			text: '"Please enter a valid YouTube video URL."',
		});
	};

	useEffect(() => {
		setOpts({
			height: '390',
			width: '640',
			playerVars: {
				autoplay: 0,
			},
		});
	}, []);

	const [messages, setMessage] = useState([
		{
			messages: '',
		},
	]);
	const [stopTimes, setStopTimes] = useState([
		{
			stopTimes: '',
		},
	]);

	{
		/* changing for if box is checked */
	}
	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Form validation check
		const isValid = validateInputFields();

		if(!isValid) {
			//const tagsTextBox = document
			return;
		}

		// Check if any confirmation message is empty or only contains whitespace
		/*
		const hasEmptyMessage = messages.some((msg) => isEmptyOrSpaces(msg.messages));
		if (hasEmptyMessage) {
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'Please ensure all confirmation messages are filled out.',
			});
			return // Stop the form submission
		}

		const hasInvalidTimestamp = stopTimes.some((time) => !isValidTimestamp(time.stopTimes));
		if (hasInvalidTimestamp) {
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'Please ensure all stop times are in a valid MM:SS format.',
			});
			return; // Stop the form submission
		}*/

		if (isChecked) {
			// alert("CHECKED");
			e.preventDefault();
			setVideoId('');

			const urlRegex = /^(https?:\/\/)/i;

			try {
				const response = await fetch(
					`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${getVideoId(url)}&key=${process.env.REACT_APP_YOUTUBE_API_KEY
					}`,
				);
				const data = await response.json();
				const video = data.items[0];

				const desc = video.snippet.description;
				// filter the description for the timestamps
				const lines = desc.split('\n');
				const filteredLines = lines.filter((line) => /^\s*\d+:\d+/.test(line));
				const updatedStopTimes = filteredLines.map((line) => convertToSeconds(line.split(' ')[0]));
				updatedStopTimes.shift();
				const updatedMessages = filteredLines.map(() => 'Are you following along so far?');

				setStopTimes(updatedStopTimes);
				setMessage(updatedMessages);

				try {
					await addVideoData('youtube-videos', {
						url: url,
						tags: tags,
						operating_system: operating_system,
						category: category,
						stopTimes: updatedStopTimes,
						messages: updatedMessages,
					});

					setUrl('');
					setTags([]);
					setOs('');
					setCategory('');
					setStopTimes([{ stopTimes: '' }]);
					setMessage([{ message: '' }]);
					// set checked to false
					setIsChecked(false);
					setIsChapter(false);
					console.log("isChecked: " + isChecked + "\nisChapter: " + isChapter);

					Swal.fire({
						width: '30rem',
						//height: '10rem',
						text: 'Video added successfully!',
						icon: 'success',
					});
				} catch (e) {
					console.log('Error adding video:', e);
				}
			} catch (e) {
				alert(e);
			}
		} else {
			const isValid2 = validateInputFields2();

			if(!isValid2) {
				//const tagsTextBox = document
				return;
			}

			e.preventDefault();
			setVideoId('');

			// eslint-disable-next-line
			const urlRegex = /^(https?:\/\/)/i;

			try {
				await addVideoData('youtube-videos', {
					url: url,
					tags: tags,
					operating_system: operating_system,
					category: category,
					stopTimes: stopTimes,
					messages: messages,
				});

				setUrl('');
				setTags([]);
				setOs('');
				setCategory('');
				setStopTimes([{ stopTimes: '' }]);
				setMessage([{ message: '' }]);

				setIsChecked(false);
				setIsChapter(false);

				const textField = document.getElementById(`stopTimeTextField_0`);
				if (textField) {
					textField.value = '';
				}
				const textField2 = document.getElementById(`confirmationTextField_0`);
				if (textField2) {
					textField2.value = '';
				}

				Swal.fire({
					width: '30rem',
					//height: '10rem',
					text: 'Video added successfully!',
					icon: 'success',
				});
			} catch (e) {
				console.log('Error adding video:', e);
			}
		}

	};

	// Validate the necessary input fields. 
	const validateInputFields = () => {
		//check youtube url field
		if (url === '') {
			Swal.fire({
				width: '30rem',
				title: 'Oops...',
				text: 'Please enter a Youtube video URL.',
				icon: 'error',
			});
			//alert('Please enter a Youtube video URL.');
			return false;
		}
		
		//check tags field
		if (tags.length === 0) {
			Swal.fire({
				width: '30rem',
				title: 'Oops...',
				text: 'Please enter at least one tag.',
				icon: 'error',
			});
			//alert('Please enter at least one tag.');
			return false;
		}

		//check operating system
		if (operating_system === '') {
			Swal.fire({
				width: '30rem',
				title: 'Oops...',
				text: 'Please select an Operating System.',
				icon: 'error',
			});
			//alert('Please select an operating system.');
			return false;
		}

		//check category
		if(category === '') {
			Swal.fire({
				width: '30rem',
				title: 'Oops...',
				text: 'Please select a video category.',
				icon: 'error',
			});
			//alert('Please select a video category.');
			return false;
		}



	
		return true;
	}

	const validateInputFields2 = () => {
		// Checks if a string is empty or contains only whitespace
		const isEmptyOrSpaces = (str) => {
			if(typeof str != "string")
				return true;
			return !str || str.trim() === '';
		};


		// Check if any confirmation message is empty or only contains whitespace
		
		const hasEmptyMessage = messages.some((msg) => isEmptyOrSpaces(msg));
		
		console.log("messages size: " + messages.length);
		console.log("first message" + messages[0]);
		console.log("has empty message?" + messages.some((msg) => isEmptyOrSpaces(msg)))
		
		if (hasEmptyMessage) {
			Swal.fire({
				icon: 'error',
				title: 'Oops...',
				text: 'Please ensure all confirmation messages are filled out.',
			});
			return false;
		}

		/*
		The code below is correct, but there are two issues about validating timestamp format:
		1. the time stamp has already been converted to the seconds, and if we move this part in the convertToSecond, it needs admin to input the right timestamp all at once
		2. We need to have the maximum time of the video!
		*/

		// Validates timestamp format
		// const isValidTimestamp = (timestamp) => {
		// 	const regex = /^[0-5]?[0-9]:[0-5][0-9]$/; //validate MM:SS or M:SSformat
		// 	return regex.test(timestamp);
		// };

		// const hasInvalidTimestamp = stopTimes.some((time) => !isValidTimestamp(time));
		// console.log("timestamp size: "+stopTimes.length);
		// console.log("first timestamp: "+stopTimes[0]);
		// console.log("has invalid message?" + stopTimes.some((time) => !isValidTimestamp(time)))
		// if (hasInvalidTimestamp) {
		// 	Swal.fire({
		// 		icon: 'error',
		// 		title: 'Oops...',
		// 		text: 'Please ensure all stop times are in a valid MM:SS format.',
		// 	});
		// 	return false; // Stop the form submission
		// }


		//console.log("Duration: " + duration + "\nMin: " + duration.minutes + "\nSec: " + duration.seconds);

		for (let i = 0; i < messages.length; i++) {
			let textField = document.getElementById(`stopTimeTextField_${(i)}`);
			//console.log("stoptime: " + textField.value)
			if (textField) {
				const regex = /^[0-5]?[0-9]:[0-5][0-9]$/; //validate MM:SS or M:SSformat
				let temp = regex.test(textField.value);

				
				console.log("text value: " + textField.value + "\ntemp: " + temp);
				//const hasInvalidTimestamp = !isValidTimestamp(textField.value);
				
				if (!temp) {
					Swal.fire({
						icon: 'error',
						title: 'Oops...',
						text: 'Please ensure all stop times are in a valid MM:SS format.',
					});
					return false; // Stop the form submission
				}
				//check that the min and seconds inputted are less than the max
				console.log("stopTimes[" + i + "]: " + stopTimes[i] + "\nduration: " + duration);
				if (stopTimes[i] > duration) {
					Swal.fire({
						icon: 'error',
						title: 'Oops...',
						text: 'Please ensure all stop times are below the video length.',
					});
					return false;
				}
			}
		}
		return true;
	}
	


	const playerRef = useRef(null);
	const handleClickTime = async (index) => {
		if (playerRef.current) {
			const currentTime = await playerRef.current.internalPlayer.getCurrentTime();
			const formattedTime = `${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`;
			const reverseIndex = (messages.length - index - 1);
			stopTimes[reverseIndex] = convertToSeconds(formattedTime);

			// Assuming you have the id stored in a variable called textFieldId
			const textField = document.getElementById(`stopTimeTextField_${(reverseIndex)}`);
			if (textField) {
				textField.value = formattedTime;
			}
		}

	};

	
	const onAddBtnClick = () => {
		const newField = {
			
			messages: '',
			stopTimes: '',
		};
		//You have to be specific of which field of newField to solve the previous commenting messages issue.
		setMessage([...messages, newField.messages]);
		setStopTimes([...stopTimes, newField.stopTimes]);
		
		// alert("Messages are: " + messages + "\nStop times are: " + stopTimes);
	};
	
	const remove = (index) => {
		console.log("start of the remove and the index passed in is: " + index + "\nThe messages array is: " + messages)
		console.log("removing segemnt at index:", index);
		const messagedata = [...messages];
		messagedata.splice(index, 1);
		
		setMessage(messagedata);
		const stopdata = [...stopTimes];
		stopdata.splice(index, 1);
		setStopTimes(stopdata);
		//so it removes the spot in the array but messageInput just updates on leangth always removing the top one rn
		setCount(count + 1);
		console.log("end of the remove and the index passed in is: " + index + "\nThe messages array is: " + messagedata)
		// testing, try get index to remove
		//const textField = document.getElementById(`experience-form-${index}`);
		//console.log("trying to print the textField: " + textField);
		//could possibly write a for loop where after cutting out the message and stop time i just put the remaining ones in their spot.
		for (let i = 0; i < messagedata.length; i++) {
			//
			let textField = document.getElementById(`stopTimeTextField_${(i)}`);
			//console.log("stoptime: " + textField.value)
			if (textField) {
				textField.value = `${Math.floor(stopdata[i] / 60)}:${String(stopdata[i] % 60).padStart(2, '0')}`;
			}
			textField = document.getElementById(`confirmationTextField_${(i)}`);
			//console.log("message: " + textField.value)
			if (textField) {
				textField.value = messagedata[i];
			}
		}

	};

	const convertToSeconds = (time) => {
		const [minutes, seconds] = time.split(':').map((num) => parseInt(num));
		return minutes * 60 + seconds;
	};

	const handleChange = (index, event) => {
		const stopTime = [...stopTimes];
		const message = [...messages];
		if (event.target.name === 'stopTimes') {
			stopTime[index] = convertToSeconds(event.target.value);
			// ("stopTime is: " + stopTime + "\nIndex is: " + index);
		} else if (event.target.name === 'messages') {
			message[index] = event.target.value;
			// alert("message is: " + message + "\nIndex is: " + index);
		}
		setStopTimes(stopTime);
		setMessage(message);
		setCount(count + 1);
	};


	const messageInput = messages.map((input, index) => (
		<Box key={messages.length - index - 1}>
		
			<Grid
				container
				spacing={2}
				sx={{
					margin: 'auto',
					width: '97%',
					paddingRight: '0.5rem',
					marginTop: '1rem',
				}}
			>
				<Grid item md={6} sm={6} xs={12} order={{ xs: 1 }}>
					<Box
						sx={{
							width: '97%',
							margin: 'auto',
							color: Colors.primaryColor,
							fontWeight: '700',
						}}
					>
						Segment #{messages.length - index}
					</Box>
				</Grid>

				<Grid item md={6} sm={6} xs={12} order={{ xs: 1 }}>
					<Box
						sx={{
							color: Colors.primaryColor,
							fontSize: { sm: '1rem', xs: '0.8rem' },
							textAlign: 'right',
							paddingRight: '1rem',
							cursor: 'pointer',
						}}
						onClick={() => {
							
							remove(messages.length - index - 1);
						}}
					>
						- Remove Segment
					</Box>
				</Grid>
			</Grid>

			<Grid
				key={messages.length - index - 1}
				id={`experience-form-${messages.length - index - 1}`}
				container
				spacing={2}
				sx={{ margin: 'auto', width: '97%', paddingRight: '0.5rem' }}
			>
				<Grid container spacing={2} sx={{ margin: 'auto', width: '97%', paddingRight: '0.5rem' }}>
					<Grid item>
						<Box
							sx={{
								marginTop: '1.2rem',
								color: Colors.primaryColor,
								fontSize: '1rem',
								fontFamily: 'Inria Sans',
								fontWeight: '700',
								marginLeft: '0.5rem',
							}}
						>
							Stop Times:
						</Box>
					</Grid>
					<Grid item md={8} sm={6} xs={12}>
						<Box
							component="form"
							sx={{
								'& > :not(style)': { width: '100%' },
							}}
							autoComplete="off"
						>
							<TextField
								value={input.stopTime}
								//borderRadius=".375rem"
								sx={inputStyle}
								variant="filled"
								placeholder="Specify pause times for video in format min:sec, e.g. 0:30"
								focused
								onChange={(e) => {
									handleChange(messages.length - index - 1, e);
								}}
								name="stopTimes"
								InputProps={{
									id: `stopTimeTextField_${(messages.length - index - 1)}`,
									disableUnderline: true,
								}}
							/>
						</Box>
					</Grid>
					<Grid item md={2} sm={3} xs={12}>
						<button 
						onClick={(e) => handleClickTime(index, e)}
						style={{
							width: '100%',
							height: '100%',
							//padding: '10px 20px',
							fontSize: '16px',
							backgroundColor: Colors.primaryColor, // Gray background color
							color: '#fff',
							//border: '1px solid #007bff',
							//borderRadius: '5px',
							cursor: 'pointer',
							fontWeight: 'bold' // Bold text
						}}
						>Get Timestamp</button>
					</Grid>
				</Grid>

				{/* Description row */}
				<Grid item xs={12}>
					<Grid item xs={12}>
						<Grid item>
							<Box
								sx={{
									marginTop: '1.2rem',
									color: Colors.primaryColor,
									fontSize: '1.1rem',
									fontFamily: 'Inria Sans',
									fontWeight: '700',
									marginLeft: '0.5rem',
									marginBottom: '0.5rem',
								}}
							>
								Confirmation Message:
							</Box>
						</Grid>
						<Box
							component="form"
							sx={{
								'& > :not(style)': { width: '100%' },
							}}
							autoComplete="off"
						>
							<TextField
								sx={multiLineInputStyle}
								variant="standard"
								multiline
								value={input.messages}
								name="messages"
								InputProps={{
									id: `confirmationTextField_${(messages.length - index - 1)}`,
									disableUnderline: true,
								}}
								onChange={(e) => {
									handleChange(messages.length - index - 1, e);
								}}
								rows={5}
							/>
						</Box>
					</Grid>
				</Grid>
			</Grid>
		</Box>
	));

	return (
		<>
			<Box>
				<Box
					sx={{

						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						marginTop: '2rem',
						'@media screen and (min-width: 1444px)': {
							position: 'fixed',
							top: '50%',
							right: '0',
							transform: 'translateY(-50%)',
							zIndex: 1000, // Ensure it's above other content
							boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
						}

					}}
				>
					{videoId && (
						<YouTube
							videoId={videoId}
							opts={opts}
							ref={playerRef}
							sx={{ margin: 'auto' }}
						/>
					)}
				</Box>
				<Box
					sx={{
						backgroundColor: Colors.backgroundColor,
						height: 'auto',
						borderRadius: '1rem',
						boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
						margin: 'auto',
						marginTop: '2rem',
						paddingBottom: '2rem',
						width: '90%',
						'@media screen and (min-width: 1444px)': {
							display: 'flex',
							flexDirection: 'column', // Change to column layout
							justifyContent: 'flex-start', // Align items to the start (left)
							alignItems: 'flex-start', // Align items to the start (left)
							marginTop: '2rem',
							marginLeft: '2rem', // Add margin to the left
							width: '53%', // Take up half of the page width
						}


					}}
				>
					<Grid container spacing={2} sx={{ margin: 'auto', width: '97%', paddingRight: '0.5rem' }}>
						<Grid item xs={1.6}>
							<Box
								sx={{
									marginTop: '1.2rem',
									color: Colors.primaryColor,
									fontSize: '1rem',
									fontFamily: 'Inria Sans',
									fontWeight: '700',
									marginLeft: '0.5rem',
								}}
							>
								Youtube Link:
							</Box>
						</Grid>
						<Grid item md={10} sm={10} xs={12}>
							<Box
								component="form"
								sx={{
									'& > :not(style)': { width: '100%', paddingBottom: '1rem' },
								}}
								autoComplete="off"
							>
								<TextField
									sx={inputStyle}
									variant="filled"
									value={url}
									placeholder="Input Youtube Video Url"
									InputProps={{
										disableUnderline: true,
									}}
									onChange={handleUrlChange}
									// onChange={(e) => setUrl(e.target.value)}
									focused
								/>
							</Box>
						</Grid>
					</Grid>
					<Grid container spacing={2} sx={{ margin: 'auto', width: '97%', paddingRight: '0.5rem' }}>
						<Grid item xs={1.6}>
							<Box
								sx={{
									marginTop: '1.2rem',
									color: Colors.primaryColor,
									fontSize: '1rem',
									fontFamily: 'Inria Sans',
									fontWeight: '700',
									marginLeft: '0.5rem',
								}}
							>
								Tags:
							</Box>
						</Grid>

						<Grid item md={10} sm={10} xs={12}>
							<Box
								component="form"
								sx={{
									'& > :not(style)': { width: 'auto', padding: '1rem' },
								}}
								autoComplete="off"
							>
								<TagsInput
									InputProps={{
										disableUnderline: true,
									}}
									type="text"
									variant="standard"
									id="search"
									value={tags}
									separators={['Enter']}
									onChange={setTags}
									placeHolder="To add tags, input the desired word and press Enter"
								/>
							</Box>
						</Grid>
					</Grid>
					<Grid container spacing={2} sx={{ margin: 'auto', width: '97%', paddingRight: '0.5rem' }}>
						<Grid item xs={1.6}>
							<Box
								sx={{
									marginTop: '2rem',
									color: Colors.primaryColor,
									fontSize: '1rem',
									fontFamily: 'Inria Sans',
									fontWeight: '700',
									marginLeft: '0.5rem',
								}}
							>
								Operating System:
							</Box>
						</Grid>
						<Grid item md={10} sm={10} xs={12}>
							<Box
								component="form"
								sx={{
									'& > :not(style)': { width: '100%' },
								}}
								autoComplete="off"
							>
								<FormControl fullWidth sx={{ marginTop: '1rem' }}>
									<InputLabel id="demo-simple-select-label">What kind of device is this for?</InputLabel>
									<Select
										labelId="demo-simple-select-label"
										id="demo-simple-select"
										label=" What kind of device is this for?"
										onChange={(e) => setOs(e.target.value)}
										value={operating_system}
									>
										<MenuItem disabled>Mobile Devices</MenuItem>
										<MenuItem value="iOS">iOS</MenuItem>
										<MenuItem value="Android">Android</MenuItem>
										<Divider />
										<MenuItem disabled>PC</MenuItem>
										<MenuItem value="Windows">Windows</MenuItem>
										<MenuItem value="Mac">Mac</MenuItem>
										<MenuItem value="Linux">Linux</MenuItem>
										<Divider />
										<MenuItem value="All">All</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</Grid>
					</Grid>
					<Grid container spacing={2} sx={{ margin: 'auto', width: '97%', paddingRight: '0.5rem' }}>
						<Grid item xs={1.6}>
							<Box
								sx={{
									marginTop: '2rem',
									color: Colors.primaryColor,
									fontSize: '1rem',
									fontFamily: 'Inria Sans',
									fontWeight: '700',
									marginLeft: '0.5rem',
								}}
							>
								Video Category:
							</Box>
						</Grid>
						<Grid item md={10} sm={10} xs={12}>
							<Box
								component="form"
								sx={{
									'& > :not(style)': { width: '100%' },
								}}
								autoComplete="off"
							>
								<FormControl fullWidth sx={{ marginTop: '1rem' }}>
									<InputLabel id="demo-simple-select-label">What category is this video for?</InputLabel>
									<Select
										labelId="demo-simple-select-label"
										id="demo-simple-select"
										label=" What category is this video for?"
										onChange={(e) => setCategory(e.target.value)}
										value={category}
									>
										<MenuItem value="daily_life">Technology Use in Daily Life</MenuItem>
										<MenuItem value="safety_privacy">Technology Safety and Privacy</MenuItem>
										<MenuItem value="class_word">Technology use for Class and Word</MenuItem>
										<MenuItem value="finance">Financial Well Being and Management</MenuItem>
									</Select>
								</FormControl>
							</Box>
						</Grid>
					</Grid>
				</Box>
			</Box>

			{/* Altering this to have a checkbox that hides it -ben*/}
			<Box
				sx={{
					backgroundColor: Colors.backgroundColor,
					height: 'auto',
					borderRadius: '1rem',
					boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
					margin: 'auto',
					paddingBottom: '2rem',
					width: '90%',
					marginTop: '2rem',
					'@media screen and (min-width: 1444px)': {
						display: 'flex',
						flexDirection: 'column', // Change to column layout
						justifyContent: 'flex-start', // Align items to the start (left)
						alignItems: 'flex-start', // Align items to the start (left)
						marginTop: '2rem',
						marginLeft: '2rem', // Add margin to the left
						width: '53%', // Take up half of the page width
					}
				}}
			>
				<Grid container spacing={2} sx={{ margin: 'auto', width: '97%' }}>
					{isChapter && (
						<Grid item xs={6}>
							<FormControlLabel
								control={<Checkbox checked={isChecked} onChange={handleCheckboxChange} />}
								label="Use default segmentation from the video"
							/>
						</Grid>
					)}
					{!isChecked && (
						<>
							<Grid item xs={isChapter ? 6 : 12} style={{ textAlign: 'end' }}>
								<Box
									sx={{
										color: Colors.primaryColor,
										fontSize: { sm: '1rem', xs: '0.8rem' },
										textAlign: 'end',
										marginTop: '1rem',
										paddingRight: '1rem',
										cursor: 'pointer',
									}}
									onClick={onAddBtnClick}
								>
									+ Add a Segment
								</Box>
							</Grid>
							<Grid item xs={12}>
								{messageInput}
							</Grid>
						</>
					)}
				</Grid>
			</Box>

			<Box
				sx={{
					height: 'auto',
					margin: 'auto',
					paddingBottom: '2rem',
					width: '90%',
				}}
			>
				<Button variant="contained" onClick={handleSubmit} sx={{ mt: 3, mb: 2, bgcolor: Colors.primaryColor }}>
					Submit
				</Button>
			</Box>
		</>
	);
}

export default YouTubeVideo;

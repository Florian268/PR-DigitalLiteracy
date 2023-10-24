import React, { useEffect, useState } from 'react';
import { Box, Grid, Icon, TextField, Typography, Fab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { debounce } from 'lodash';
import { updateData } from '../../../../firebase/firebaseReadWrite';
import { db } from '../../../../firebase/firebase';
import { useAuth } from '../../../../firebase/AuthContext';
import { Colors } from '../../../../constants/Colors';
import { formBackground, inputStyleAutoComplete } from '../styles';

function KeySkillBlock({ dataFromKeySkillsBlock, dataFromFirebase }) {
	const [technicalSkillValue, setTechnicalSkillValue] = useState('');
	const [technicalSkills, setTechnicalSkills] = useState([]);

	const [personalSkillValue, setPersonalSkillValue] = useState('');
	const [personalSkills, setPersonalSkills] = useState([]);

	const [otherSkillValue, setOtherSkillValue] = useState('');
	const [otherSkills, setOtherSkills] = useState([]);
	const [valueChanged, setValueChanged] = useState(0);
	const [openHelp, setOpenHelp] = useState(false);

	const { currentUser } = useAuth();
	let docRef;
	if (currentUser !== null) {
		// console.log("uid ", currentUser.uid);
		docRef = doc(db, 'users', currentUser.uid);
	}

	useEffect(() => {
		if (currentUser !== null) {
			if (valueChanged < 1) {
				if (dataFromFirebase !== undefined && dataFromFirebase.resumeData !== undefined) {
					const skillFirebase = dataFromFirebase.resumeData.skills_info;

					if (skillFirebase !== undefined) {
						setOtherSkills(skillFirebase.otherSkills);
						setPersonalSkills(skillFirebase.personalSkills);
						setTechnicalSkills(skillFirebase.technicalSkills);
					}
				}
			}

			const unsubscribe = onSnapshot(docRef, (doc) => {
				const data = doc.data();
				if (data !== undefined && data.resumeData !== undefined) {
					const skillFirebase = data.resumeData.skills_info;

					if (skillFirebase !== undefined) {
						setOtherSkills(skillFirebase.otherSkills || []);
						setPersonalSkills(skillFirebase.personalSkills || []);
						setTechnicalSkills(skillFirebase.technicalSkills || []);
					}
				}
			});

			return unsubscribe; // Clean up function to remove the listener
		}

		// eslint-disable-next-line
	}, [docRef]);

	useEffect(() => {
		// Use this effect hook to listen for currentUser changes, and set up a snapshot listener on their document
		if (currentUser !== null) {
			docRef = doc(db, 'users', currentUser.uid);

			// Set the initial state values from Firebase, only if it's the first render
			onSnapshot(docRef, (doc) => {
				const data = doc.data();
				if (data !== undefined) {
					const skillFirebase = data?.resumeData?.skills_info;

					if (skillFirebase !== undefined) {
						setOtherSkills(skillFirebase.otherSkills || []);
						setPersonalSkills(skillFirebase.personalSkills || []);
						setTechnicalSkills(skillFirebase.technicalSkills || []);
					}
				}
			});
		}
	}, [currentUser]);
	const onAddTechnicalSkillBtnClick = async (e) => {
		if (technicalSkillValue !== '') {
			let updatedTechnicalSkills = null;
			if (technicalSkills != null && technicalSkills.length > 0) {
				updatedTechnicalSkills = [...technicalSkills, technicalSkillValue];
			} else {
				updatedTechnicalSkills = [technicalSkillValue];
			}
			setTechnicalSkills(updatedTechnicalSkills);
			setTechnicalSkillValue('');
			setValueChanged(valueChanged + 1);

			// Write to Firestore here
			if (currentUser !== null) {
				await updateDoc(docRef, {
					'resumeData.skills_info.technicalSkills': updatedTechnicalSkills,
				});
			}
		}
	};

	const onRemoveTechnicalSkillBtnClick = async (index) => {
		let updatedTechnicalSkills = null;
		if (technicalSkills.length === 1) {
			setTechnicalSkills(null);
		} else {
			updatedTechnicalSkills = technicalSkills.filter((_, id) => id !== index);
			setTechnicalSkills(updatedTechnicalSkills);
			setValueChanged(valueChanged + 1);
		}

		// Write to Firestore here
		if (currentUser !== null) {
			await updateDoc(docRef, {
				'resumeData.skills_info.technicalSkills': updatedTechnicalSkills,
			});
		}
	};

	const onAddPersonalSkillBtnClick = async (e) => {
		if (personalSkillValue !== '') {
			let updatedPersonalSkills = null;
			if (personalSkills != null && personalSkills.length > 0) {
				updatedPersonalSkills = [...personalSkills, personalSkillValue];
			} else {
				updatedPersonalSkills = [personalSkillValue];
			}
			setPersonalSkills(updatedPersonalSkills);
			setPersonalSkillValue('');
			setValueChanged(valueChanged + 1);
			// Saving to Firebase
			// Write to Firestore here
			if (currentUser !== null) {
				await updateDoc(docRef, {
					'resumeData.skills_info.personalSkills': updatedPersonalSkills,
				});
			}
		}
	};

	const onRemovePersonalSkillBtnClick = async (index) => {
		let updatedPersonalSkills = null;
		if (personalSkills.length === 1) {
			setPersonalSkills(null);
		} else {
			updatedPersonalSkills = personalSkills.filter((_, id) => id !== index);
			setPersonalSkills(updatedPersonalSkills);
			setValueChanged(valueChanged + 1);
		}

		// Write to Firestore here
		if (currentUser !== null) {
			await updateDoc(docRef, {
				'resumeData.skills_info.personalSkills': updatedPersonalSkills,
			});
		}
	};

	const onAddOtherSkillBtnClick = async (e) => {
		if (otherSkillValue !== '') {
			let updatedOtherSkills;
			if (otherSkills != null && otherSkills.length > 0) {
				updatedOtherSkills = [...otherSkills, otherSkillValue];
			} else {
				updatedOtherSkills = [otherSkillValue];
			}
			setOtherSkills(updatedOtherSkills);
			setOtherSkillValue('');
			setValueChanged(valueChanged + 1);
			// Saving to Firebase
			// Write to Firestore here
			if (currentUser !== null) {
				await updateDoc(docRef, {
					'resumeData.skills_info.otherSkills': updatedOtherSkills,
				});
			}
		}
	};

	const onRemoveOtherSkillBtnClick = async (index) => {
		let updatedOtherSkills = null;
		if (otherSkills.length === 1) {
			setOtherSkills(null);
		} else {
			updatedOtherSkills = otherSkills.filter((_, id) => id !== index);
			setOtherSkills(updatedOtherSkills);
			setValueChanged(valueChanged + 1);
		}

		// Write to Firestore here
		if (currentUser !== null) {
			await updateDoc(docRef, {
				'resumeData.skills_info.otherSkills': updatedOtherSkills,
			});
		}
	};

	const showHelpModal = () => {
		const handleClose = () => {
			setOpenHelp(false);
		};

		const sendHelpToDatabase = () => {
			setOpenHelp(false);
			// send Help to Firebase

			updateData(docRef, {
				KeySkillsHelp: true,
			});
		};

		return (
			<Dialog
				open={openHelp}
				onClose={handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description"
			>
				<DialogTitle id="alert-dialog-title">Call for Help?</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						We are sorry you are having trouble in filling the form. Would you like Project Rebound Staff to assist you?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>No, Thank You</Button>
					<Button onClick={sendHelpToDatabase} autoFocus>
						Yes, Please
					</Button>
				</DialogActions>
			</Dialog>
		);
	};

	return (
		<Box
			sx={{
				backgroundColor: Colors.backgroundColor,
				height: 'auto',
				borderRadius: '1rem',
				boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
				margin: 'auto',
				paddingBottom: '2rem',
				width: '100%',
				marginBottom: '2rem',
			}}
		>
			<Grid container spacing={2} sx={{ margin: 'auto', width: '97%' }}>
				{/* Heading row */}
				<Grid item xs={8}>
					<Box
						sx={{
							fontWeight: '700',
							fontSize: { md: '1.3rem', sm: '1rem', xs: '1.2rem' },
							color: Colors.primaryColor,
						}}
					>
						Key Skills
					</Box>
					<Box
						sx={{
							fontSize: {
								md: '1rem',
								sm: '0.8rem',
								xs: '0.8rem',
								fontFamily: 'Inria Sans',
								color: Colors.primaryColor,
							},
						}}
					>
						Refer to the skills listed by you above and add what you would like to be present in your resume. You may
						also add some skills from the right and add it to your list!
					</Box>
				</Grid>

				{/* Help Button */}
				<Grid item md={4} xs={4}>
					<Box
						sx={{
							float: 'right',
							display: 'flex',
							bgcolor: { md: Colors.white, sm: Colors.white, xs: 'None' },
							paddingRight: { md: '1.2rem', sm: '1rem', xs: '0.5rem' },
							paddingLeft: { md: '1.2rem', sm: '1rem', xs: '0.5rem' },
							marginRight: '0.5rem',
							cursor: 'pointer',
						}}
						onClick={() => {
							setOpenHelp(true);
						}}
					>
						<Box
							sx={{
								display: { md: 'flex', sm: 'flex', xs: 'None' },
								borderRadius: '0.1rem',
								fontSize: { md: '1rem', sm: '0.7rem', xs: '0.7rem' },
								color: Colors.primaryColor,
								fontWeight: '700',
							}}
						>
							<p>Need Help</p>
						</Box>
						<Box
							sx={{
								color: Colors.primaryColor,
								marginTop: { md: '0.85rem', sm: '0.5rem', xs: '0 ' },
								marginLeft: '0.5rem',
							}}
						>
							<Icon>help_circle</Icon>
						</Box>
					</Box>
				</Grid>
			</Grid>

			<Grid container spacing={2}>
				{/* Technical Skills Block */}
				<Grid item sm={4}>
					<Grid
						container
						spacing={2}
						sx={{
							margin: 'auto',
							width: '97%',
						}}
					>
						<Grid item sm={12}>
							{/* Adding component here */}

							{/* <TextField
                sx={inputStyleAutoComplete}
                label="Enter Technical Skills Here"
                variant="filled"
                value={technicalSkillValue}
                onChange={(e) => setTechnicalSkillValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    onAddTechnicalSkillBtnClick(e);
                  }
                }}
                focused
              /> */}

							<Box sx={{ display: 'flex' }}>
								<TextField
									sx={inputStyleAutoComplete}
									label="Enter Technical Skills Here"
									variant="filled"
									placeholder="Press Enter or Return to Add Skill"
									value={technicalSkillValue}
									onChange={(e) => {
										setTechnicalSkillValue(e.target.value);
									}}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											onAddTechnicalSkillBtnClick(e);
										}
									}}
									focused
								/>

								<Fab
									size="small"
									aria-label="add"
									sx={{
										backgroundColor: Colors.primaryColor,
										color: Colors.white,
										marginLeft: '1rem',
										marginBottom: '0.3rem',
										marginTop: '0.5rem',
										'&:hover': {
											backgroundColor: Colors.primaryColor,
										},
									}}
									onClick={(e) => onAddTechnicalSkillBtnClick(e)}
								>
									<AddIcon />
								</Fab>
							</Box>
						</Grid>

						<Grid
							item
							sm={12}
							sx={{
								margin: 'auto',
								width: '100%',
								height: '20rem',
								overflowY: 'auto',
							}}
						>
							{/* viewing skills component here */}
							{technicalSkills && technicalSkills.length > 0 ? (
								technicalSkills.map((e, index) => (
									<Box sx={{ display: 'flex', marginLeft: '0.4rem' }} key={index}>
										<Grid container spacing={2}>
											<Grid item xs={10}>
												<Typography
													sx={{
														fontFamily: 'Inria Sans',
														fontSize: '1.3rem',
														fontColor: Colors.primaryColor,
													}}
												>
													{e}
												</Typography>
											</Grid>
											<Grid item xs={2}>
												<Box
													sx={{ padding: '0.5rem' }}
													onClick={() => {
														onRemoveTechnicalSkillBtnClick(index);
													}}
												>
													<CloseIcon
														sx={{
															color: Colors.primaryColor,
															height: '1.4rem',
														}}
													/>
												</Box>
											</Grid>
										</Grid>
									</Box>
								))
							) : (
								<Box />
							)}
						</Grid>
					</Grid>
				</Grid>

				{/* Personal Arrtributes Skills Block */}
				<Grid item sm={4}>
					<Grid
						container
						spacing={2}
						sx={{
							margin: 'auto',
							width: '97%',
						}}
					>
						<Grid item sm={12}>
							{/* Adding component here */}

							{/* <TextField
                sx={inputStyleAutoComplete}
                label="Enter Personal Attributes Here"
                variant="filled"
                value={personalSkillValue}
                onChange={(e) => setPersonalSkillValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    onAddPersonalSkillBtnClick(e);
                  }
                }}
                focused
              /> */}

							<Box sx={{ display: 'flex' }}>
								<TextField
									sx={inputStyleAutoComplete}
									label="Enter Personal Attributes Here"
									variant="filled"
									placeholder="Press Enter or Return to Add Skill"
									value={personalSkillValue}
									onChange={(e) => setPersonalSkillValue(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											onAddPersonalSkillBtnClick(e);
										}
									}}
									focused
								/>

								<Fab
									size="small"
									aria-label="add"
									sx={{
										backgroundColor: Colors.primaryColor,
										color: Colors.white,
										marginLeft: '1rem',
										marginBottom: '0.3rem',
										marginTop: '0.5rem',
										'&:hover': {
											backgroundColor: Colors.primaryColor,
										},
									}}
									onClick={(e) => onAddPersonalSkillBtnClick(e)}
								>
									<AddIcon />
								</Fab>
							</Box>
						</Grid>

						<Grid
							item
							sm={12}
							sx={{
								margin: 'auto',
								width: '100%',
								height: '20rem',
								overflowY: 'auto',
							}}
						>
							{/* viewing skills component here */}
							{personalSkills && personalSkills.length > 0 ? (
								personalSkills.map((e, index) => (
									<Box sx={{ display: 'flex', marginLeft: '0.4rem' }} key={index}>
										<Grid container spacing={2}>
											<Grid item xs={10}>
												<Typography
													sx={{
														fontFamily: 'Inria Sans',
														fontSize: '1.3rem',
														fontColor: Colors.primaryColor,
													}}
												>
													{e}
												</Typography>
											</Grid>
											<Grid item xs={2}>
												<Box
													sx={{ padding: '0.5rem' }}
													onClick={() => {
														onRemovePersonalSkillBtnClick(index);
													}}
												>
													<CloseIcon
														sx={{
															color: Colors.primaryColor,
															height: '1.4rem',
														}}
													/>
												</Box>
											</Grid>
										</Grid>
									</Box>
								))
							) : (
								<Box>
									<Typography
										sx={{
											fontFamily: 'Inria Sans',
											fontSize: '1.3rem',
											fontColor: Colors.primaryColor,
										}}
									>
										No Personal Attributes Added
									</Typography>
								</Box>
							)}
						</Grid>
					</Grid>
				</Grid>

				{/* Other Skills Block */}
				<Grid item sm={4}>
					<Grid
						container
						spacing={2}
						sx={{
							margin: 'auto',
							width: '97%',
						}}
					>
						<Grid item sm={12}>
							{/* Adding component here */}

							{/* <TextField
                sx={inputStyleAutoComplete}
                label="Enter Other Skills Here"
                variant="filled"
                value={otherSkillValue}
                onChange={(e) => setOtherSkillValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    onAddOtherSkillBtnClick(e);
                  }
                }}
                focused
              /> */}

							<Box sx={{ display: 'flex' }}>
								<TextField
									sx={inputStyleAutoComplete}
									label="Enter Other Skills Here"
									variant="filled"
									placeholder="Press Enter or Return Key to Add Skill"
									value={otherSkillValue}
									onChange={(e) => setOtherSkillValue(e.target.value)}
									onKeyPress={(e) => {
										if (e.key === 'Enter') {
											onAddOtherSkillBtnClick(e);
										}
									}}
									focused
								/>

								<Fab
									size="small"
									aria-label="add"
									sx={{
										backgroundColor: Colors.primaryColor,
										color: Colors.white,
										marginLeft: '1rem',
										marginBottom: '0.3rem',
										marginTop: '0.5rem',
										'&:hover': {
											backgroundColor: Colors.primaryColor,
										},
									}}
									onClick={(e) => onAddOtherSkillBtnClick(e)}
								>
									<AddIcon />
								</Fab>
							</Box>
						</Grid>

						<Grid
							item
							sm={12}
							sx={{
								margin: 'auto',
								width: '100%',
								height: '20rem',
								overflowY: 'auto',
							}}
						>
							{/* viewing skills component here */}
							{otherSkills && otherSkills.length > 0 ? (
								otherSkills.map((e, index) => (
									<Box sx={{ display: 'flex', marginLeft: '0.4rem' }} key={index}>
										<Grid container spacing={2}>
											<Grid item xs={10}>
												<Typography
													sx={{
														fontFamily: 'Inria Sans',
														fontSize: '1.3rem',
														fontColor: Colors.primaryColor,
													}}
												>
													{e}
												</Typography>
											</Grid>
											<Grid item xs={2}>
												<Box
													sx={{ padding: '0.5rem' }}
													onClick={() => {
														onRemoveOtherSkillBtnClick(index);
													}}
												>
													<CloseIcon
														sx={{
															color: Colors.primaryColor,
															height: '1.4rem',
														}}
													/>
												</Box>
											</Grid>
										</Grid>
									</Box>
								))
							) : (
								<Box />
							)}
						</Grid>
					</Grid>
				</Grid>
			</Grid>
			{openHelp ? showHelpModal() : <div />}
		</Box>
	);
}

function KeySkills(props) {
	// getting data from key skills block to key skills component
	const [keySkillsBlockData, setKeySkillsBlockData] = useState();

	const dataFromKeySkillsBlock = (keySkillsBlockData) => {
		setKeySkillsBlockData(keySkillsBlockData);
	};

	useEffect(() => {
		props.dataFromSkillsInfo(keySkillsBlockData);
	}, [keySkillsBlockData, props]);

	return (
		<div>
			<Box sx={formBackground}>
				<Grid container spacing={2}>
					<Grid item sm={12} xs={12}>
						<Box>
							<KeySkillBlock
								dataFromKeySkillsBlock={dataFromKeySkillsBlock}
								dataFromFirebase={props.dataFromFirebase}
							/>
						</Box>
					</Grid>
				</Grid>
			</Box>
		</div>
	);
}

export default KeySkills;

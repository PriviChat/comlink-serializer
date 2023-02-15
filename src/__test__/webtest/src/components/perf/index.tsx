import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import { Outlet, useNavigate } from 'react-router-dom';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ReactJson from 'react-json-view';
import { perfTests } from './test-config';

const PerfSuit = () => {
	const navigate = useNavigate();

	return (
		<>
			<TableContainer component={Paper} style={{ height: 400, marginTop: 10 }}>
				<Table sx={{ minWidth: 800 }} aria-label="Performance Test Suite">
					<TableHead>
						<TableRow>
							<TableCell style={{ width: 100 }}>Feature</TableCell>
							<TableCell style={{ width: 200 }}>Description</TableCell>
							<TableCell align="left" style={{ width: 450 }}>
								Configuration
							</TableCell>
							<TableCell style={{ width: 50 }} align="center">
								Start
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{perfTests.map((test) => (
							<TableRow key={test.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell component="th" scope="row">
									{test.name}
								</TableCell>
								<TableCell>{test.desc}</TableCell>
								<TableCell>
									<ReactJson
										style={{ width: 450 }}
										theme="monokai"
										enableClipboard={false}
										displayDataTypes={false}
										displayObjectSize={false}
										onEdit={(update) => {
											test.config = update.updated_src;
										}}
										src={test.defaultConfig}
									/>
								</TableCell>
								<TableCell align="center">
									<Button
										variant="contained"
										color="primary"
										onClick={() => {
											navigate(`${test.route}?config=${JSON.stringify(test.config || test.defaultConfig)}`);
										}}
									>
										Run
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
			<Outlet />
		</>
	);
};

export default PerfSuit;

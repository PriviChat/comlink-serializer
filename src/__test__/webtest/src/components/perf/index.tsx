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
import { Test } from './types';

import style from './style.css';

export const TEST_QUERY_PARAM = 'test';

const PerfSuit = () => {
	const navigate = useNavigate();
	const [test, setTest] = useState<Test>();

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
											// if the config has not been set
											// set the config to the defaultConfig
											if (!test.config) test.config = test.defaultConfig;
											setTest(test);
											navigate(`${test.route}?${TEST_QUERY_PARAM}=${JSON.stringify(test)}`);
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
			<div class={style.testResult}>
				<Outlet />
			</div>
		</>
	);
};

export default PerfSuit;

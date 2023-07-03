const simpleGit = require('simple-git');
const git = simpleGit.default();
const fs = require('fs');

const GIT_URL = 'git@gitlab.dataon.com:fe-custom';
const PATH = 'client';

const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout,
});

function responseError(err, msg = 'Process Error') {
	console.log(msg, err);
	readline.close();
}

async function usingGit(name) {
	try {
		console.log('Process to clone repository...');

		await git
			.clone(`${GIT_URL}/template/fe-custom-client-template.git`, `./${PATH}/${name}`)
			.then(async () => {
				git.cwd(`./${PATH}/${name}`)
					.then(() => {
						console.log('Cleaning remote origin...');

						git.removeRemote('origin')
							.then(async () => {
								console.log('Add new remote origin...');

								await git
									.addRemote('origin', `${GIT_URL}/${name}.git`)
									.then(async () => {
										await git
											.push('origin', 'master')
											.then(() => {
												console.log('Process Complete');
												readline.close();
											})
											.catch((err) => {
												responseError(err, 'PUSH_RESPOSITORY_ERROR');
											});
									})
									.catch((err) => {
										responseError(err, 'ADD_REMOTE_ERROR');
									});
							})
							.catch((err) => {
								responseError(err, 'REMOVE_REMOTE_ERROR');
							});
					})
					.catch((err) => {
						responseError(err, 'CHANGE_DIRECTORY_ERROR');
					});
			})
			.catch((err) => {
				responseError(err, 'CLONE_PROCESS_ERROR: ');
			});
	} catch (error) {
		if (error) responseError(error, 'SOMETHING_WENT_WRONG: ');
	}
}

readline.question(`What's the client name?`, (name) => {
	const dir = `./${PATH}`;
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir);
	}

	usingGit(`fe-custom-${name}`);
});

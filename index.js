const simpleGit = require('simple-git');
const git = simpleGit.default();
const fs = require('fs');
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });

const CUSTOM_NAME = 'fe-custom';
const GIT_URL = `git@gitlab.dataon.com:${CUSTOM_NAME}`;
const PATH = 'client';

/**
 *
 * @param {any} err
 * @param {string} msg
 */
function responseError(err, msg = 'Process error') {
	console.log(msg, err);
	readline.close();
}

function createSpace() {
	for (let index = 0; index < 10; index++) console.log('*'.repeat(index + 1));
}

/**
 *
 * @param {string} name
 * @return {boolean}
 */
function duplicateClientPath(name) {
	const isClientPathExist = `./${PATH}/${name}`;
	if (fs.existsSync(isClientPathExist)) return true;

	return false;
}

/**
 *
 * @param {string} name
 */
async function usingGit(name) {
	if (duplicateClientPath(name)) {
		console.log('This client name already exists, use a different name.');
		return startQuestion(true);
	}

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
										.pull('origin', 'master')
										.push(['-u', 'origin', 'master'])
										.then(() => {
											console.log('Process Complete');
											readline.close();
										})
										.catch((err) => responseError(err, 'PUSH_RESPOSITORY_ERROR'));
								})
								.catch((err) => responseError(err, 'ADD_REMOTE_ERROR'));
						})
						.catch((err) => responseError(err, 'REMOVE_REMOTE_ERROR'));
				})
				.catch((err) => responseError(err, 'CHANGE_DIRECTORY_ERROR'));
		})
		.catch((err) => responseError(err, 'CLONE_PROCESS_ERROR: '));
}

/**
 *
 * @param {boolean} isDuplicate
 */
function startQuestion(isDuplicate) {
	if (!isDuplicate) createSpace();

	/**
	 * @param {string} name
	 */
	readline.question(`What's the ${isDuplicate ? 'new client name?' : 'client name?'}`, (name) => {
		const dir = `./${PATH}`;
		if (!fs.existsSync(dir)) fs.mkdirSync(dir);

		if (name?.includes(CUSTOM_NAME)) return usingGit(`${name}`);

		return usingGit(`${CUSTOM_NAME}-${name}`);
	});
}

startQuestion();

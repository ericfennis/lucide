/* eslint-disable no-restricted-syntax,  no-await-in-loop */
import fs from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';
import semver from 'semver';
import { readSvgDirectory } from '../tools/build-helpers/src/readSvgDirectory.ts';

const DATE_OF_FORK = '2020-06-08T16:39:52+0100';

const git = simpleGit();

const currentDir = process.cwd();
const ICONS_DIR = path.resolve(currentDir, 'icons');
const iconJsonFiles = await readSvgDirectory(ICONS_DIR, '.json');
const location = path.resolve(currentDir, 'scripts/data', 'releaseMetaData.json');
const mergeCommitsFile = path.resolve(currentDir, 'scripts', 'mergeCommits.json');
const iconPRNumbers = path.resolve(currentDir, 'scripts', 'iconPRNumbers.json');
const releaseMetaDataDirectory = path.resolve(currentDir, 'scripts/data', 'releaseMetadata');

const allowedIconNameWithDoubleRelease = ['slash'];

if (fs.existsSync(location)) {
  fs.rmSync(location, { recursive: true, force: true });
}

if (fs.existsSync(releaseMetaDataDirectory)) {
  fs.rmSync(releaseMetaDataDirectory, { recursive: true, force: true });
}

if (!fs.existsSync(releaseMetaDataDirectory)) {
  fs.mkdirSync(releaseMetaDataDirectory, { recursive: true });
}

const lastMergePR = 3808;
const prCommits: Record<number, string[]> = {};

// await Promise.all(
//   Array.from({ length: lastMergePR }, async (_, i) => {
//     const prNumber = i + 1;
//     const searchPattern = `(#${prNumber})`;
//     try {
//       // Run git log to find merge commits
//       const log = await git.log({
//         '--grep': searchPattern
//       });

//       if (log.total === 0) {
//         console.log(`No merge commits found for PR #${prNumber}`);
//       } else {

//         console.log(`Merge commit(s) for PR #${prNumber}:`);

//         const files = log.all.map(entry => entry.hash);

//         prCommits[prNumber] = log.all.map(entry => entry.hash);
//         log.all.forEach(entry => {
//           console.log(`${entry.hash}  ${entry.message}`);
//         });
//       }
//       // if(log.all.length > 1) {
//       //   throw new Error(`Multiple merge commits found for PR #${prNumber}`);
//       // }
//     } catch (err) {
//       console.error("Error running git command:", err);
//     }
//   })
// );

// await fs.promises.writeFile(
//   mergeCommitsFile,
//   JSON.stringify( prCommits, null, 2),
//   'utf-8',
// );

// const mergeCommitsFileContent = await fs.promises.readFile(mergeCommitsFile, 'utf-8');

// console.log(JSON.parse(mergeCommitsFileContent));
// const mergeCommitsFileJson: Record<number, string[]> = JSON.parse(mergeCommitsFileContent);

type IconName = string;

// const iconChangesByPR: Record<IconName, string> = {};

// await Promise.all(
//   Object.entries(mergeCommitsFileJson).map(async ([prNumber, commitHashes]) => {
//     if (String(prNumber) === '1' || String(prNumber) === '2') {
//       return;
//     }

//     for(const commitHash of commitHashes) {
//       const changedFiles = await getChangedFilesForCommit(commitHash);
//       console.log(`Changed files for commit ${commitHash} (PR #${prNumber}):`, changedFiles);

//       changedFiles.forEach(({ status, file, renamedFile }) => {
//         console.log(`  - ${status}: ${file}${renamedFile ? ` (renamed to ${renamedFile})` : ''}`);

//         if (status === 'A') {
//           const iconName = path.basename(file, '.svg');
//           if (!(iconName in iconChangesByPR)) {

//             if(iconName in iconChangesByPR) {
//               throw new Error(`Icon '${iconName}' already has a recorded PR change (${iconChangesByPR[iconName]})`);
//             }
//             iconChangesByPR[iconName] = prNumber;
//           }
//         }

//         if(status.startsWith('R')) {
//           const oldIconName = path.basename(file, '.svg');
//           const newIconName = path.basename(renamedFile!, '.svg');

//           iconChangesByPR[oldIconName] = prNumber;
//           iconChangesByPR[newIconName] = prNumber;
//         }
//       });
//     }
//   })
// );

// await fs.promises.writeFile(
//   iconPRNumbers,
//   JSON.stringify( iconChangesByPR, null, 2),
//   'utf-8',
// );

// async function getChangedFilesForCommit(commitHash: string) {

//   const output = await git.show([ '--name-status', '--pretty=', commitHash ]);

//   const lines = output
//     .split('\n')
//     .map(l => l.trim())
//     .filter(Boolean);

//   const files = lines.map(line => {
//     const parts = line.split('\t');

//     // Rename/Copies have two paths: old and new
//     const [status, file, renamedFile] = parts

//     return { status, file, renamedFile };
//   });

//   const iconFiles = files.filter(({ file }) => file != null && file.startsWith('icons/'));

//   return iconFiles;
// }

const iconPRNumbersContent = await fs.promises.readFile(iconPRNumbers, 'utf-8');

const iconPRNumbersJson: Record<IconName, string> = JSON.parse(iconPRNumbersContent);

console.log(iconPRNumbersJson)

iconJsonFiles.forEach((iconJsonFile) => {
  const iconName = path.basename(iconJsonFile, '.json');
  const prNumber = iconPRNumbersJson[iconName];

  if (prNumber) {
    console.log(`Icon '${iconName}' was added in PR #${prNumber}`);
  } else {
    console.error(`No PR number found for icon '${iconName}'`);
  }
});

// const comparisonsPromises = tags.map(async (tag, index) => {
//   const previousTag = tags[index - 1];

//   if (!previousTag) return undefined;

//   const diff = await git.diff(['--name-status', '--oneline', previousTag, tag]);
  // const files = diff.split('\n').map((line) => {
  //   const [status, file, renamedFile] = line.split('\t');

  //   return { status, file, renamedFile };
  // });

//   const iconFiles = files.filter(({ file }) => file != null && file.startsWith('icons/'));
//   let date = (await git.show(['-s', '--format=%cI', tag])).trim();

//   // Fallback to dat of fork if date is not valid
//   if (!date.startsWith('20')) {
//     date = DATE_OF_FORK;
//   }

//   return {
//     tag,
//     date,
//     iconFiles,
//   };
// });

// const comparisons = await Promise.all(comparisonsPromises);
// const newReleaseMetaData = {};

// comparisons.forEach(({ tag, iconFiles, date } = {}) => {
//   if (tag == null) return;

//   iconFiles.forEach(({ status, file, renamedFile }) => {
//     if (file.endsWith('.json')) return;

//     const version = tag.replace('v', '');
//     const iconName = path.basename(file, '.svg');

//     if (newReleaseMetaData[iconName] == null) newReleaseMetaData[iconName] = {};

//     const releaseData = {
//       version,
//       date,
//     };

//     if (status.startsWith('R')) {
//       // Make sure set the old one as well
//       newReleaseMetaData[iconName].changedRelease = {
//         version,
//         date,
//       };

//       const renamedIconName = path.basename(renamedFile, '.svg');

//       if (newReleaseMetaData[renamedIconName] == null) {
//         newReleaseMetaData[renamedIconName] = {};
//       }

//       newReleaseMetaData[renamedIconName].changedRelease = {
//         version,
//         date,
//       };
//     }

//     if (status === 'A') {
//       if (
//         'changedRelease' in newReleaseMetaData[iconName] &&
//         !allowedIconNameWithDoubleRelease.includes(iconName)
//       ) {
//         throw new Error(`Icon '${iconName}' has already changedRelease set.`);
//       }

//       newReleaseMetaData[iconName].createdRelease = releaseData;
//       newReleaseMetaData[iconName].changedRelease = releaseData;
//     }
//     if (status === 'M') {
//       newReleaseMetaData[iconName].changedRelease = {
//         version,
//         date,
//       };
//     }
//   });
// });

// const defaultReleaseMetaData = {
//   createdRelease: {
//     version: '0.0.0',
//     date: DATE_OF_FORK,
//   },
//   changedRelease: {
//     version: '0.0.0',
//     date: DATE_OF_FORK,
//   },
// };

// try {
//   const releaseMetaData = await Promise.all(
//     iconJsonFiles.map(async (iconJsonFile) => {
//       const iconName = path.basename(iconJsonFile, '.json');
//       const metaDir = path.resolve(releaseMetaDataDirectory, `${iconName}.json`);

//       if (!(iconName in newReleaseMetaData)) {
//         console.error(`Could not find release metadata for icon '${iconName}'.`);
//       }

//       const contents = {
//         ...defaultReleaseMetaData,
//         ...(newReleaseMetaData[iconName] ?? {}),
//       };

//       const metaData = await fs.promises.readFile(path.join(ICONS_DIR, iconJsonFile), 'utf-8');
//       const iconMetaData = JSON.parse(metaData);
//       const aliases = iconMetaData.aliases ?? [];

//       if (aliases.length) {
//         aliases.forEach((alias) => {
//           if (!(alias.name in newReleaseMetaData)) {
//             return;
//           }

//           contents.createdRelease =
//             newReleaseMetaData[alias.name].createdRelease ?? defaultReleaseMetaData.createdRelease;
//         });
//       }

//       const output = JSON.stringify(contents, null, 2);
//       await fs.promises.writeFile(metaDir, output, 'utf-8');

//       return [iconName, contents];
//     }),
//   );
  // await fs.promises.writeFile(
  //   location,
  //   JSON.stringify(Object.fromEntries(releaseMetaData), null, 2),
  //   'utf-8',
  // );

//   console.log('Successfully written icon release meta files');
// } catch (error) {
//   throw new Error(`Something went wrong generating icon release meta cache file,\n ${error}`);
// }

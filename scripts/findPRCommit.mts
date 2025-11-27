import fs from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';

const git = simpleGit();
// worker.mjs
export default async ({ prNumber }: { prNumber: number }) => {
  // const prNumber = i + 1;
    const searchPattern = `(#${prNumber})`;
    try {
      // Run git log to find merge commits
      const log = await git.log({
        '--grep': searchPattern
      });

      if (log.total === 0) {
        console.log(`No merge commits found for PR #${prNumber}`);
        return [];
      } else {

        console.log(`Merge commit(s) for PR #${prNumber}:`);

        log.all.forEach(entry => {
          console.log(`${entry.hash}  ${entry.message}`);
        });

        return log.all.map(entry => entry.hash);
      }
      // if(log.all.length > 1) {
      //   throw new Error(`Multiple merge commits found for PR #${prNumber}`);
      // }
    } catch (err) {
      console.error("Error running git command:", err);
    }
}

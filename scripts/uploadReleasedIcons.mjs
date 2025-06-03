import fs from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';
import semver from 'semver';

const DATE_OF_FORK = '2020-06-08T16:39:52+0100';

const git = simpleGit();

const fetchAllReleases = async () => {
  await git.fetch('https://github.com/lucide-icons/lucide.git', '--tags');

  return Promise.all(
    (await git.tag(['-l']))
      .trim()
      .split(/\n/)
      .filter((tag) => semver.valid(tag))
      .sort(semver.compare),
  );
};

const tags = await fetchAllReleases();

console.log(`Found ${tags.length} releases.`);

console.log(tags);


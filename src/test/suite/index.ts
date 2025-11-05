/**
 * Test Suite Index
 * Discovers and runs all tests
 */

import { logError } from '@weaveai/shared';
import Mocha from 'mocha';
import { glob } from 'glob';
import * as path from 'path';

// Type definition for Mocha run callback
type MochaRunCallback = (failures: number) => void;

export async function run(): Promise<void> {
  // Create the mocha test instance
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });

  const testsRoot = path.resolve(__dirname, '..');
  const globPattern = '**/**.test.ts';

  try {
    // Get test files using glob
    const files = await glob(globPattern, { cwd: testsRoot });

    // Add files to the test suite
    files.forEach((file: string) => {
      mocha.addFile(path.resolve(testsRoot, file));
    });

    // Run the mocha test
    return new Promise<void>((resolve, reject) => {
      const runCallback: MochaRunCallback = (failures: number) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      };
      mocha.run(runCallback);
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(errorMessage);
    throw error;
  }
}

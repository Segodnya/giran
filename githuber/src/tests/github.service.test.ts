import { GitHubService, GitHubApiError } from '../services/github.service';

/**
 * Simple test runner for GitHub API service
 * Run with: npx ts-node src/tests/github.service.test.ts
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

class SimpleTestRunner {
  private results: TestResult[] = [];

  async runTest(name: string, testFn: () => Promise<void> | void): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - startTime
      });
      console.log(`✅ ${name}`);
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });
      console.log(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n📊 Test Summary:');
    console.log(`Passed: ${passed}/${total}`);
    console.log(`Total time: ${totalTime}ms`);
    
    if (passed === total) {
      console.log('🎉 All tests passed!');
    } else {
      console.log('⚠️  Some tests failed');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`   - ${r.name}: ${r.error}`);
      });
    }
  }
}

// Helper assertion functions
function assertEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(condition: boolean, message?: string): void {
  if (!condition) {
    throw new Error(message || 'Expected condition to be true');
  }
}

function assertInstanceOf<T>(actual: any, constructor: new (...args: any[]) => T, message?: string): void {
  if (!(actual instanceof constructor)) {
    throw new Error(message || `Expected instance of ${constructor.name}`);
  }
}

// Test suite
async function runTests(): Promise<void> {
  console.log('🧪 Running GitHub Service Tests...\n');
  
  const runner = new SimpleTestRunner();
  const githubService = new GitHubService();

  // Unit tests
  await runner.runTest('Should create instance without token', () => {
    const service = new GitHubService();
    assertInstanceOf(service, GitHubService);
  });

  await runner.runTest('Should create instance with custom config', () => {
    const service = new GitHubService({
      token: 'test-token',
      userAgent: 'Test-Agent/1.0.0',
      rateLimit: 30
    });
    assertInstanceOf(service, GitHubService);
  });

  await runner.runTest('Should get request stats', () => {
    const stats = githubService.getRequestStats();
    assertTrue(typeof stats.count === 'number', 'Stats count should be a number');
    assertInstanceOf(stats.resetTime, Date, 'Reset time should be a Date');
  });

  // Integration tests (require network access)
  await runner.runTest('Should handle non-existent repository error', async () => {
    try {
      await githubService.getRepository('nonexistent-user-12345', 'nonexistent-repo-12345');
      throw new Error('Expected error for non-existent repository');
    } catch (error) {
      assertInstanceOf(error, GitHubApiError);
      assertEqual((error as GitHubApiError).status, 404, 'Should return 404 status');
    }
  });

  await runner.runTest('Should get public repository info', async () => {
    const repo = await githubService.getRepository('microsoft', 'typescript');
    assertEqual(repo.owner, 'microsoft');
    assertEqual(repo.repo, 'TypeScript');
    assertEqual(repo.private, false);
    assertTrue(repo.stargazersCount > 0, 'Should have stars');
  });

  await runner.runTest('Should get repository content', async () => {
    const contents = await githubService.getContent('microsoft', 'typescript');
    assertTrue(Array.isArray(contents), 'Contents should be an array');
    assertTrue(contents.length > 0, 'Should have content items');
    
    const readmeFile = contents.find(item => item.name.toLowerCase() === 'readme.md');
    assertTrue(!!readmeFile, 'Should find README.md file');
    assertEqual(readmeFile?.type, 'file', 'README should be a file');
  });

  await runner.runTest('Should get file content', async () => {
    const content = await githubService.getFileContent('microsoft', 'typescript', 'README.md');
    assertTrue(typeof content === 'string', 'Content should be a string');
    assertTrue(content.length > 0, 'Content should not be empty');
    assertTrue(content.includes('TypeScript'), 'README should mention TypeScript');
  });

  await runner.runTest('Should get repository branches', async () => {
    const branches = await githubService.getBranches('microsoft', 'typescript');
    assertTrue(Array.isArray(branches), 'Branches should be an array');
    assertTrue(branches.length > 0, 'Should have branches');
    
    const mainBranch = branches.find(branch => 
      branch.name === 'main' || branch.name === 'master'
    );
    assertTrue(!!mainBranch, 'Should have main/master branch');
  });

  await runner.runTest('Should check if repository is public', async () => {
    const isPublic = await githubService.isRepositoryPublic('microsoft', 'typescript');
    assertEqual(isPublic, true, 'Microsoft TypeScript repo should be public');
  });

  await runner.runTest('Should search repositories', async () => {
    const results = await githubService.searchRepositories('typescript', {
      sort: 'stars',
      order: 'desc',
      perPage: 5
    });
    
    assertTrue(Array.isArray(results.repositories), 'Repositories should be an array');
    assertTrue(results.totalCount > 0, 'Should find repositories');
    assertTrue(results.repositories.length <= 5, 'Should respect perPage limit');
    
    // First result should have high star count due to sorting
    if (results.repositories.length > 0) {
      assertTrue(results.repositories[0].stargazersCount > 1000, 'Top result should have many stars');
    }
  });

  await runner.runTest('Should get rate limit status', async () => {
    const rateLimit = await githubService.getRateLimit();
    assertTrue(typeof rateLimit.rate.limit === 'number', 'Rate limit should be a number');
    assertTrue(typeof rateLimit.rate.remaining === 'number', 'Remaining should be a number');
    assertTrue(rateLimit.rate.remaining >= 0, 'Remaining should not be negative');
  });

  runner.printSummary();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { runTests }; 
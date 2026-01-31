/**
 * Edge Function Test Harness
 *
 * Tests the deployed Supabase edge functions with sample data.
 * Run from browser console or import in a test component.
 *
 * Usage:
 *   1. Import in a React component
 *   2. Call testAllFunctions() after user is authenticated
 *   3. Check console for results
 */

import { supabase } from '../services/supabase';

// Sample HTML for testing (minimal example)
const SAMPLE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Dashboard</title>
</head>
<body>
  <header class="header">
    <nav class="nav">
      <a href="/" class="logo">Acme Inc</a>
      <ul class="nav-links">
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  </header>
  <main class="main">
    <h1>Welcome to Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-value">1,234</p>
      </div>
      <div class="stat-card">
        <h3>Revenue</h3>
        <p class="stat-value">$45,678</p>
      </div>
      <div class="stat-card">
        <h3>Orders</h3>
        <p class="stat-value">567</p>
      </div>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>John Doe</td><td>john@example.com</td><td>Active</td></tr>
        <tr><td>Jane Smith</td><td>jane@example.com</td><td>Pending</td></tr>
      </tbody>
    </table>
  </main>
</body>
</html>
`.trim();

const SAMPLE_PROMPT = "Add a search bar to filter the data table and make the stat cards more visually appealing with icons";

const SAMPLE_UI_METADATA = {
  colors: {
    primary: ['#1890ff', '#40a9ff'],
    background: ['#ffffff', '#f5f5f5'],
  },
  typography: {
    fontFamilies: ['Inter', 'system-ui'],
    fontSizes: ['14px', '16px', '24px', '32px'],
  },
  layout: {
    gridSystems: ['CSS Grid'],
    flexboxUsage: ['flex-direction: row', 'justify-content: space-between'],
  },
  components: [
    { type: 'header', count: 1 },
    { type: 'nav', count: 1 },
    { type: 'card', count: 3 },
    { type: 'table', count: 1 },
  ],
};

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  response?: unknown;
  error?: string;
}

/**
 * Test the understand-request edge function
 */
export async function testUnderstandRequest(sessionId: string): Promise<TestResult> {
  const startTime = Date.now();
  const name = 'understand-request';

  console.log(`\n[TEST] Testing ${name}...`);
  console.log(`[TEST] Session ID: ${sessionId}`);
  console.log(`[TEST] Prompt: "${SAMPLE_PROMPT}"`);
  console.log(`[TEST] HTML size: ${SAMPLE_HTML.length} chars`);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('understand-request', {
      body: {
        sessionId,
        prompt: SAMPLE_PROMPT,
        compactedHtml: SAMPLE_HTML,
        uiMetadata: SAMPLE_UI_METADATA,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`[TEST] ${name} FAILED:`, error);
      return { name, success: false, duration, error: error.message };
    }

    if (!data?.success) {
      console.error(`[TEST] ${name} returned error:`, data?.error);
      return { name, success: false, duration, error: data?.error || 'Unknown error' };
    }

    console.log(`[TEST] ${name} SUCCESS in ${duration}ms`);
    console.log(`[TEST] Understanding:`, data.understanding);
    console.log(`[TEST] Model:`, data.model);
    console.log(`[TEST] Provider:`, data.provider);

    return { name, success: true, duration, response: data };
  } catch (err) {
    const duration = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[TEST] ${name} ERROR:`, errorMsg);
    return { name, success: false, duration, error: errorMsg };
  }
}

/**
 * Test the generate-variant-plan edge function
 */
export async function testGenerateVariantPlan(sessionId: string): Promise<TestResult> {
  const startTime = Date.now();
  const name = 'generate-variant-plan';

  console.log(`\n[TEST] Testing ${name}...`);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('generate-variant-plan', {
      body: {
        sessionId,
        prompt: SAMPLE_PROMPT,
        compactedHtml: SAMPLE_HTML,
        uiMetadata: SAMPLE_UI_METADATA,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`[TEST] ${name} FAILED:`, error);
      return { name, success: false, duration, error: error.message };
    }

    if (!data?.success) {
      console.error(`[TEST] ${name} returned error:`, data?.error);
      return { name, success: false, duration, error: data?.error || 'Unknown error' };
    }

    console.log(`[TEST] ${name} SUCCESS in ${duration}ms`);
    console.log(`[TEST] Plans count:`, data.plans?.length);
    data.plans?.forEach((plan: { variant_index: number; title: string; key_changes: string[] }) => {
      console.log(`[TEST]   Variant ${plan.variant_index}: ${plan.title}`);
      console.log(`[TEST]     Changes: ${plan.key_changes?.join(', ')}`);
    });

    return { name, success: true, duration, response: data };
  } catch (err) {
    const duration = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[TEST] ${name} ERROR:`, errorMsg);
    return { name, success: false, duration, error: errorMsg };
  }
}

/**
 * Test the generate-variant-code edge function
 */
export async function testGenerateVariantCode(sessionId: string, planId: string): Promise<TestResult> {
  const startTime = Date.now();
  const name = 'generate-variant-code';

  console.log(`\n[TEST] Testing ${name}...`);
  console.log(`[TEST] Plan ID: ${planId}`);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('generate-variant-code', {
      body: {
        sessionId,
        planId,
        variantIndex: 1,
        sourceHtml: SAMPLE_HTML,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`[TEST] ${name} FAILED:`, error);
      return { name, success: false, duration, error: error.message };
    }

    if (!data?.success) {
      console.error(`[TEST] ${name} returned error:`, data?.error);
      return { name, success: false, duration, error: data?.error || 'Unknown error' };
    }

    console.log(`[TEST] ${name} SUCCESS in ${duration}ms`);
    console.log(`[TEST] Generated HTML size:`, data.html?.length || 0, 'chars');
    console.log(`[TEST] First 500 chars:`, data.html?.substring(0, 500));

    return { name, success: true, duration, response: { ...data, html: data.html?.substring(0, 1000) + '...' } };
  } catch (err) {
    const duration = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[TEST] ${name} ERROR:`, errorMsg);
    return { name, success: false, duration, error: errorMsg };
  }
}

/**
 * Test the generate-wireframes edge function
 */
export async function testGenerateWireframes(sessionId: string): Promise<TestResult> {
  const startTime = Date.now();
  const name = 'generate-wireframes';

  console.log(`\n[TEST] Testing ${name}...`);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // First get plans for this session
    const { data: plans } = await supabase
      .from('vibe_variant_plans')
      .select('*')
      .eq('session_id', sessionId);

    if (!plans || plans.length === 0) {
      throw new Error('No plans found for session - run testGenerateVariantPlan first');
    }

    const { data, error } = await supabase.functions.invoke('generate-wireframes', {
      body: {
        sessionId,
        plans: plans.map(p => ({
          id: p.id,
          variant_index: p.variant_index,
          title: p.title,
          description: p.description,
          key_changes: p.key_changes,
        })),
        sourceHtml: SAMPLE_HTML,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    const duration = Date.now() - startTime;

    if (error) {
      console.error(`[TEST] ${name} FAILED:`, error);
      return { name, success: false, duration, error: error.message };
    }

    if (!data?.success) {
      console.error(`[TEST] ${name} returned error:`, data?.error);
      return { name, success: false, duration, error: data?.error || 'Unknown error' };
    }

    console.log(`[TEST] ${name} SUCCESS in ${duration}ms`);
    console.log(`[TEST] Wireframes generated:`, data.wireframes?.length);

    return { name, success: true, duration, response: data };
  } catch (err) {
    const duration = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[TEST] ${name} ERROR:`, errorMsg);
    return { name, success: false, duration, error: errorMsg };
  }
}

/**
 * Create a test session for running tests
 */
export async function createTestSession(): Promise<string | null> {
  console.log('\n[TEST] Creating test session...');

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('[TEST] Auth error:', userError);
      throw new Error(`Auth failed: ${userError.message}`);
    }
    if (!user) {
      throw new Error('Not authenticated - please log in first');
    }
    console.log('[TEST] Authenticated as:', user.email);

    // Get or create a test screen
    console.log('[TEST] Looking for existing screens...');
    const { data: screens, error: screensError } = await supabase
      .from('captured_screens')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (screensError) {
      console.error('[TEST] Error fetching screens:', screensError);
      throw new Error(`Failed to fetch screens: ${screensError.message}`);
    }

    let screenId: string;

    if (screens && screens.length > 0) {
      screenId = screens[0].id;
      console.log('[TEST] Using existing screen:', screenId);
    } else {
      // Create a test screen
      console.log('[TEST] No screens found, creating test screen...');
      const { data: newScreen, error: screenError } = await supabase
        .from('captured_screens')
        .insert({
          user_id: user.id,
          name: 'Test Screen',
          html: SAMPLE_HTML,
          source_url: 'http://test.local',
        })
        .select()
        .single();

      if (screenError) {
        console.error('[TEST] Error creating screen:', screenError);
        throw new Error(`Failed to create screen: ${screenError.message} (code: ${screenError.code})`);
      }
      screenId = newScreen.id;
      console.log('[TEST] Created test screen:', screenId);
    }

    // Create test session
    console.log('[TEST] Creating vibe session...');
    const { data: session, error: sessionError } = await supabase
      .from('vibe_sessions')
      .insert({
        user_id: user.id,
        screen_id: screenId,
        name: 'Test Session ' + new Date().toISOString(),
        prompt: SAMPLE_PROMPT,
        status: 'pending',
      })
      .select()
      .single();

    if (sessionError) {
      console.error('[TEST] Error creating session:', sessionError);
      throw new Error(`Failed to create session: ${sessionError.message} (code: ${sessionError.code})`);
    }

    console.log('[TEST] Created test session:', session.id);
    return session.id;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TEST] Failed to create test session:', errorMsg);
    throw err; // Re-throw to show in UI
  }
}

/**
 * Run all edge function tests in sequence
 */
export async function testAllFunctions(): Promise<TestResult[]> {
  console.log('='.repeat(60));
  console.log('EDGE FUNCTION TEST SUITE');
  console.log('='.repeat(60));

  const results: TestResult[] = [];

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('[TEST] Not authenticated! Please log in first.');
    return [{ name: 'auth-check', success: false, duration: 0, error: 'Not authenticated' }];
  }
  console.log('[TEST] Authenticated as:', session.user.email);

  // Create test session
  let sessionId: string;
  try {
    const result = await createTestSession();
    if (!result) {
      return [{ name: 'create-session', success: false, duration: 0, error: 'Failed to create test session (null result)' }];
    }
    sessionId = result;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return [{ name: 'create-session', success: false, duration: 0, error: errorMsg }];
  }

  // Test 1: understand-request
  const understandResult = await testUnderstandRequest(sessionId);
  results.push(understandResult);

  if (!understandResult.success) {
    console.log('\n[TEST] Stopping - understand-request failed');
    return results;
  }

  // Test 2: generate-variant-plan
  const planResult = await testGenerateVariantPlan(sessionId);
  results.push(planResult);

  if (!planResult.success) {
    console.log('\n[TEST] Stopping - generate-variant-plan failed');
    return results;
  }

  // Test 3: generate-wireframes
  const wireframeResult = await testGenerateWireframes(sessionId);
  results.push(wireframeResult);

  // Test 4: generate-variant-code (only if we have plans)
  if (planResult.success && planResult.response) {
    const response = planResult.response as { plans: Array<{ id: string }> };
    const planId = response.plans?.[0]?.id;
    if (planId) {
      const codeResult = await testGenerateVariantCode(sessionId, planId);
      results.push(codeResult);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(r => {
    const status = r.success ? '✓ PASS' : '✗ FAIL';
    console.log(`${status} ${r.name} (${r.duration}ms)${r.error ? ` - ${r.error}` : ''}`);
  });

  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  return results;
}

// Export sample data for use in components
export { SAMPLE_HTML, SAMPLE_PROMPT, SAMPLE_UI_METADATA };

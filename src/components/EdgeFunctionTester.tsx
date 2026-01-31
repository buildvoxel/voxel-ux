/**
 * Edge Function Tester Component
 *
 * A debugging tool to test Supabase edge functions.
 * Add this to Settings or a debug page.
 */

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Button, Card, CardContent, Chip } from '@/components/ui';
import {
  PlayCircle,
  CheckCircle,
  XCircle,
  CaretDown,
} from '@phosphor-icons/react';
import {
  testAllFunctions,
  testUnderstandRequest,
  testGenerateVariantPlan,
  testGenerateWireframes,
  createTestSession,
} from '../test/testEdgeFunctions';

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  response?: unknown;
  error?: string;
}

export const EdgeFunctionTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentTest('Preparing...');

    try {
      const testResults = await testAllFunctions();
      setResults(testResults);
    } catch (err) {
      console.error('Test suite error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setResults([{
        name: 'test-suite-error',
        success: false,
        duration: 0,
        error: errorMsg,
      }]);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const runSingleTest = async (testName: string) => {
    setIsRunning(true);
    setCurrentTest(testName);

    try {
      // Create session if needed
      let testSessionId = sessionId;
      if (!testSessionId) {
        testSessionId = await createTestSession();
        if (testSessionId) {
          setSessionId(testSessionId);
        } else {
          throw new Error('Failed to create test session');
        }
      }

      let result: TestResult;
      switch (testName) {
        case 'understand-request':
          result = await testUnderstandRequest(testSessionId);
          break;
        case 'generate-variant-plan':
          result = await testGenerateVariantPlan(testSessionId);
          break;
        case 'generate-wireframes':
          result = await testGenerateWireframes(testSessionId);
          break;
        default:
          throw new Error(`Unknown test: ${testName}`);
      }

      setResults(prev => {
        const filtered = prev.filter(r => r.name !== testName);
        return [...filtered, result];
      });
    } catch (err) {
      setResults(prev => [...prev, {
        name: testName,
        success: false,
        duration: 0,
        error: err instanceof Error ? err.message : 'Unknown error',
      }]);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const passedCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayCircle size={24} />
            <Typography variant="h6" fontWeight={600}>Edge Function Tester</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={isRunning ? <CircularProgress size={16} color="inherit" /> : <PlayCircle size={16} />}
            onClick={runAllTests}
            disabled={isRunning}
          >
            Run All Tests
          </Button>
        </Box>

        {/* Status */}
        {isRunning && (
          <Alert
            severity="info"
            icon={<CircularProgress size={20} />}
            sx={{ mb: 2 }}
          >
            Running: {currentTest || 'initializing...'}
          </Alert>
        )}

        {/* Summary */}
        {results.length > 0 && !isRunning && (
          <Alert
            severity={failedCount === 0 ? 'success' : failedCount === results.length ? 'error' : 'warning'}
            sx={{ mb: 2 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Results:</span>
              {passedCount > 0 && (
                <Chip label={`${passedCount} passed`} size="small" color="success" />
              )}
              {failedCount > 0 && (
                <Chip label={`${failedCount} failed`} size="small" color="error" />
              )}
            </Box>
          </Alert>
        )}

        {/* Individual Tests */}
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          Individual Tests
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => runSingleTest('understand-request')}
            disabled={isRunning}
          >
            Test understand-request
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => runSingleTest('generate-variant-plan')}
            disabled={isRunning}
          >
            Test generate-variant-plan
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => runSingleTest('generate-wireframes')}
            disabled={isRunning}
          >
            Test generate-wireframes
          </Button>
        </Box>

        {/* Session ID */}
        {sessionId && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Test Session ID: <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{sessionId}</code>
          </Typography>
        )}

        {/* Results */}
        {results.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Test Results
            </Typography>
            {results.map((result, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<CaretDown size={16} />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    {result.success ? (
                      <CheckCircle size={18} color="#52c41a" weight="fill" />
                    ) : (
                      <XCircle size={18} color="#ff4d4f" weight="fill" />
                    )}
                    <Typography fontWeight={500}>{result.name}</Typography>
                    <Chip label={`${result.duration}ms`} size="small" variant="outlined" />
                    {result.error && (
                      <Typography variant="caption" color="error" sx={{ ml: 'auto', mr: 2 }}>
                        {result.error.slice(0, 50)}...
                      </Typography>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {result.response ? (
                    <Box
                      component="pre"
                      sx={{
                        background: '#f5f5f5',
                        padding: 2,
                        borderRadius: 1,
                        fontSize: 12,
                        overflow: 'auto',
                        maxHeight: 400,
                        margin: 0,
                      }}
                    >
                      {JSON.stringify(result.response, null, 2)}
                    </Box>
                  ) : result.error ? (
                    <Alert severity="error">{result.error}</Alert>
                  ) : (
                    <Typography color="text.secondary">No response data</Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        )}

        {/* Help */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
          This tests your deployed Supabase edge functions. Make sure you have an API key configured
          in the API Keys tab before running tests.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default EdgeFunctionTester;

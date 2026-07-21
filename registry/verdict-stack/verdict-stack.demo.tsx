import { VerdictStack } from './verdict-stack'

// Rounded fictional reconstruction of the donor figure.
export default function VerdictStackDemo() {
  return (
    <VerdictStack
      taxonomy={[
        // Verdict semantics over neutral palette: pass green, failures on a warm
        // ramp, verifier artifacts grey, cheated ink-black.
        { group: 'PASS', tags: [{ key: 'legitimate', label: 'legitimate', color: '#1a7f37' }] },
        {
          group: 'FAIL',
          tags: [
            { key: 'missed_requirement', label: 'missed requirement', color: '#b45309' },
            { key: 'wrong_logic', label: 'wrong logic', color: '#c41e1e' },
            { key: 'regression', label: 'regression', color: '#a8562f' },
          ],
        },
        {
          group: 'VERIFIER',
          tags: [
            { key: 'test_mismatch', label: 'test mismatch', color: '#8a8a8a' },
            { key: 'cheated', label: 'cheated', color: '#111111' },
          ],
        },
      ]}
      subjects={[
        {
          label: 'gpt-5.5',
          n: 90,
          counts: {
            legitimate: 60,
            missed_requirement: 18,
            wrong_logic: 6,
            regression: 3,
            test_mismatch: 3,
            cheated: 0,
          },
        },
        {
          label: 'claude-opus-4.7',
          n: 90,
          counts: {
            legitimate: 44,
            missed_requirement: 30,
            wrong_logic: 6,
            regression: 4,
            test_mismatch: 2,
            cheated: 4,
          },
        },
        {
          label: 'gpt-5.4',
          n: 90,
          counts: {
            legitimate: 42,
            missed_requirement: 32,
            wrong_logic: 8,
            regression: 4,
            test_mismatch: 4,
            cheated: 0,
          },
        },
        {
          label: 'claude-sonnet-4.6',
          n: 80,
          counts: {
            legitimate: 24,
            missed_requirement: 38,
            wrong_logic: 8,
            regression: 4,
            test_mismatch: 4,
            cheated: 2,
          },
        },
        {
          label: 'gemini-3.1-pro',
          n: 83,
          counts: {
            legitimate: 8,
            missed_requirement: 40,
            wrong_logic: 16,
            regression: 8,
            test_mismatch: 9,
            cheated: 2,
          },
        },
        {
          label: 'claude-haiku-4.5',
          n: 90,
          counts: {
            legitimate: 0,
            missed_requirement: 52,
            wrong_logic: 20,
            regression: 8,
            test_mismatch: 8,
            cheated: 2,
          },
        },
      ]}
    />
  )
}

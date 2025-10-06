import { test, expect, Page } from '@playwright/test';
import { navigateToPersona, clearBrowserState } from '../helpers/persona-helper';
import {
  waitForWidget,
  assertWidgetVisible,
  assertWidgetContainsText,
  assertAIResponseContains,
  getWidget,
} from '../helpers/widget-assertions';
import { sendQuery, clickWidgetButton } from '../helpers/multi-step-helper';

/**
 * Support Agent Persona E2E Tests
 *
 * Tests 9 queries in exact user-specified sequence:
 * - 7 single-step queries
 * - 1 action widget query with button click
 * - 1 single-step query
 * Total: 9 test cases
 */
test.describe('Support Agent Persona Tests', () => {
  let page: Page;
  const consoleMessages: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Capture console messages
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Navigate to Support Agent persona demo page
    await navigateToPersona(page, 'support-agent');
    await clearBrowserState(page);
    await navigateToPersona(page, 'support-agent');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Q1: Agent Dashboard Widget', async () => {
    console.log('🎯 Testing Q1: "Good morning, what\'s on my plate today?"');

    await sendQuery(page, "Good morning, what's on my plate today?");

    // Wait for widget
    await assertWidgetVisible(page, 'agent-dashboard');

    // Validate content (should NOT show agent name for "My Dashboard")
    await assertWidgetContainsText(page, 'agent-dashboard', 'My Dashboard');

    console.log('✅ Q1 PASS: Agent Dashboard Widget rendered successfully');
  });

  test('Q2: Agent Performance Stats Widget', async () => {
    console.log('🎯 Testing Q2: "Show me my performance stats"');

    await sendQuery(page, 'Show me my performance stats');

    // Wait for widget
    await assertWidgetVisible(page, 'agent-performance-stats');

    // Validate content
    await assertWidgetContainsText(page, 'agent-performance-stats', 'Your Performance');

    console.log('✅ Q2 PASS: Agent Performance Stats Widget rendered successfully');
  });

  test('Q3: Ticket List Widget', async () => {
    console.log('🎯 Testing Q3: "Show me my tickets"');

    await sendQuery(page, 'Show me my tickets');

    // Wait for widget
    await assertWidgetVisible(page, 'ticket-list');

    // Validate content
    await assertWidgetContainsText(page, 'ticket-list', 'My Tickets');

    console.log('✅ Q3 PASS: Ticket List Widget rendered successfully');
  });

  test('Q4: Ticket Detail Widget', async () => {
    console.log('🎯 Testing Q4: "show me ticket TICK-001"');

    await sendQuery(page, 'show me ticket TICK-001');

    // Wait for widget
    await assertWidgetVisible(page, 'ticket-detail');

    // Validate ticket ID
    await assertWidgetContainsText(page, 'ticket-detail', 'TICK-001');

    console.log('✅ Q4 PASS: Ticket Detail Widget rendered successfully');
  });

  test('Q5: Similar Tickets Analysis Widget', async () => {
    console.log('🎯 Testing Q5: "Find similar tickets I\'ve resolved"');

    await sendQuery(page, "Find similar tickets I've resolved");

    // Wait for widget
    await assertWidgetVisible(page, 'similar-tickets-analysis');

    // Validate content
    await assertWidgetContainsText(page, 'similar-tickets-analysis', 'Your Resolution Patterns');

    console.log('✅ Q5 PASS: Similar Tickets Analysis Widget rendered successfully');
  });

  test('Q6: Knowledge Base Search Widget', async () => {
    console.log('🎯 Testing Q6: "How do I troubleshoot authentication issues?"');

    await sendQuery(page, 'How do I troubleshoot authentication issues?');

    // Wait for widget
    await assertWidgetVisible(page, 'knowledge-base-search');

    // Validate content
    await assertWidgetContainsText(page, 'knowledge-base-search', 'Knowledge Base');

    console.log('✅ Q6 PASS: Knowledge Base Search Widget rendered successfully');
  });

  test('Q7: Knowledge Article Widget with Dynamic ID', async () => {
    console.log('🎯 Testing Q7: "Open KB-107" (dynamic ID extraction)');

    await sendQuery(page, 'Open KB-107');

    // Wait for widget
    await assertWidgetVisible(page, 'knowledge-article');

    // Validate KB ID was extracted correctly (should show KB-107, not KB-892)
    await assertWidgetContainsText(page, 'knowledge-article', 'KB-107');

    console.log('✅ Q7 PASS: Knowledge Article Widget with dynamic ID rendered successfully');
  });

  test('Q8: Response Composer Widget + Send Response Action', async () => {
    console.log('🎯 Testing Q8: "Draft a response for this angry customer → send the response"');

    // Step 1: Draft response
    await sendQuery(page, 'Draft a response for this angry customer');

    // Wait for widget
    await assertWidgetVisible(page, 'response-composer');

    // Validate content
    await assertWidgetContainsText(page, 'response-composer', 'Response Composer');

    console.log('  ✓ Response Composer Widget rendered');

    // Step 2: Click "Send Response" button
    await clickWidgetButton(page, 'response-composer', 'Send Response');

    // Validate AI confirmation
    await assertAIResponseContains(page, 'Response sent successfully');

    console.log('✅ Q8 PASS: Response drafted and sent successfully');
  });

  test('Q9: Call Prep Notes Widget', async () => {
    console.log('🎯 Testing Q9: "Help me prepare for the call with Acme Corp"');

    await sendQuery(page, 'Help me prepare for the call with Acme Corp');

    // Wait for widget
    await assertWidgetVisible(page, 'call-prep-notes');

    // Validate content
    await assertWidgetContainsText(page, 'call-prep-notes', 'Call Preparation');

    console.log('✅ Q9 PASS: Call Prep Notes Widget rendered successfully');
  });

  test('Validate No Console Errors', async () => {
    const errors = consoleMessages.filter(
      (msg) => msg.includes('error') && !msg.includes('404')
    );

    if (errors.length > 0) {
      console.error('❌ Console Errors Found:', errors);
    }

    expect(errors).toHaveLength(0);
    console.log('✅ No console errors detected');
  });
});

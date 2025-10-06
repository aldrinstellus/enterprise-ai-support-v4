import { test, expect, Page } from '@playwright/test';
import { navigateToPersona, clearBrowserState } from '../helpers/persona-helper';
import {
  waitForWidget,
  assertWidgetVisible,
  assertWidgetContainsText,
  assertAIResponseContains,
  getWidget,
} from '../helpers/widget-assertions';
import { sendQuery, executeConversationFlow, clickWidgetButton } from '../helpers/multi-step-helper';

/**
 * CS Manager Persona E2E Tests
 *
 * Tests 6 queries in exact user-specified sequence:
 * - 3 single-step queries
 * - 1 multi-step conversation (3 steps)
 * - 1 single query + 1 action widget query with button click
 * Total: 6 test cases
 */
test.describe('CS Manager Persona Tests', () => {
  let page: Page;
  const consoleMessages: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Capture console messages
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Navigate to CS Manager persona demo page
    await navigateToPersona(page, 'cs-manager');
    await clearBrowserState(page);
    await navigateToPersona(page, 'cs-manager');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Q1: Team Workload Dashboard Widget', async () => {
    console.log('🎯 Testing Q1: "Show me my team\'s status"');

    await sendQuery(page, "Show me my team's status");

    // Wait for widget
    await assertWidgetVisible(page, 'team-workload-dashboard');

    // Validate content
    await assertWidgetContainsText(page, 'team-workload-dashboard', 'Team Workload');

    console.log('✅ Q1 PASS: Team Workload Dashboard Widget rendered successfully');
  });

  test('Q2: Agent Performance Comparison Widget', async () => {
    console.log('🎯 Testing Q2: "Who are the top and bottom performers?"');

    await sendQuery(page, 'Who are the top and bottom performers?');

    // Wait for widget
    await assertWidgetVisible(page, 'agent-performance-comparison');

    // Validate content
    await assertWidgetContainsText(page, 'agent-performance-comparison', 'Agent Performance');

    console.log('✅ Q2 PASS: Agent Performance Comparison Widget rendered successfully');
  });

  test('Q3: Ticket List Widget with Personalized Title', async () => {
    console.log('🎯 Testing Q3: "Show me Sarah\'s tickets"');

    await sendQuery(page, "Show me Sarah's tickets");

    // Wait for widget
    await assertWidgetVisible(page, 'ticket-list');

    // Validate personalized title
    await assertWidgetContainsText(page, 'ticket-list', "Sarah's Tickets");

    console.log('✅ Q3 PASS: Ticket List Widget with personalized title rendered successfully');
  });

  test('Q4: Multi-Step - Schedule 1-on-1 with Marcus (3 steps)', async () => {
    console.log('🎯 Testing Q4: Multi-Step: "Schedule a 1-on-1 coaching session with Marcus → book tomorrow at 1pm"');

    const conversationSteps = [
      {
        userQuery: 'Schedule a 1-on-1 coaching session with Marcus',
        expectedResponse: 'Would you like me to check',
        waitForResponse: true,
      },
      {
        userQuery: 'yes',
        expectedWidget: 'meeting-scheduler' as const,
        waitForResponse: true,
      },
      {
        userQuery: 'book tomorrow at 1pm',
        expectedWidget: 'meeting-confirmation' as const,
        waitForResponse: true,
      },
    ];

    const results = await executeConversationFlow(page, conversationSteps);

    // Validate all steps passed
    expect(results.every(r => r.passed)).toBe(true);

    // Validate attendee personalization (Marcus should be in meeting confirmation)
    await assertWidgetContainsText(page, 'meeting-confirmation', 'Marcus');

    console.log('✅ Q4 PASS: Multi-Step 1-on-1 Scheduling completed successfully');
  });

  test('Q5: Customer Risk List Widget', async () => {
    console.log('🎯 Testing Q5: "Show me all high-risk customers"');

    await sendQuery(page, 'Show me all high-risk customers');

    // Wait for widget
    await assertWidgetVisible(page, 'customer-risk-list');

    // Validate content
    await assertWidgetContainsText(page, 'customer-risk-list', 'High-Risk Customers');

    console.log('✅ Q5 PASS: Customer Risk List Widget rendered successfully');
  });

  test('Q6: Message Composer Widget + Send Message Action', async () => {
    console.log('🎯 Testing Q6: "Draft a message to Acme Corp about the outage → send the message"');

    // Step 1: Draft message
    await sendQuery(page, 'Draft a message to Acme Corp about the outage');

    // Wait for widget
    await assertWidgetVisible(page, 'message-composer');

    // Validate content
    await assertWidgetContainsText(page, 'message-composer', 'Compose Message');

    console.log('  ✓ Message Composer Widget rendered');

    // Step 2: Click "Send Message" button
    await clickWidgetButton(page, 'message-composer', 'Send Message');

    // Validate AI confirmation response
    await assertAIResponseContains(page, 'Message sent');

    console.log('✅ Q6 PASS: Message drafted and sent successfully');
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

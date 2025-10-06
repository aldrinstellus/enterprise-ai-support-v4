import { test, expect, Page } from '@playwright/test';
import { navigateToPersona, clearBrowserState } from '../helpers/persona-helper';
import {
  waitForWidget,
  assertWidgetVisible,
  assertWidgetContainsText,
  assertAIResponseContains,
} from '../helpers/widget-assertions';
import { sendQuery, executeConversationFlow } from '../helpers/multi-step-helper';

/**
 * C-Level Executive Persona E2E Tests
 *
 * Tests 8 queries in exact user-specified sequence:
 * - 7 single-step queries
 * - 1 multi-step conversation (3 steps)
 * Total: 8 test cases
 */
test.describe('C-Level Executive Persona Tests', () => {
  let page: Page;
  const consoleMessages: string[] = [];

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();

    // Capture console messages for error detection
    page.on('console', (msg) => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Navigate to C-Level persona demo page
    await navigateToPersona(page, 'c-level');
    await clearBrowserState(page);
    await navigateToPersona(page, 'c-level');
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Q1: Executive Summary Widget', async () => {
    console.log('🎯 Testing Q1: "Show me executive summary"');

    await sendQuery(page, 'Show me executive summary');

    // Wait for widget to render
    await assertWidgetVisible(page, 'executive-summary');

    // Validate widget content
    await assertWidgetContainsText(page, 'executive-summary', 'Executive Summary');
    await assertWidgetContainsText(page, 'executive-summary', 'SLA Performance');
    await assertWidgetContainsText(page, 'executive-summary', 'Customer Health');

    console.log('✅ Q1 PASS: Executive Summary Widget rendered successfully');
  });

  test('Q2: Analytics Dashboard Widget', async () => {
    console.log('🎯 Testing Q2: "Show me the detailed analytics"');

    await sendQuery(page, 'Show me the detailed analytics');

    // Wait for widget
    await assertWidgetVisible(page, 'analytics-dashboard');

    // Validate content
    await assertWidgetContainsText(page, 'analytics-dashboard', 'Analytics');

    console.log('✅ Q2 PASS: Analytics Dashboard Widget rendered successfully');
  });

  test('Q3: Performance Trends Widget', async () => {
    console.log('🎯 Testing Q3: "Show me our performance trends over the last week"');

    await sendQuery(page, 'Show me our performance trends over the last week');

    // Wait for widget
    await assertWidgetVisible(page, 'performance-trends');

    // Validate content
    await assertWidgetContainsText(page, 'performance-trends', 'Performance Trends');

    console.log('✅ Q3 PASS: Performance Trends Widget rendered successfully');
  });

  test('Q4: SLA Performance Chart Widget', async () => {
    console.log('🎯 Testing Q4: "Show me the SLA performance breakdown"');

    await sendQuery(page, 'Show me the SLA performance breakdown');

    // Wait for widget
    await assertWidgetVisible(page, 'sla-performance-chart');

    // Validate content
    await assertWidgetContainsText(page, 'sla-performance-chart', 'SLA Performance');

    console.log('✅ Q4 PASS: SLA Performance Chart Widget rendered successfully');
  });

  test('Q5: Customer Risk List Widget', async () => {
    console.log('🎯 Testing Q5: "Show me high-risk customers"');

    await sendQuery(page, 'Show me high-risk customers');

    // Wait for widget
    await assertWidgetVisible(page, 'customer-risk-list');

    // Validate content
    await assertWidgetContainsText(page, 'customer-risk-list', 'High-Risk Customers');

    console.log('✅ Q5 PASS: Customer Risk List Widget rendered successfully');
  });

  test('Q6: Customer Risk Profile Widget', async () => {
    console.log('🎯 Testing Q6: "Tell me more about Acme Corp"');

    await sendQuery(page, 'Tell me more about Acme Corp');

    // Wait for widget
    await assertWidgetVisible(page, 'customer-risk-profile');

    // Validate content
    await assertWidgetContainsText(page, 'customer-risk-profile', 'Acme Corporation');
    await assertWidgetContainsText(page, 'customer-risk-profile', 'Risk');

    console.log('✅ Q6 PASS: Customer Risk Profile Widget rendered successfully');
  });

  test('Q7: Ticket Detail Widget', async () => {
    console.log('🎯 Testing Q7: "Show me ticket TICK-001"');

    await sendQuery(page, 'Show me ticket TICK-001');

    // Wait for widget
    await assertWidgetVisible(page, 'ticket-detail');

    // Validate content
    await assertWidgetContainsText(page, 'ticket-detail', 'TICK-001');

    console.log('✅ Q7 PASS: Ticket Detail Widget rendered successfully');
  });

  test('Q8: Multi-Step - Schedule Executive Call (3 steps)', async () => {
    console.log('🎯 Testing Q8: Multi-Step Conversation: "Schedule executive call → book tomorrow at 1pm"');

    // Define 3-step conversation flow
    const conversationSteps = [
      {
        userQuery: 'Schedule executive call',
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

    // Execute multi-step flow
    const results = await executeConversationFlow(page, conversationSteps);

    // Validate all steps passed
    expect(results.every(r => r.passed)).toBe(true);
    expect(results).toHaveLength(3);

    // Additional validation: meeting-confirmation should show time
    await assertWidgetContainsText(page, 'meeting-confirmation', '1:00 PM');

    console.log('✅ Q8 PASS: Multi-Step Conversation Flow completed successfully');
  });

  test('Validate No Console Errors', async () => {
    const errors = consoleMessages.filter(
      (msg) => msg.includes('error') && !msg.includes('404') // Ignore 404s
    );

    if (errors.length > 0) {
      console.error('❌ Console Errors Found:', errors);
    }

    expect(errors).toHaveLength(0);
    console.log('✅ No console errors detected');
  });
});

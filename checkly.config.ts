import { defineConfig } from 'checkly';
import { EmailAlertChannel, Frequency } from 'checkly/constructs';

const emailAlert = new EmailAlertChannel('default-email-alert', {
  address: 'jimmyyoelrazafindretsa@gmail.com',
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
});

export default defineConfig({
  projectName: 'inventaire-monitoring',
  logicalId: 'inventaire-monitoring',
  checks: {
    playwrightConfigPath: './playwright.config.ts',
    locations: ['eu-west-1', 'us-east-1'],
    alertChannels: [emailAlert],
    playwrightChecks: [
      {
        name: 'E2E Health Checks',
        logicalId: 'e2e-health-checks',
        pwProjects: ['checkly'],
        frequency: Frequency.EVERY_10M,
      },
    ],
  },
  cli: {
    runLocation: 'us-east-1',
    retries: 0,
  },
});

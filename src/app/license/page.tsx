import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';
import { licensePageStyles } from './styles';

const LicensePage: React.FC = async () => {
  const projectLicensePath = path.join(process.cwd(), 'LICENSE');
  const projectLicenseText = await fs.readFile(projectLicensePath, 'utf-8');

  const thirdPartyLicensePath = path.join(process.cwd(), 'public', 'licenses.txt');
  const thirdPartyLicenseText = await fs.readFile(thirdPartyLicensePath, 'utf-8');

  return (
    <div style={licensePageStyles.container}>
      <h1 style={licensePageStyles.title}>Licenses</h1>
      <p>This page lists the licenses of the third-party libraries used in this project.</p>
      <div style={licensePageStyles.section}>
        <h2 style={licensePageStyles.sectionTitle}>Project License</h2>
        <pre style={licensePageStyles.pre}>
          {projectLicenseText}
        </pre>
      </div>

      <div style={licensePageStyles.section}>
        <h2 style={licensePageStyles.sectionTitle}>Third-Party Licenses</h2>
        <p style={licensePageStyles.paragraph}>The following licenses are believed to apply to the included third-party libraries. This list may not be exhaustive and is provided for informational purposes only.</p>
        <pre style={licensePageStyles.pre}>
          {thirdPartyLicenseText}
        </pre>
      </div>
    </div>
  );
};

export default LicensePage;
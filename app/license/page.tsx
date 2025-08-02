import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';

const LicensePage: React.FC = async () => {
  const projectLicensePath = path.join(process.cwd(), 'LICENSE');
  const projectLicenseText = await fs.readFile(projectLicensePath, 'utf-8');

  const thirdPartyLicensePath = path.join(process.cwd(), 'public', 'licenses.txt');
  const thirdPartyLicenseText = await fs.readFile(thirdPartyLicensePath, 'utf-8');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Licenses</h1>
      <p>This page lists the licenses of the third-party libraries used in this project.</p>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Project License</h2>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap">
          {projectLicenseText}
        </pre>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Third-Party Licenses</h2>
        <p className="mb-4">The following licenses are believed to apply to the included third-party libraries. This list may not be exhaustive and is provided for informational purposes only.</p>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap">
          {thirdPartyLicenseText}
        </pre>
      </div>
    </div>
  );
};

export default LicensePage;
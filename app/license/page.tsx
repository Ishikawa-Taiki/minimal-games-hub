import React from 'react';
import { promises as fs } from 'fs';
import path from 'path';

const LicensePage: React.FC = async () => {
  const licenseFilePath = path.join(process.cwd(), 'public', 'licenses.txt');
  const licenseText = await fs.readFile(licenseFilePath, 'utf-8');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Licenses</h1>
      <p>This page lists the licenses of the third-party libraries used in this project.</p>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Project License</h2>
        <p>This project is licensed under the MIT License.</p>
        <p>Copyright (c) 2023 Your Name</p>
        <p>Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the &quot;Software&quot;), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:</p>
        <p>The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.</p>
        <p>THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.</p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Third-Party Licenses</h2>
        <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm overflow-auto whitespace-pre-wrap">
          {licenseText}
        </pre>
      </div>
    </div>
  );
};

export default LicensePage;

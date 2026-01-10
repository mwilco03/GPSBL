/**
 * ╔═══════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                           LMS QA VALIDATION TOOLKIT v1.0                                      ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║                                                                                               ║
 * ║  PURPOSE & LEGITIMATE USE CASES                                                               ║
 * ║  ─────────────────────────────────────────────────────────────────────────────────────────    ║
 * ║  This toolkit is designed for QA engineers, LMS administrators, and course developers        ║
 * ║  to validate e-learning content during the development and testing lifecycle.                ║
 * ║                                                                                               ║
 * ║  INTENDED USERS:                                                                              ║
 * ║    • QA Engineers - Validating SCORM package compliance before deployment                    ║
 * ║    • LMS Administrators - Troubleshooting course tracking issues                             ║
 * ║    • Course Developers - Testing content structure and quiz logic                            ║
 * ║    • Instructional Designers - Verifying answer key accuracy                                 ║
 * ║    • Accessibility Testers - Extracting content for accessibility review                     ║
 * ║                                                                                               ║
 * ║  LEGITIMATE USE CASES:                                                                        ║
 * ║    1. Pre-deployment validation: Verify SCORM communications work correctly                  ║
 * ║    2. LMS integration testing: Ensure completion/score data transmits properly               ║
 * ║    3. Content audit: Extract Q&A for SME review and answer key verification                  ║
 * ║    4. Regression testing: Automated validation after course updates                          ║
 * ║    5. Troubleshooting: Diagnose why courses aren't tracking in production                    ║
 * ║    6. Migration testing: Validate courses work after LMS platform changes                    ║
 * ║    7. Accessibility compliance: Extract text content for screen reader testing               ║
 * ║                                                                                               ║
 * ║  THIS IS NOT:                                                                                 ║
 * ║    • A cheating tool - Use only in test/staging environments you control                     ║
 * ║    • For production fraud - Never use to falsify actual training records                     ║
 * ║    • Unauthorized access - Only use on systems you have permission to test                   ║
 * ║                                                                                               ║
 * ║  STANDARDS SUPPORTED:                                                                         ║
 * ║    • SCORM 1.2 (LMS* methods)                                                                ║
 * ║    • SCORM 2004 (Initialize/Terminate methods)                                               ║
 * ║    • AICC (HACP protocol detection)                                                          ║
 * ║    • xAPI / Tin Can (statement-based)                                                        ║
 * ║    • TCIP (Training and Certification Interoperability Protocol)                             ║
 * ║                                                                                               ║
 * ╠═══════════════════════════════════════════════════════════════════════════════════════════════╣
 * ║  USAGE:                                                                                       ║
 * ║    1. Open course in browser (test/staging environment)                                      ║
 * ║    2. Open DevTools (F12) → Console tab                                                      ║
 * ║    3. Paste this entire script and press Enter                                               ║
 * ║    4. Use the commands shown in the console output                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════════════════════════╝
 */

(function LMSQAValidator() {
    'use strict';

    const VERSION = '1.0.0';
    const BANNER = `
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      LMS QA VALIDATION TOOLKIT v${VERSION}                        ║
║                   For QA Testing & Validation Purposes Only                   ║
╚═══════════════════════════════════════════════════════════════════════════════╝`;

    console.log(BANNER);

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 1: SCORM/LMS API DISCOVERY
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * API Signatures for different e-learning standards
     * Used to identify which standard a discovered API implements
     */
    const API_SIGNATURES = {
        scorm12: {
            name: 'SCORM 1.2',
            required: ['LMSInitialize', 'LMSFinish', 'LMSGetValue', 'LMSSetValue', 'LMSCommit'],
            optional: ['LMSGetLastError', 'LMSGetErrorString', 'LMSGetDiagnostic']
        },
        scorm2004: {
            name: 'SCORM 2004',
            required: ['Initialize', 'Terminate', 'GetValue', 'SetValue', 'Commit'],
            optional: ['GetLastError', 'GetErrorString', 'GetDiagnostic']
        },
        aicc: {
            name: 'AICC/HACP',
            required: ['LMSInitialize', 'LMSSetValue'],
            optional: ['LMSCommit', 'LMSFinish']
        },
        xapi: {
            name: 'xAPI/Tin Can',
            required: ['sendStatement'],
            optional: ['sendStatements', 'getState', 'setState', 'getStatements']
        },
        tcip: {
            name: 'TCIP',
            required: ['TCIPInitialize', 'TCIPTerminate'],
            optional: ['TCIPGetValue', 'TCIPSetValue', 'TCIPCommit', 'sendTCIPData']
        }
    };

    /**
     * Common window property names where SCORM APIs are typically found
     */
    const COMMON_API_LOCATIONS = [
        'API', 'API_1484_11', 'SCORM_API', 'ScormApi', 'scormAPI',
        'pipwerks', 'SCORM', 'scorm', 'LMS', 'lms',
        'TCIP', 'tcip', 'TCIPApi', 'TCIP_API',
        'ADL', 'TinCan', 'xAPIWrapper', 'XAPIWrapper'
    ];

    /**
     * Discovered APIs storage
     */
    const discoveredAPIs = [];

    /**
     * Recursively search for SCORM APIs in window hierarchy
     */
    function discoverAPIs(windowObj = window, path = 'window', depth = 0, maxDepth = 5, visited = new WeakSet()) {
        if (depth > maxDepth || !windowObj || visited.has(windowObj)) return;

        try {
            visited.add(windowObj);
        } catch (e) {
            return; // Can't add to WeakSet, skip
        }

        // Check common API locations first
        for (const propName of COMMON_API_LOCATIONS) {
            try {
                const obj = windowObj[propName];
                if (obj && typeof obj === 'object') {
                    const apiType = identifyAPIType(obj);
                    if (apiType) {
                        discoveredAPIs.push({
                            path: `${path}.${propName}`,
                            type: apiType.type,
                            standard: apiType.standard,
                            confidence: apiType.confidence,
                            ref: obj
                        });
                    }
                }
            } catch (e) { /* Cross-origin or access denied */ }
        }

        // Enumerate all window properties for unknown API locations
        try {
            const props = Object.getOwnPropertyNames(windowObj);
            for (const prop of props) {
                if (COMMON_API_LOCATIONS.includes(prop)) continue; // Already checked

                try {
                    const obj = windowObj[prop];
                    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
                        const apiType = identifyAPIType(obj);
                        if (apiType && apiType.confidence > 0.5) {
                            discoveredAPIs.push({
                                path: `${path}.${prop}`,
                                type: apiType.type,
                                standard: apiType.standard,
                                confidence: apiType.confidence,
                                ref: obj
                            });
                        }
                    }
                } catch (e) { /* Property access error */ }
            }
        } catch (e) { /* Cannot enumerate */ }

        // Recurse into frames
        try {
            if (windowObj.frames && windowObj.frames.length > 0) {
                for (let i = 0; i < windowObj.frames.length; i++) {
                    try {
                        discoverAPIs(windowObj.frames[i], `${path}.frames[${i}]`, depth + 1, maxDepth, visited);
                    } catch (e) { /* Cross-origin frame */ }
                }
            }
        } catch (e) { /* Frame access error */ }

        // Check parent window
        try {
            if (windowObj.parent && windowObj.parent !== windowObj) {
                discoverAPIs(windowObj.parent, `${path}.parent`, depth + 1, maxDepth, visited);
            }
        } catch (e) { /* Cross-origin parent */ }

        // Check opener window
        try {
            if (windowObj.opener && windowObj.opener !== windowObj) {
                discoverAPIs(windowObj.opener, `${path}.opener`, depth + 1, maxDepth, visited);
            }
        } catch (e) { /* Cross-origin opener */ }

        // Check top window
        try {
            if (windowObj.top && windowObj.top !== windowObj) {
                discoverAPIs(windowObj.top, `${path}.top`, depth + 1, maxDepth, visited);
            }
        } catch (e) { /* Cross-origin top */ }
    }

    /**
     * Identify API type by checking method signatures
     */
    function identifyAPIType(obj) {
        if (!obj || typeof obj !== 'object') return null;

        let bestMatch = null;
        let bestConfidence = 0;

        for (const [type, sig] of Object.entries(API_SIGNATURES)) {
            const requiredMatches = sig.required.filter(m => typeof obj[m] === 'function').length;
            const optionalMatches = sig.optional.filter(m => typeof obj[m] === 'function').length;

            if (requiredMatches === 0) continue;

            const confidence = (requiredMatches / sig.required.length) * 0.8 +
                             (optionalMatches / sig.optional.length) * 0.2;

            if (confidence > bestConfidence) {
                bestConfidence = confidence;
                bestMatch = { type, standard: sig.name, confidence };
            }
        }

        return bestMatch;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 2: COURSE CONTENT DISCOVERY
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Patterns for identifying course content in JavaScript files
     */
    const CONTENT_PATTERNS = {
        storyline: {
            name: 'Articulate Storyline',
            dataPattern: /globalProvideData\s*\(\s*['"](?:slide|data)['"]\s*,\s*['"](.+)['"]\s*\)/,
            urlPatterns: ['/html5/data/js/', '/story_content/']
        },
        captivate: {
            name: 'Adobe Captivate',
            dataPattern: /cpAPIInterface|CPM\.|cpCmndGotoSlide/,
            urlPatterns: ['/assets/', '/ar/']
        },
        lectora: {
            name: 'Lectora',
            dataPattern: /trivantis|lectora/i,
            urlPatterns: ['/tincan/', '/content/']
        },
        rise: {
            name: 'Articulate Rise',
            dataPattern: /rise-blocks|rise-course/i,
            urlPatterns: ['/scormcontent/', '/lib/']
        },
        generic: {
            name: 'Generic Q&A',
            questionIndicators: ['question', 'prompt', 'stem', 'query', 'ask'],
            answerIndicators: ['answer', 'choice', 'option', 'response', 'distractor'],
            correctIndicators: ['correct', 'right', 'true', 'score', 'isCorrect', 'is_correct']
        }
    };

    /**
     * Discovered course resources
     */
    const discoveredResources = [];
    const extractedQA = [];

    /**
     * Discover all JavaScript resources loaded on the page
     */
    function discoverResources() {
        console.log('\n[Resource Discovery] Scanning for course files...\n');

        // Method 1: Performance API
        try {
            const resources = performance.getEntriesByType('resource');
            resources.forEach(r => {
                if (r.name.endsWith('.js') || r.name.includes('.js?')) {
                    const courseType = identifyCourseType(r.name);
                    if (courseType || r.name.includes('data') || r.name.includes('slide')) {
                        discoveredResources.push({
                            url: r.name,
                            source: 'performance',
                            courseType: courseType
                        });
                    }
                }
            });
        } catch (e) { console.warn('Performance API not available:', e.message); }

        // Method 2: DOM script elements
        document.querySelectorAll('script[src]').forEach(script => {
            const src = script.src;
            if (src && !discoveredResources.find(r => r.url === src)) {
                const courseType = identifyCourseType(src);
                if (courseType) {
                    discoveredResources.push({
                        url: src,
                        source: 'dom',
                        courseType: courseType
                    });
                }
            }
        });

        // Method 3: Check iframes
        document.querySelectorAll('iframe').forEach((iframe, i) => {
            try {
                iframe.contentDocument.querySelectorAll('script[src]').forEach(script => {
                    const src = script.src;
                    if (src && !discoveredResources.find(r => r.url === src)) {
                        const courseType = identifyCourseType(src);
                        if (courseType) {
                            discoveredResources.push({
                                url: src,
                                source: `iframe[${i}]`,
                                courseType: courseType
                            });
                        }
                    }
                });
            } catch (e) { /* Cross-origin iframe */ }
        });

        console.log(`  Found ${discoveredResources.length} potential course files`);
        return discoveredResources;
    }

    /**
     * Identify course type from URL
     */
    function identifyCourseType(url) {
        for (const [type, pattern] of Object.entries(CONTENT_PATTERNS)) {
            if (pattern.urlPatterns) {
                for (const urlPattern of pattern.urlPatterns) {
                    if (url.includes(urlPattern)) {
                        return { type, name: pattern.name };
                    }
                }
            }
        }
        return null;
    }

    /**
     * Extract Q&A from discovered resources
     */
    async function extractContent() {
        console.log('\n[Content Extraction] Analyzing course files...\n');

        // Try to find base URL
        let baseUrl = findBaseUrl();

        if (!baseUrl) {
            console.warn('  Could not auto-detect base URL');
            console.log('  Set manually: window.LMS_QA.setBaseUrl("YOUR_URL")');
        } else {
            console.log(`  Base URL: ${baseUrl}`);
        }

        // Analyze each discovered resource
        for (const resource of discoveredResources) {
            try {
                const response = await fetch(resource.url);
                if (!response.ok) continue;

                const text = await response.text();
                const qa = analyzeContent(text, resource);

                if (qa.length > 0) {
                    extractedQA.push(...qa);
                    console.log(`  ✓ ${resource.url.split('/').pop()}: ${qa.length} Q&A found`);
                }
            } catch (e) {
                // Silently skip failed fetches
            }
        }

        // Also analyze window objects for in-memory course data
        analyzeWindowObjects();

        console.log(`\n  Total Q&A extracted: ${extractedQA.length}`);
        return extractedQA;
    }

    /**
     * Find the base URL for the course
     */
    function findBaseUrl() {
        // Check performance entries
        const scripts = performance.getEntriesByType('resource').map(r => r.name);
        for (const script of scripts) {
            const match = script.match(/(.*?)\/html5\//) ||
                         script.match(/(.*?)\/story_content\//) ||
                         script.match(/(.*?)\/scormcontent\//);
            if (match) return match[1];
        }

        // Check DOM
        for (const script of document.querySelectorAll('script[src]')) {
            const match = script.src.match(/(.*?)\/html5\//) ||
                         script.src.match(/(.*?)\/story_content\//);
            if (match) return match[1];
        }

        return null;
    }

    /**
     * Analyze content for Q&A patterns
     */
    function analyzeContent(text, resource) {
        const results = [];

        // Try Storyline pattern
        const storylineMatch = text.match(CONTENT_PATTERNS.storyline.dataPattern);
        if (storylineMatch) {
            try {
                const jsonStr = storylineMatch[1]
                    .replace(/\\'/g, "'")
                    .replace(/\\\\"/g, '\\"')
                    .replace(/\\\\n/g, '\\n')
                    .replace(/\\\\t/g, '\\t');
                const data = JSON.parse(jsonStr);
                const qa = extractStorylineQA(data, resource.url);
                results.push(...qa);
            } catch (e) { /* Parse error */ }
        }

        // Try generic Q&A pattern detection
        const genericQA = extractGenericQA(text, resource.url);
        results.push(...genericQA);

        return results;
    }

    /**
     * Extract Q&A from Storyline data structure
     */
    function extractStorylineQA(obj, source, results = []) {
        if (!obj || typeof obj !== 'object') return results;

        // Extract text from textLib
        let text = '';
        if (obj.textLib?.[0]?.vartext?.blocks) {
            text = obj.textLib[0].vartext.blocks
                .flatMap(b => b.spans?.map(s => s.text) || [])
                .join('')
                .replace(/\\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }

        // Check for correct answer states
        const hasCorrectState = obj.states?.some(s =>
            s.name?.includes('_Review') ||
            s.name?.includes('_Selected_Review') ||
            s.name?.includes('Correct')
        );

        // Identify answer choices
        if ((obj.accType === 'checkbox' || obj.accType === 'radiobutton') && text && text.length > 5) {
            results.push({
                type: 'answer',
                text: text,
                correct: hasCorrectState,
                source: source,
                accType: obj.accType
            });
        }

        // Identify questions
        if (obj.accType === 'text' && text && text.length > 20) {
            if (text.includes('?') || /select|choose|which|what|how|why|when/i.test(text)) {
                results.push({
                    type: 'question',
                    text: text,
                    source: source
                });
            }
        }

        // Identify drag items (sequence questions)
        if (obj.accType?.includes('drag') && text && text.length > 2) {
            results.push({
                type: 'sequence_item',
                text: text,
                id: obj.id || obj.referenceName,
                source: source
            });
        }

        // Recurse
        for (const key in obj) {
            if (Array.isArray(obj[key])) {
                obj[key].forEach(item => extractStorylineQA(item, source, results));
            } else if (typeof obj[key] === 'object') {
                extractStorylineQA(obj[key], source, results);
            }
        }

        return results;
    }

    /**
     * Extract Q&A using generic pattern matching
     */
    function extractGenericQA(text, source) {
        const results = [];
        const patterns = CONTENT_PATTERNS.generic;

        // Look for JSON objects with Q&A-like properties
        const jsonMatches = text.matchAll(/\{[^{}]*(?:"(?:question|answer|correct|choice)[^{}]*)+[^{}]*\}/gi);

        for (const match of jsonMatches) {
            try {
                const obj = JSON.parse(match[0]);

                // Check for question indicators
                for (const indicator of patterns.questionIndicators) {
                    if (obj[indicator]) {
                        results.push({
                            type: 'question',
                            text: String(obj[indicator]),
                            source: source
                        });
                    }
                }

                // Check for answer indicators
                for (const indicator of patterns.answerIndicators) {
                    if (obj[indicator]) {
                        const isCorrect = patterns.correctIndicators.some(c => obj[c] === true);
                        results.push({
                            type: 'answer',
                            text: String(obj[indicator]),
                            correct: isCorrect,
                            source: source
                        });
                    }
                }
            } catch (e) { /* Not valid JSON */ }
        }

        return results;
    }

    /**
     * Analyze window objects for course data
     */
    function analyzeWindowObjects() {
        const courseDataProps = ['courseData', 'slideData', 'quizData', 'questionData', 'g_slides'];

        for (const prop of courseDataProps) {
            if (window[prop]) {
                const qa = extractStorylineQA(window[prop], `window.${prop}`);
                extractedQA.push(...qa);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 3: SCORM API TESTING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Test SCORM API communication
     */
    function testSCORMCommunication(api) {
        if (!api) {
            if (discoveredAPIs.length === 0) {
                console.error('No SCORM API found. Run discoverAPIs() first.');
                return null;
            }
            api = discoveredAPIs[0];
        }

        console.log(`\n[SCORM Test] Testing ${api.standard} API at ${api.path}\n`);

        const results = {
            api: api.path,
            standard: api.standard,
            tests: []
        };

        const ref = api.ref;

        // Test based on API type
        if (api.type === 'scorm12') {
            results.tests.push(testMethod(ref, 'LMSInitialize', ['']));
            results.tests.push(testMethod(ref, 'LMSGetValue', ['cmi.core.student_name']));
            results.tests.push(testMethod(ref, 'LMSGetValue', ['cmi.core.lesson_status']));
            results.tests.push(testMethod(ref, 'LMSGetValue', ['cmi.core.score.raw']));
            results.tests.push(testMethod(ref, 'LMSGetLastError', []));
        } else if (api.type === 'scorm2004') {
            results.tests.push(testMethod(ref, 'Initialize', ['']));
            results.tests.push(testMethod(ref, 'GetValue', ['cmi.learner_name']));
            results.tests.push(testMethod(ref, 'GetValue', ['cmi.completion_status']));
            results.tests.push(testMethod(ref, 'GetValue', ['cmi.success_status']));
            results.tests.push(testMethod(ref, 'GetValue', ['cmi.score.raw']));
            results.tests.push(testMethod(ref, 'GetLastError', []));
        } else if (api.type === 'tcip') {
            results.tests.push(testMethod(ref, 'TCIPInitialize', ['']));
            results.tests.push(testMethod(ref, 'TCIPGetValue', ['learner.name']));
            results.tests.push(testMethod(ref, 'TCIPGetValue', ['completion.status']));
        }

        // Display results
        console.log('  Test Results:');
        results.tests.forEach(t => {
            const status = t.success ? '✓' : '✗';
            console.log(`    ${status} ${t.method}(${t.args.join(', ')}): ${t.result}`);
        });

        return results;
    }

    /**
     * Test a single API method
     */
    function testMethod(api, method, args) {
        const result = {
            method: method,
            args: args,
            success: false,
            result: null,
            error: null
        };

        try {
            if (typeof api[method] === 'function') {
                result.result = api[method](...args);
                result.success = true;
            } else {
                result.error = 'Method not found';
            }
        } catch (e) {
            result.error = e.message;
        }

        return result;
    }

    /**
     * Set completion status (for QA testing)
     */
    function setCompletion(status = 'completed', score = 100, api = null) {
        if (!api) {
            if (discoveredAPIs.length === 0) {
                console.error('No SCORM API found. Run discoverAPIs() first.');
                return false;
            }
            api = discoveredAPIs[0];
        }

        console.log(`\n[SCORM Set] Setting completion on ${api.standard} API\n`);
        console.log(`  Status: ${status}`);
        console.log(`  Score: ${score}`);

        const ref = api.ref;
        const results = [];

        try {
            if (api.type === 'scorm12') {
                results.push(safeSet(ref, 'LMSSetValue', 'cmi.core.lesson_status', status));
                results.push(safeSet(ref, 'LMSSetValue', 'cmi.core.score.raw', String(score)));
                safeCall(ref, 'LMSCommit', '');
            } else if (api.type === 'scorm2004') {
                results.push(safeSet(ref, 'SetValue', 'cmi.completion_status', status));
                results.push(safeSet(ref, 'SetValue', 'cmi.success_status', status === 'completed' ? 'passed' : 'unknown'));
                results.push(safeSet(ref, 'SetValue', 'cmi.score.raw', String(score)));
                safeCall(ref, 'Commit', '');
            } else if (api.type === 'tcip') {
                results.push(safeSet(ref, 'TCIPSetValue', 'completion.status', status));
                results.push(safeSet(ref, 'TCIPSetValue', 'score.raw', String(score)));
                safeCall(ref, 'TCIPCommit', '');
            }

            console.log('\n  Results:');
            results.forEach(r => {
                const status = r.success ? '✓' : '✗';
                console.log(`    ${status} ${r.element}: ${r.result || r.error}`);
            });

            return true;
        } catch (e) {
            console.error('  Error:', e.message);
            return false;
        }
    }

    /**
     * Safely call a SetValue-type method
     */
    function safeSet(api, method, element, value) {
        const result = { element, success: false, result: null, error: null };
        try {
            if (typeof api[method] === 'function') {
                result.result = api[method](element, value);
                result.success = result.result === 'true' || result.result === true || result.result === '0';
            } else {
                result.error = 'Method not found';
            }
        } catch (e) {
            result.error = e.message;
        }
        return result;
    }

    /**
     * Safely call an API method
     */
    function safeCall(api, method, ...args) {
        try {
            if (typeof api[method] === 'function') {
                return api[method](...args);
            }
        } catch (e) { /* Ignore */ }
        return null;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 4: EXPORT & REPORTING
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Generate validation report
     */
    function generateReport(format = 'console') {
        const report = {
            timestamp: new Date().toISOString(),
            version: VERSION,
            apis: discoveredAPIs.map(a => ({
                path: a.path,
                standard: a.standard,
                confidence: Math.round(a.confidence * 100) + '%'
            })),
            resources: discoveredResources.length,
            qa: {
                total: extractedQA.length,
                questions: extractedQA.filter(q => q.type === 'question').length,
                answers: extractedQA.filter(q => q.type === 'answer').length,
                correct: extractedQA.filter(q => q.type === 'answer' && q.correct).length
            },
            items: extractedQA
        };

        if (format === 'json') {
            return JSON.stringify(report, null, 2);
        } else if (format === 'csv') {
            let csv = 'Type,Text,Correct,Source\n';
            extractedQA.forEach(item => {
                csv += `"${item.type}","${(item.text || '').replace(/"/g, '""')}",${item.correct || ''},${item.source}\n`;
            });
            return csv;
        } else {
            // Console format
            console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
            console.log('║                           QA VALIDATION REPORT                                ║');
            console.log('╠═══════════════════════════════════════════════════════════════════════════════╣');
            console.log(`║  Generated: ${report.timestamp}`);
            console.log('╠═══════════════════════════════════════════════════════════════════════════════╣');
            console.log('║  DISCOVERED APIs:');
            report.apis.forEach(a => {
                console.log(`║    • ${a.standard} at ${a.path} (${a.confidence} confidence)`);
            });
            console.log('╠═══════════════════════════════════════════════════════════════════════════════╣');
            console.log('║  CONTENT ANALYSIS:');
            console.log(`║    • Resources scanned: ${report.resources}`);
            console.log(`║    • Questions found: ${report.qa.questions}`);
            console.log(`║    • Answer choices found: ${report.qa.answers}`);
            console.log(`║    • Correct answers identified: ${report.qa.correct}`);
            console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');

            return report;
        }
    }

    /**
     * Download report as file
     */
    function downloadReport(format = 'json') {
        let content, filename, type;

        if (format === 'json') {
            content = generateReport('json');
            filename = 'lms-qa-report.json';
            type = 'application/json';
        } else if (format === 'csv') {
            content = generateReport('csv');
            filename = 'lms-qa-report.csv';
            type = 'text/csv';
        } else {
            content = generateReport('json');
            filename = 'lms-qa-report.txt';
            type = 'text/plain';
        }

        const blob = new Blob([content], { type });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        console.log(`✓ Downloaded ${filename}`);
    }

    /**
     * Show only correct answers
     */
    function showCorrectAnswers() {
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('                    CORRECT ANSWERS (QA Validation)');
        console.log('═══════════════════════════════════════════════════════════════\n');

        const correct = extractedQA.filter(q => q.type === 'answer' && q.correct);
        correct.forEach((a, i) => {
            console.log(`  ${i + 1}. ${a.text}`);
        });

        console.log(`\n  Total: ${correct.length} correct answers found`);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION 5: PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Run full validation suite
     */
    async function runFullValidation() {
        console.log('\n[1/4] Discovering SCORM/LMS APIs...');
        discoverAPIs();
        console.log(`      Found ${discoveredAPIs.length} API(s)`);

        console.log('\n[2/4] Discovering course resources...');
        discoverResources();

        console.log('\n[3/4] Extracting content...');
        await extractContent();

        console.log('\n[4/4] Generating report...');
        generateReport('console');

        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('                      AVAILABLE COMMANDS');
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('  LMS_QA.report()              - Show validation report');
        console.log('  LMS_QA.report("json")        - Get JSON report');
        console.log('  LMS_QA.download("json")      - Download JSON report');
        console.log('  LMS_QA.download("csv")       - Download CSV report');
        console.log('  LMS_QA.showCorrect()         - Show correct answers');
        console.log('  LMS_QA.testAPI()             - Test SCORM communication');
        console.log('  LMS_QA.setCompletion()       - Set completion status');
        console.log('  LMS_QA.apis                  - View discovered APIs');
        console.log('  LMS_QA.qa                    - View extracted Q&A');
        console.log('═══════════════════════════════════════════════════════════════\n');
    }

    // Expose public API
    window.LMS_QA = {
        version: VERSION,

        // Data
        apis: discoveredAPIs,
        resources: discoveredResources,
        qa: extractedQA,

        // Discovery
        discoverAPIs: () => { discoverAPIs(); return discoveredAPIs; },
        discoverResources: discoverResources,
        extractContent: extractContent,

        // Testing
        testAPI: testSCORMCommunication,
        setCompletion: setCompletion,

        // Reporting
        report: generateReport,
        download: downloadReport,
        showCorrect: showCorrectAnswers,

        // Utilities
        setBaseUrl: (url) => { window.manualBaseUrl = url; },
        runAll: runFullValidation
    };

    // Auto-run validation
    runFullValidation();

})();

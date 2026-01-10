/*
 * ═══════════════════════════════════════════════════════════════════════════
 * STORYLINE QUIZ EXTRACTOR v2.0 - THE GOLDEN GOOSE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Extracts all questions and answers (including correct answers) from
 * Articulate Storyline courses.
 * 
 * USAGE:
 *   1. Open the Storyline course in your browser
 *   2. Open DevTools (F12) > Console tab
 *   3. Paste this entire script and press Enter
 *   4. Wait for extraction to complete
 *   5. Use export commands:
 *      - exportQA('txt')  - Download as text file
 *      - exportQA('csv')  - Download as CSV (for Excel)
 *      - exportQA('json') - Download as JSON
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(async function StorylineGoldenGoose() {
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   STORYLINE QUIZ EXTRACTOR v2.0 - THE GOLDEN GOOSE');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 1: Find Base URL
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('[1/5] Finding course URL...');
    
    let baseUrl = null;
    
    // Method 1: From performance entries
    let scripts = performance.getEntriesByType('resource').map(r => r.name);
    let courseScript = scripts.find(s => 
        s.includes('/html5/data/js/') || 
        s.includes('/html5/lib/') || 
        s.includes('/story_content/')
    );
    
    if (courseScript) {
        baseUrl = courseScript.match(/(.*?)\/html5\//)?.[1] ||
                  courseScript.match(/(.*?)\/story_content\//)?.[1];
    }
    
    // Method 2: From DOM scripts
    if (!baseUrl) {
        document.querySelectorAll('script[src]').forEach(s => {
            if (s.src.includes('/html5/')) {
                baseUrl = s.src.match(/(.*?)\/html5\//)?.[1];
            }
        });
    }
    
    // Method 3: From iframes
    if (!baseUrl) {
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                iframe.contentDocument.querySelectorAll('script[src]').forEach(s => {
                    if (s.src.includes('/html5/')) {
                        baseUrl = s.src.match(/(.*?)\/html5\//)?.[1];
                    }
                });
            } catch(e) {}
        });
    }
    
    if (!baseUrl) {
        console.log('✗ ERROR: Could not find course URL automatically.');
        console.log('  Please set it manually and run again:');
        console.log('  window.manualBaseUrl = "YOUR_COURSE_URL";');
        return;
    }
    
    // Allow manual override
    if (window.manualBaseUrl) {
        baseUrl = window.manualBaseUrl;
    }
    
    console.log('  ✓ Base URL:', baseUrl);

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 2: Fetch and Parse data.js
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n[2/5] Fetching course data...');
    
    let courseData = null;
    
    try {
        let dataResp = await fetch(baseUrl + '/html5/data/js/data.js');
        let dataText = await dataResp.text();
        
        let dataMatch = dataText.match(/globalProvideData\s*\(\s*'data'\s*,\s*'(.+)'\s*\)/);
        if (!dataMatch) throw new Error('No globalProvideData found');
        
        // Fix escape sequences
        let dataJson = dataMatch[1]
            .replace(/\\'/g, "'")
            .replace(/\\\\"/g, '\\"')
            .replace(/\\\\n/g, '\\n')
            .replace(/\\\\t/g, '\\t')
            .replace(/\\\\r/g, '\\r');
        
        courseData = JSON.parse(dataJson);
        console.log('  ✓ Course data loaded');
        console.log('    - Version:', courseData.version);
        console.log('    - Quizzes:', courseData.quizzes?.length || 0);
        console.log('    - Scenes:', courseData.scenes?.length || 0);
        
    } catch(e) {
        console.log('  ✗ ERROR:', e.message);
        return;
    }
    
    window.courseData = courseData;

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 3: Get Quiz Slide IDs
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n[3/5] Finding quiz slides...');
    
    let slideIds = [];
    
    // From quizzes
    courseData.quizzes?.forEach(quiz => {
        quiz.sliderefs?.forEach(ref => {
            let parts = ref.id.split('.');
            slideIds.push(parts[parts.length - 1]);
        });
    });
    
    // From scenes (if no quizzes found)
    if (slideIds.length === 0) {
        courseData.scenes?.forEach(scene => {
            if (!scene.isMessageScene) {
                scene.slides?.forEach(slide => {
                    if (slide.id) slideIds.push(slide.id);
                    if (slide.html5url) {
                        let match = slide.html5url.match(/([A-Za-z0-9]{11})\.js/);
                        if (match) slideIds.push(match[1]);
                    }
                });
            }
        });
    }
    
    // Remove duplicates
    slideIds = [...new Set(slideIds)];
    
    console.log('  ✓ Found', slideIds.length, 'slides to check');
    
    window.quizSlideIds = slideIds;

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 4: Fetch Each Slide and Extract Q&A
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n[4/5] Extracting questions and answers...\n');
    
    let allQA = [];
    let errors = [];
    let processed = 0;
    
    for (let i = 0; i < slideIds.length; i++) {
        let slideId = slideIds[i];
        processed++;
        
        try {
            let url = `${baseUrl}/html5/data/js/${slideId}.js`;
            let resp = await fetch(url);
            
            if (!resp.ok) {
                errors.push({ slideId, error: `HTTP ${resp.status}` });
                continue;
            }
            
            let text = await resp.text();
            
            // Extract JSON from globalProvideData
            let match = text.match(/globalProvideData\s*\(\s*'slide'\s*,\s*'(.+)'\s*\)/);
            if (!match) {
                continue; // Not a slide file
            }
            
            // Fix escape sequences
            let jsonStr = match[1]
                .replace(/\\'/g, "'")
                .replace(/\\\\"/g, '\\"')
                .replace(/\\\\n/g, '\\n')
                .replace(/\\\\t/g, '\\t')
                .replace(/\\\\r/g, '\\r');
            
            let slideData;
            try {
                slideData = JSON.parse(jsonStr);
            } catch(e) {
                errors.push({ slideId, error: 'JSON parse error' });
                continue;
            }
            
            // Extract Q&A from slide
            let qa = extractQA(slideData, slideId);
            
            // Extract sequence/ordering questions
            let seq = extractSequence(slideData, slideId);
            
            if (qa.answers.length > 0) {
                qa.type = 'choice';
                allQA.push(qa);
                let correctCount = qa.answers.filter(a => a.correct).length;
                console.log(`  ✓ [${processed}/${slideIds.length}] ${slideId}: ${qa.answers.length} answers (${correctCount} correct)`);
            }
            
            if (seq && seq.items.length > 0) {
                seq.type = 'sequence';
                allQA.push(seq);
                console.log(`  ✓ [${processed}/${slideIds.length}] ${slideId}: SEQUENCE with ${seq.items.length} items`);
            }
            
        } catch(e) {
            errors.push({ slideId, error: e.message });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STEP 5: Output Results
    // ═══════════════════════════════════════════════════════════════════════
    
    console.log('\n[5/5] Results\n');
    console.log('═══════════════════════════════════════════════════════════════');
    
    let totalAnswers = allQA.reduce((sum, q) => sum + (q.answers?.length || q.items?.length || 0), 0);
    let totalCorrect = allQA.reduce((sum, q) => sum + (q.answers?.filter(a => a.correct).length || 0), 0);
    
    console.log(`  Questions found:    ${allQA.length}`);
    console.log(`  Total answers:      ${totalAnswers}`);
    console.log(`  Correct answers:    ${totalCorrect}`);
    if (errors.length > 0) {
        console.log(`  Errors:             ${errors.length}`);
    }
    console.log('═══════════════════════════════════════════════════════════════');
    
    // Display all Q&A
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                    QUESTIONS & ANSWERS');
    console.log('═══════════════════════════════════════════════════════════════\n');
    
    allQA.forEach((qa, i) => {
        console.log(`\n┌─── Question ${i + 1} [${qa.slideId}] ${qa.type === 'sequence' ? '(SEQUENCE)' : ''} ───`);
        
        if (qa.type === 'sequence') {
            if (qa.question) console.log(`│ Q: ${qa.question}`);
            console.log('│ ITEMS (find correct order):');
            qa.items.forEach((item, j) => {
                console.log(`│   ${j + 1}. ${item.text}`);
            });
            if (qa.correctOrder) {
                console.log('│ CORRECT ORDER:', qa.correctOrder.join(' → '));
            }
        } else {
            if (qa.question) console.log(`│ Q: ${qa.question}`);
            console.log('│');
            qa.answers.forEach((a, j) => {
                console.log(`│   ${j + 1}. ${a.correct ? '✓ CORRECT' : '✗'} ${a.text}`);
            });
        }
        
        console.log('└' + '─'.repeat(60));
    });
    
    // Save to window
    window.allQA = allQA;
    window.extractionErrors = errors;
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                         SAVED DATA');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  window.allQA        - All questions and answers');
    console.log('  window.courseData   - Full course metadata');
    console.log('  window.quizSlideIds - List of slide IDs');
    console.log('═══════════════════════════════════════════════════════════════');
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                       EXPORT COMMANDS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log("  exportQA('txt')   - Download as text file");
    console.log("  exportQA('csv')   - Download as CSV (Excel)");
    console.log("  exportQA('json')  - Download as JSON");
    console.log("  showCorrect()     - Show only correct answers");
    console.log("  copyToClipboard() - Copy to clipboard");
    console.log('═══════════════════════════════════════════════════════════════\n');

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    window.exportQA = function(format = 'txt') {
        let qa = window.allQA;
        let output = '';
        let filename = 'answer_key';
        let type = 'text/plain';
        
        if (format === 'csv') {
            output = 'Question Number,Slide ID,Type,Question,Answer,Correct\n';
            qa.forEach((q, i) => {
                let question = (q.question || '').replace(/"/g, '""');
                
                if (q.type === 'sequence') {
                    q.items?.forEach((item, j) => {
                        output += `${i+1},"${q.slideId}","sequence","${question}","${item.text.replace(/"/g, '""')}","ORDER: ${j+1}"\n`;
                    });
                } else {
                    q.answers?.forEach(a => {
                        output += `${i+1},"${q.slideId}","choice","${question}","${a.text.replace(/"/g, '""')}",${a.correct ? 'YES' : 'NO'}\n`;
                    });
                }
            });
            filename = 'answer_key.csv';
            type = 'text/csv';
            
        } else if (format === 'json') {
            output = JSON.stringify(qa, null, 2);
            filename = 'answer_key.json';
            type = 'application/json';
            
        } else {
            // Text format
            output = '═══════════════════════════════════════════════════════════════\n';
            output += '                      ANSWER KEY\n';
            output += '═══════════════════════════════════════════════════════════════\n';
            output += `Generated: ${new Date().toLocaleString()}\n`;
            output += `Total Questions: ${qa.length}\n`;
            output += '═══════════════════════════════════════════════════════════════\n\n';
            
            qa.forEach((q, i) => {
                output += `\n┌─── Question ${i + 1} [${q.slideId}] ${q.type === 'sequence' ? '(SEQUENCE)' : ''} ───\n`;
                
                if (q.type === 'sequence') {
                    if (q.question) output += `│ Q: ${q.question}\n`;
                    output += '│ ITEMS:\n';
                    q.items?.forEach((item, j) => {
                        output += `│   ${j + 1}. ${item.text}\n`;
                    });
                } else {
                    if (q.question) output += `│ Q: ${q.question}\n`;
                    output += '│\n';
                    q.answers?.forEach((a, j) => {
                        output += `│   ${j + 1}. ${a.correct ? '✓ CORRECT' : '✗'} ${a.text}\n`;
                    });
                }
                output += '└' + '─'.repeat(60) + '\n';
            });
            
            // Quick reference section
            output += '\n\n═══════════════════════════════════════════════════════════════\n';
            output += '              QUICK REFERENCE - CORRECT ANSWERS ONLY\n';
            output += '═══════════════════════════════════════════════════════════════\n\n';
            
            qa.forEach((q, i) => {
                if (q.type === 'sequence') {
                    output += `Q${i+1} [SEQUENCE]: ${q.items?.map(item => item.text).join(' → ')}\n`;
                } else {
                    let correct = q.answers?.filter(a => a.correct) || [];
                    if (correct.length > 0) {
                        output += `Q${i+1}: ${correct.map(a => a.text).join(' | ')}\n`;
                    }
                }
            });
            
            filename = 'answer_key.txt';
        }
        
        // Download file
        let blob = new Blob([output], { type });
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        console.log(`✓ Downloaded ${filename}`);
    };
    
    window.showCorrect = function() {
        let qa = window.allQA;
        
        console.log('\n═══════════════════════════════════════════════════════════════');
        console.log('                   CORRECT ANSWERS ONLY');
        console.log('═══════════════════════════════════════════════════════════════\n');
        
        qa.forEach((q, i) => {
            if (q.type === 'sequence') {
                console.log(`Q${i+1} [SEQUENCE]: ${q.items?.map(item => item.text).join(' → ')}`);
            } else {
                let correct = q.answers?.filter(a => a.correct) || [];
                if (correct.length > 0) {
                    console.log(`Q${i+1}: ${correct.map(a => a.text).join(' | ')}`);
                }
            }
        });
    };
    
    window.copyToClipboard = function() {
        let qa = window.allQA;
        let output = 'CORRECT ANSWERS\n\n';
        
        qa.forEach((q, i) => {
            if (q.type === 'sequence') {
                output += `Q${i+1} [SEQUENCE]: ${q.items?.map(item => item.text).join(' → ')}\n`;
            } else {
                let correct = q.answers?.filter(a => a.correct) || [];
                if (correct.length > 0) {
                    output += `Q${i+1}: ${correct.map(a => a.text).join(' | ')}\n`;
                }
            }
        });
        
        navigator.clipboard.writeText(output).then(() => {
            console.log('✓ Copied to clipboard!');
        });
    };

    // ═══════════════════════════════════════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════
    
    function extractQA(obj, slideId) {
        let result = { slideId, question: '', answers: [] };
        
        function search(obj) {
            if (!obj || typeof obj !== 'object') return;
            
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
            
            // Check for correct answer (has Review state)
            let hasReview = obj.states?.some(s => 
                s.name?.includes('_Review') || 
                s.name?.includes('_Selected_Review')
            ) && !obj.states?.every(s => s.name?.includes('Incorrect'));
            
            // Checkbox or radiobutton = answer choice
            if ((obj.accType === 'checkbox' || obj.accType === 'radiobutton') && text) {
                if (text.length > 5 && !text.match(/^[Q\d\s:\/]+$/)) {
                    result.answers.push({ text, correct: hasReview });
                }
            }
            
            // Text with question mark or "select" = question
            if (obj.accType === 'text' && text && text.length > 20) {
                if (text.includes('?') || text.toLowerCase().includes('select')) {
                    if (!result.question || text.length > result.question.length) {
                        result.question = text;
                    }
                }
            }
            
            // Recurse through object
            for (let key in obj) {
                if (Array.isArray(obj[key])) {
                    obj[key].forEach(item => search(item));
                } else if (typeof obj[key] === 'object') {
                    search(obj[key]);
                }
            }
        }
        
        search(obj);
        return result;
    }
    
    function extractSequence(obj, slideId) {
        let result = { slideId, question: '', items: [], correctOrder: null };
        
        function search(obj) {
            if (!obj || typeof obj !== 'object') return;
            
            // Look for drag items
            if (obj.accType && obj.accType.includes('drag')) {
                let text = obj.textLib?.[0]?.vartext?.blocks
                    ?.flatMap(b => b.spans?.map(s => s.text) || [])
                    .join('')
                    .replace(/\\n/g, ' ')
                    .trim() || '';
                
                if (text && text.length > 2) {
                    result.items.push({
                        text: text,
                        id: obj.id || obj.referenceName,
                        correctPosition: obj.dropTargetId || obj.correctTarget || null
                    });
                }
            }
            
            // Look for correct order definitions
            if (obj.correctOrder) result.correctOrder = obj.correctOrder;
            if (obj.correctSequence) result.correctOrder = obj.correctSequence;
            if (obj.correct_responses) result.correctOrder = obj.correct_responses;
            
            // Recurse
            for (let key in obj) {
                if (Array.isArray(obj[key])) {
                    obj[key].forEach(item => search(item));
                } else if (typeof obj[key] === 'object') {
                    search(obj[key]);
                }
            }
        }
        
        search(obj);
        return result.items.length > 0 ? result : null;
    }
    
})();

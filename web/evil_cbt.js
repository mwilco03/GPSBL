/**
 * evil_cbt.js - SCORM LMS Completion Override
 *
 * DESCRIPTION:
 *   Manipulates SCORM (Sharable Content Object Reference Model) API to mark
 *   e-learning courses as completed with a perfect score. Works with both
 *   SCORM 1.2 and SCORM 2004 standards.
 *
 * HOW IT WORKS:
 *   1. Detects the SCORM API object in the browser window
 *   2. Sets completion status to "completed"
 *   3. Sets success status to "passed"
 *   4. Sets score to 100%
 *   5. Commits changes and finishes the session
 *
 * USAGE:
 *   Paste into browser console while on a SCORM-based e-learning page
 *
 * SUPPORTED LMS:
 *   Any LMS using standard SCORM 1.2 or 2004 API
 *
 * WARNING:
 *   This script is for educational/testing purposes only.
 *   Using this to fraudulently complete training may violate policies.
 */

(function() {
    // Generic error handler to ignore errors
    function safeExecute(fn) {
        try {
            fn();
        } catch (e) {
            console.warn("SCORM API Error: ", e);
        }
    }

    // SCORM API Object Detection
    __API__ = window.API || window.API_1484_11 || window.SCORM_GetAPI() || window.SCORM2004_GetAPI() || null;

    if (!__API__) {
        console.error("SCORM API not found. Cannot execute script.");
        return;
    }

    // Setting completion and success statuses for cmi
    const statuses = ["completed", "incomplete", "not attempted", "failed", "passed"];
    const score = 100; // Fixed score

    // Function to iterate and set all combinations
    function setAllCombinations() {
        statuses.forEach(completionStatus => {
            statuses.forEach(successStatus => {
                safeExecute(() => {
                    // SCORM 1.2 and SCORM 2004 core calls
                    if (__API__.LMSSetValue) {
                        __API__.LMSSetValue("cmi.core.score.raw", score.toString());
                        __API__.LMSSetValue("cmi.core.lesson_status", completionStatus);
                    }

                    if (__API__.SetValue) {
                        __API__.SetValue("cmi.score.raw", score.toString());
                        __API__.SetValue("cmi.completion_status", completionStatus);
                        __API__.SetValue("cmi.success_status", successStatus);
                    }

                    // Specific SCORM 2004 calls
                    if (__API__.SetValue) {
                        __API__.SetValue("cmi.core.score.raw", score.toString());
                        __API__.SetValue("cmi.core.lesson_status", completionStatus);
                        __API__.SetValue("cmi.success_status", successStatus);
                    }

                    // Interactions
                    if (__API__.SetValue) {
                        __API__.SetValue("cmi.interactions._count", "1");
                        __API__.SetValue("cmi.interactions.0.id", "interaction1");
                        __API__.SetValue("cmi.interactions.0.type", "choice");
                        __API__.SetValue("cmi.interactions.0.result", "correct");
                    }

                    // Objectives
                    if (__API__.SetValue) {
                        __API__.SetValue("cmi.objectives._count", "1");
                        __API__.SetValue("cmi.objectives.0.id", "objective1");
                        __API__.SetValue("cmi.objectives.0.score.raw", score.toString());
                        __API__.SetValue("cmi.objectives.0.success_status", successStatus);
                    }

                    // Finalize Data
                    if (__API__.LMSCommit) {
                        __API__.LMSCommit("");
                    }
                    if (__API__.Commit) {
                        __API__.Commit("");
                    }

                    // Finish session
                    if (__API__.LMSFinish) {
                        __API__.LMSFinish("");
                    }
                    if (__API__.Finish) {
                        __API__.Finish("");
                    }
                });
            });
        });
    }

    // Start the process
    setAllCombinations();

    console.log("SCORM script executed successfully. All combinations of completion, success, and scores have been set.");
})();


/*


SCORM_SetPassed()
SCORM_SetCompleted()
API.LMSSetValue("cmi.core.lesson_status","completed")
LMSSetValue("cmi.core.lesson_status","completed")
SCORM_CallLMSSetValue("cmi.core.lesson_status","completed")
LMSCommit("")
API.LMSCommit("")
SCORM_CallLMSCommit("")
LMSFinish("")
API.LMSFinish("")
SCORM_CallLMSFinish("")

*/

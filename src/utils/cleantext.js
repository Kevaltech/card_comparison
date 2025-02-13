/**
 * Comprehensive text cleanup utility
 * @param {string} text - Input text to clean
 * @param {Object} options - Cleanup options
 * @param {boolean} options.trimLines - Trim whitespace from each line (default: true)
 * @param {boolean} options.singleSpaces - Convert multiple spaces to single space (default: true)
 * @param {boolean} options.singleNewlines - Convert multiple newlines to single newline (default: false)
 * @param {boolean} options.noEmptyLines - Remove empty lines completely (default: false)
 * @returns {string} Cleaned text
 */
const cleanupText = (text, options = {}) => {
  const defaultOptions = {
    trimLines: true,
    singleSpaces: true,
    singleNewlines: false,
    noEmptyLines: false,
  };

  const settings = { ...defaultOptions, ...options };

  if (!text) return "";

  let result = text;

  // Convert all whitespace characters (tabs, etc) to spaces
  result = result.replace(
    /[\t\f\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]/g,
    " "
  );

  // Split into lines for per-line processing
  let lines = result.split(/\r?\n/);

  // Process each line
  lines = lines.map((line) => {
    let processedLine = line;

    // Convert multiple spaces to single space
    if (settings.singleSpaces) {
      processedLine = processedLine.replace(/[ ]+/g, " ");
    }

    // Trim whitespace from line ends
    if (settings.trimLines) {
      processedLine = processedLine.trim();
    }

    return processedLine;
  });

  // Remove empty lines if specified
  if (settings.noEmptyLines) {
    lines = lines.filter((line) => line.length > 0);
  }

  // Join lines back together
  result = lines.join("\n");

  // Convert multiple newlines to single newline if specified
  if (settings.singleNewlines) {
    result = result.replace(/\n+/g, "\n");
  }

  return result;
};

// Helper function to clean up specific types of content
const cleanupMethods = {
  // For general text content
  general: (text) =>
    cleanupText(text, {
      trimLines: true,
      singleSpaces: true,
      singleNewlines: false,
      noEmptyLines: false,
    }),

  // For code snippets (preserves indentation)
  code: (text) =>
    cleanupText(text, {
      trimLines: false,
      singleSpaces: true,
      singleNewlines: true,
      noEmptyLines: false,
    }),

  // For compact single-line content
  compact: (text) =>
    cleanupText(text, {
      trimLines: true,
      singleSpaces: true,
      singleNewlines: true,
      noEmptyLines: true,
    }).replace(/\n/g, " "),

  // For markdown content
  markdown: (text) =>
    cleanupText(text, {
      trimLines: true,
      singleSpaces: true,
      singleNewlines: false,
      noEmptyLines: false,
    }),
};

// Example usage and tests
const runTests = () => {
  const testCases = [
    {
      input: "  Hello    world  \n\n  Test   line  \n\n",
      expected: "Hello world\n\nTest line",
      method: "general",
    },
    {
      input: "function()   {\n   console.log('test');\n\n\n}",
      expected: "function() {\n   console.log('test');\n\n}",
      method: "code",
    },
    {
      input: "Title   here\n  Second   line  \n\n  Third   line",
      expected: "Title here Second line Third line",
      method: "compact",
    },
  ];

  testCases.forEach((testCase, index) => {
    const result = cleanupMethods[testCase.method](testCase.input);
    console.log(`Test ${index + 1}:`);
    console.log("Input:", JSON.stringify(testCase.input));
    console.log("Output:", JSON.stringify(result));
    console.log("Expected:", JSON.stringify(testCase.expected));
    console.log("Passed:", result === testCase.expected);
    console.log("---");
  });
};

export { cleanupText, cleanupMethods };

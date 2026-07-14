export const ProperCaseFunc = (str) => {
  // Split the string into an array of words
  const words = str.split(' ');
  // List of function words (prepositions, conjunctions, articles)
  const functionWords = [
    'in',
    'on',
    'at',
    'under',
    'over',
    'above',
    'below',
    'beside',
    'between',
    'among',
    'and',
    'but',
    'or',
    'nor',
    'for',
    'so',
    'yet',
    'the',
    'a',
    'an',
    'across',
    'against',
    'along',
    'around',
    'before',
    'behind',
    'beneath',
    'by',
    'down',
    'from',
    'into',
    'near',
    'of',
    'off',
    'to',
    'toward',
    'upon',
    'with',
    'within',
  ];

  // Capitalize the first letter of each word while skipping function words
  const capitalizedWords = words.map((word, index) => {
    // Convert the word to lowercase for comparison with function words
    const lowercaseWord = word.toLowerCase();

    // Check if the word is a function word, and it's not the first word or already capitalized
    if (word === lowercaseWord) {
      if (
        functionWords.includes(lowercaseWord) &&
        index !== 0 &&
        word !== word.toUpperCase()
      ) {
        return word; // Return the word as it is (not capitalized)
      } else {
        // Capitalize the first letter and make the rest of the word lowercase
        return word.toUpperCase() 
      }
    } else {
      return word;
    }
  });

  // Join the capitalized words back into a string
  return capitalizedWords.join(' ');
};

// export const ProperCaseFunc = (str) => {
//     // Split the string into an array of words
//     const words = str.split(' ');

//     // List of words to be excluded from capitalization
//     const exceptions = [
//       'in',
//       'on',
//       'at',
//       'under',
//       'over',
//       'above',
//       'below',
//       'beside',
//       'between',
//       'among',
//       'and',
//       'but',
//       'or',
//       'nor',
//       'for',
//       'so',
//       'yet',
//       'the',
//       'a',
//       'an',
//       'across',
//       'against',
//       'along',
//       'around',
//       'before',
//       'behind',
//       'beneath',
//       'by',
//       'down',
//       'from',
//       'into',
//       'near',
//       'of',
//       'off',
//       'to',
//       'toward',
//       'upon',
//       'with',
//       'within',
//     ];

//     // Capitalize the first word
//     words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();

//     // Capitalize the rest of the words while skipping exceptions
//     for (let i = 1; i < words.length; i++) {
//       const word = words[i].toLowerCase();
//       if (!exceptions.includes(word)) {
//         words[i] =
//           words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
//       }
//     }

//     // Join the capitalized words back into a string
//     return words.join(' ');
//   };

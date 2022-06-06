const By = {
  charCode: {
    ascending(a, b) {
      return a.charCodeAt(0) - b.charCodeAt(0);
    },
    descending(a, b) {
      return b.charCodeAt(0) - a.charCodeAt(0);
    },
  },
};

class DiscordEncoder {
  static nonSpecialCharacters = [
    ...charsBetween('a', 'z'),
    ...charsBetween('A', 'Z'),
    ...charsBetween('0', '9'),
    ...`!%^&()-=+[]{};'",.<>/?|`.split(""),
  ]

  static encode(string) {
    const included = new Set();
    const charSet = [];

    let index = 0;

    const chars = string.split("");
    for (const char of chars) {
      if (included.has(char)) continue;
      
      included.add(char);
      charSet.push(char);
    }

    charSet.sort(By.charCode.ascending);

    const bigInt = encodeToBigInt(chars, charSet);

    const decoded = decodeFromBigInt(bigInt, charSet);

    const encoded = decodeFromBigInt(bigInt, DiscordEncoder.nonSpecialCharacters);


    const charSetBigInt = encodeCharSetToBigInt(charSet);
    
    const charSetEncoded = decodeFromBigInt(charSetBigInt, DiscordEncoder.nonSpecialCharacters);

    return `${charSetEncoded}:${encoded}`;
  }

  static decode(message) {
    let [charSetEncoded, encodedMessage] = message.split(':');
    const charSetBigInt = encodeToBigInt(charSetEncoded, DiscordEncoder.nonSpecialCharacters);
    const charSet = decodeCharSetFromBigInt(charSetBigInt)
    
    const chars = encodedMessage.split('');

    const encodedBigInt = encodeToBigInt(chars, DiscordEncoder.nonSpecialCharacters);

    const decodedMessage = decodeFromBigInt(encodedBigInt, charSet);

    return decodedMessage;
  }

  static test(input) {
    console.log('Testing DiscordEncoder against test input.');
    
    const expected = input;
    const encoded = DiscordEncoder.encode(input);
    console.log(`Encoded ${input.length}-character input to ${encoded.length}-character output.`);

    const actual = DiscordEncoder.decode(encoded);

    const match = (expected === actual);
    console.log(`Encode-Decode returns original input? ${match}`);

    if (!match) {
      console.warn('Expected:');
      console.warn(expected);
      console.warn('Actual:');
      console.warn(actual);
    }
  }
}

function encodeCharSetToBigInt(charSet) {
  const includedChars = initArray(256, '0');

  for (const char of charSet) {
    const code = char.charCodeAt(0);
    includedChars[code] = '1';
  }

  return encodeToBigInt(includedChars, ['0', '1']);
}

function decodeCharSetFromBigInt(bigInt) {
  const binary = decodeFromBigInt(bigInt, ['0', '1']);

  const includedChars = binary.split('');
  while (includedChars.length < 256) includedChars.unshift('0');

  const ret = [];

  for (let i = 0; i < 256; i++) {
    if (includedChars[i] === '1') {
      ret.push(String.fromCharCode(i));
    }
  }

  return ret;
}

function initArray(size, defaultValue) {
  const ret = [];

  while (ret.length < size) ret.push(defaultValue);

  return ret;
}

/**
 * @param {Char[]} chars 
 * @param {Char[]} charSet 
 * @returns {BigInt}
 */
function encodeToBigInt(chars, charSet) {
  const base = BigInt(charSet.length);
  const reverseLookupDict = objectMap(
    createReverseLookupDictionaryFromArray(charSet),
    number => BigInt(number)
  );

  let ret = BigInt(0);
  for (const char of chars) {
    ret *= base;
    const value = reverseLookupDict[char];

    
    try {
      ret += value;
    } catch (e) {
      debugger;

      throw e;
    }
  }

  return ret;
}

function decodeFromBigInt(bigInt, charSet) {
  const base = BigInt(charSet.length);

  let ret = [];
  while(bigInt > 0) {
    const key = bigInt % base;
    bigInt /= base;
    const char = charSet[key];
    ret.push(char);
  }

  return ret.reverse().join('');
}

function invertDict(dict) {
  const ret = {};

  for (const key in dict) {
    const value = dict[key];
    ret[value] = key;
  }

  return ret;
}

function createEncodingDictionaryFromReverseLookupDictionary(dict, charSet) {
  if (Object.keys(dict).length < charSet.length) {
    return objectMap(dict, index => charSet[index]);
  } else {
    // TODO
    throw new Error(`Support for dictionaries larger than the target charset not yet implemented. dict.length: ${Object.keys(dict).length}, charSet.length: ${charSet.length}`);
  }
}

function objectMap(object, mapFn) {
  let ret = {};

  for (const key in object) {
    ret[key] = mapFn(object[key]);
  }

  return ret;
}

function createReverseLookupDictionaryFromArray(array) {
  const dict = {};

  for (const key in array) {
    const value = array[key];
    dict[value] = Number(key);
  }

  return dict;
}

function charsBetween(start, end) {
  return range(
    start.charCodeAt(0),
    end.charCodeAt(0)
  ).map(
    (code) => String.fromCharCode(code)
  );
}

function range(start, end) {
  if (typeof start !== 'number' || typeof end !== 'number') {
    throw new TypeError();
  }

  let delta = 1;
  if (end < start) {
    delta = -1; // iterate backwards
  }

  const ret = [];

  for (let i = start; i != end; i += delta) {
    ret.push(i);
  }
  ret.push(end);

  return ret;
}
var Stats = require('fast-stats').Stats;

/* The "fromArrayStats" function transforms an array of numbers to a 'Stats' object.
 * @param {Object} list - It is an array of numbers.
 * @return {Stats} - It is the 'Stats' object with the data of the array given
 */
function fromArraytoStats(list) {
    var s = new Stats();
    for(var index = 0 ; index < list.length ; index++) {
        s.push(list[index]);
    }
    return s;
}

/*--------------------CENTRAL TENDENCY--------------------*/

/* The "mean" function computes the MEAN, or average, of a given array of numbers.
 * It is the sum of all values dividing by the number of elements, which are in the set of values.
 * @param {Object} values - It is an array of numbers.
 * @return {Number} - It is the mean of the array given.
 */
function mean(values) {
    var s = fromArraytoStats(values);
    return s.amean();
}

/* The "mean2" function computes the MEAN, or average, of a given list of arrays, which has pairs of [mean, number_of_elements].
 * It is the sum of all values dividing by the number of elements.
 * @param {Object} values - It is a list of arrays. Example: [[2, 3], [1, 3], [3, 2], [2, 5], [9, 2]]
 * @return {Number} - It is the mean of the list of arrays given.
 */
function mean2(list) {
    var sum = 0;
    var n = 0;
    for(var index = 0 ; index < list.length ; index++) {
        sum += list[index][0]*list[index][1];
        n += list[index][1];
    }
    if(n > 0 ) {
        return sum/n;
    }
    return 0;
}

/* The "median" function computes the MEDIAN of a given array of numbers.
 * It is the value found at the middle of the set of values.
 * @param {Object} values - It is an array of numbers.
 * @return {Number} - It is the median of the array given.
 */
function median(values) {
    var s = fromArraytoStats(values);
    return s.median();
}

/* The "mode" function computes the MODE of a given array of numbers.
 * It is the most frequency occuring value in the set of values.
 * @param {Object} values - It is an array of numbers.
 * @return {Object} - It is the mode of the array given. Examples: { '3': 2, '5': 2, '6': 2 } or { '2': 4 }
 */
function mode(values) {
    freq = {};
    for(var index = 0 ; index < values.length ; index++) {
        if(freq[values[index]] != undefined) {
            freq[values[index]] += 1;
        } else {
            freq[values[index]] = 1;
        }
    }
    freq_values = [];
    for(var f in freq) {
        freq_values.push(freq[f]);
    }
    freq_max = range(freq_values)[1];
    var res = {};
    for(var f in freq) {
        if(freq[f] == freq_max) {
            res[f] = freq_max;
        }
    }
    return res;
}

/*--------------------DISPERSION--------------------*/

/* The "standard_deviation" function computes the STANDARD DEVIATION of a given array of numbers.
 * It shows the relation that the set of values has to the mean.
 * @param {Object} values - It is an array of numbers.
 * @return {Number} - It is the standard deviation of the array given.
 */
function standard_deviation(values) {
    var s = fromArraytoStats(values);
    return s.σ();
}

/* The "variance" function computes the VARIANCE of a given array of numbers.
 * It is the square root of the standard deviation.
 * @param {Object} values - It is an array of numbers.
 * @return {Number} - It is the variance of the array given.
 */
function variance(values) {
    return Math.pow(standard_deviation(values),2);
}

/* The "range" function computes the RANGE of a given array of numbers.
 * It is the highest value minus the lowest value.
 * @param {Object} values - It is an array of numbers.
 * @return {Object} - It is the range(minumum, maximum) of the array given. Examples: [2, 4] or [1, 10]
 */
function range(values) {
    var s = fromArraytoStats(values);
    return s.range();
}

/* The "range2" function computes the RANGE of a given list of arrays, which has pairs of range.
 * It is the highest value minus the lowest value.
 * @param {Object} values - It is a list of arrays. Example: [[2, 3], [1, 3], [3, 2], [2, 5], [9, 2]]
 * @return {Object} - It is the range(minumum, maximum) of the list of arrays given. Examples: [2, 4] or [1, 10]
 */
function range2(list) {
    var values = [];
    for(var index = 0 ; index < list.length ; index++) {
        values.push(list[index][0]);
        values.push(list[index][1]);
    }
    if(values.length == 0) {
        return 0;
    }
    return range(values);
 }

/*--------------------OTHER FUNCTIONS--------------------*/

/* The "min" function computes the MIN of a given array of numbers.
 * It is the minimum value into array.
 * @param {Object} values - It is an array of numbers.
 * @return {Number} - It is the minimum number of the array given.
 */
function min(values) {
    return range(values)[0];
}

/* The "max" function computes the MAX of a given array of numbers.
 * It is the maximum value into array.
 * @param {Object} values - It is an array of numbers.
 * @return {Number} - It is the maximum number of the array given.
 */
function max(values) {
    return range(values)[1];
}

/* The "sum" function computes the SUM of a given array of numbers.
 * It is the sum of all values into the array given.
 * @param {Object} values - It is an array of numbers.
 * @return {Number} - It is the sum of all values into the array given.
 */
function sum(values) {
    var sum = 0;
    for(var index = 0 ; index < values.length ; index++) {
        sum += values[index];
    }
    return sum;
}

/*--------------------EXPORT ALL FUNCTIONS FOR STATISTICS--------------------*/

exports.mean = mean;
exports.mean2 = mean2;
exports.median = median;
exports.mode = mode;

exports.standard_deviation = standard_deviation;
exports.variance = variance;
exports.range = range;
exports.range2 = range2;

exports.min = min;
exports.max = max;
exports.sum = sum;
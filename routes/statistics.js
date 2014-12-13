var sc = require('./statistics_computation');

/*--------------------MAIN FUNCTIONS--------------------*/

/* The "collectionStat" function computes all the statistics of a given collection.
 * We have three kind of statistics to do, dipending to the type of the metric: SINGLE_VALUE, TYPE_DISTRIBUTION and DISTRIBUTION (with DISTRIBUTION-STATISTICS).
 * @param {Object} collection - It is an object with a full collection, with all models and metrics.
 * @return {Object} - It is a list of objects, which have the statistics for each metric, with the values.
 */
function collectionStat(collection) {
    var result = {};
    var models = collection.models;
    for(var model in models) {
        var metrics = models[model].metrics;
        for(var metric in metrics) {
            var metric_type = metrics[metric].type;
            var metric_name = metrics[metric].name;
            if(metric_type === "SINGLE_VALUE") { // Metrics with type SINGLE_VALUE
                var metric_value = metrics[metric].values[0].value;
                if(result[metric_name] == undefined) {
                    result[metric_name] = {};
                    result[metric_name]["type"] = "SINGLE_VALUE";
                    result[metric_name]["category"] = metrics[metric].category;
                    result[metric_name]["values"] = new Array();
                }
                result[metric_name]["values"].push(metric_value);
            } else if(metric_type === "TYPE_DISTRIBUTION") { // Metrics with type TYPE_DISTRIBUTION
                if(result[metric_name] == undefined) {
                    result[metric_name] = {};
                    result[metric_name]["names"] = [];
                    for(var index = 0 ; index < metrics[metric].values.length ; index++) {
                        var element = { "name": metrics[metric].values[index].name, "values": [metrics[metric].values[index].value] };
                        result[metric_name]["names"].push(element);
                    }
                    result[metric_name]["type"] = "TYPE_DISTRIBUTION";
                    result[metric_name]["category"] = metrics[metric].category;
                } else { // Assuming that the metrics with the same name and type "TYPE_DISTRIBUTION" have the same structure
                    for(var index = 0 ; index < metrics[metric].values.length ; index++) {
                        var alreadyexists = false;
                        for(var i = 0 ; i < result[metric_name]["names"].length ; i++) {
                            if(result[metric_name]["names"][i].name == metrics[metric].values[index].name) {
                                result[metric_name]["names"][i].values.push(metrics[metric].values[index].value);
                                alreadyexists = true;
                            }
                        }
                        if(!alreadyexists) {
                            var element = { "name": metrics[metric].values[index].name, "values": [metrics[metric].values[index].value] };
                            result[metric_name]["names"].push(element);
                        }
                    }
                }
            } else if(metric_type === "DISTRIBUTION") { // Metrics with type DISTRIBUTION
                var name_statistics1 = metric_name + "Statistics";
                var name_statistics2 = metric_name + "DistributionStatistics";
                var metric_statistic = {};
                for (var i = 0; i < metrics.length; i++) {
                    if (metrics[i].name === name_statistics1 || metrics[i].name === name_statistics2) {
                        metric_statistic = metrics[i];
                    }
                }
                if (result[metric_name] == undefined) {
                    result[metric_name] = {};
                    result[metric_name]["type"] = "DISTRIBUTION";
                    result[metric_name]["category"] = metrics[metric].category;
                    result[metric_name]["values"] = metrics[metric].values;
                    if (!isEmpty(metric_statistic)) {
                        for (var index = 0; index < metric_statistic.values.length; index++) {
                            if (metric_statistic.values[index].name == "Minimum") {
                                result[metric_name]["MINs"] = [metric_statistic.values[index].value];
                            } else if (metric_statistic.values[index].name == "Maximum") {
                                result[metric_name]["MAXs"] = [metric_statistic.values[index].value];
                            } else if (metric_statistic.values[index].name == "Sum") {
                                result[metric_name]["SUMs"] = [metric_statistic.values[index].value];
                            }
                        }
                    }
                } else {
                    for (var index = 0; index < metrics[metric].values.length; index++) {
                        result[metric_name]["values"].push(metrics[metric].values[index]);
                    }
                    if (!isEmpty(metric_statistic)) {
                        for (var index = 0; index < metric_statistic.values.length; index++) {
                            if (metric_statistic.values[index].name == "Minimum") {
                                result[metric_name]["MINs"].push(metric_statistic.values[index].value);
                            } else if (metric_statistic.values[index].name == "Maximum") {
                                result[metric_name]["MAXs"].push(metric_statistic.values[index].value);
                            } else if (metric_statistic.values[index].name == "Sum") {
                                result[metric_name]["SUMs"].push(metric_statistic.values[index].value);
                            }
                        }
                    }
                }
            }
        }
    }
    var res = [];
    for(var metric_name in result) {
        var res_metric = {};
        res_metric["metric_name"] = metric_name;
        res_metric["type"] = result[metric_name]["type"];
        res_metric["category"] = result[metric_name]["category"];
        if(result[metric_name]["type"] == "SINGLE_VALUE") { // Metrics with type SINGLE_VALUE
            var values = result[metric_name]["values"];
            res_metric["values"] = values;
            res_metric["mean"] = [sc.mean(values), values.length]; // [V, #]
            res_metric["median"] = sc.median(values); // V
            res_metric["mode"] = sc.mode(values); // {V: #, V: #, ...}
            res_metric["standard_deviation"] = sc.standard_deviation(values); // V
            res_metric["variance"] = sc.variance(values); // V
            res_metric["range"] = sc.range(values); // [V, V]
        } else if(result[metric_name]["type"] == "TYPE_DISTRIBUTION") { // Metrics with type TYPE_DISTRIBUTION
            res_metric["names"] = [];
            for(var index = 0 ; index < result[metric_name]["names"].length ; index++) {
                var values = result[metric_name]["names"][index].values;
                var res_metric_name = {};
                res_metric_name["name"] = result[metric_name]["names"][index].name;
                res_metric_name["values"] = values;
                res_metric_name["mean"] = [sc.mean(values), values.length]; // [V, #]
                res_metric_name["median"] = sc.median(values); // V
                res_metric_name["mode"] = sc.mode(values); // {V: #, V: #, ...}
                res_metric_name["standard_deviation"] = sc.standard_deviation(values); // V
                res_metric_name["variance"] = sc.variance(values); // V
                res_metric_name["range"] = sc.range(values); // [V, V]
                res_metric["names"].push(res_metric_name);
            }
        } else if(result[metric_name]["type"] == "DISTRIBUTION") { // Metrics with type DISTRIBUTION
            res_metric["values"] = add_values_distribution(result[metric_name]["values"]);
            if(result[metric_name]["MINs"]) {
                res_metric["minimum"] = sc.min(result[metric_name]["MINs"]);
            }
            if(result[metric_name]["MAXs"]) {
                res_metric["maximum"] = sc.max(result[metric_name]["MAXs"]);
            }
            if(result[metric_name]["SUMs"]) {
                res_metric["sum"] = sc.sum(result[metric_name]["SUMs"]);
            }
        }
        res.push(res_metric);
    }
    return res;
}

/* The "accountStat" function updates the statistics of an account after the upload of a new collection.
 * @param {Object} account_statistics - It is the object having the actual statistics of the account, with all values of all metrics into models that the account has.
 * @param {Object} newCollection_statistics - It is the object having the statistcs of new colletion upload, with all valuer of all metrics into models of the new collecion.
 * @return {Object} - It is a list of objects, which have the statistics of the account updated for each metric, with the values.
 */
function accountStat(account_statistics, newCollection_statistics) {
    if(account_statistics.length == 0) { // When the first collection of the account is updated
        return newCollection_statistics;
    } else {
        var stat = [];
        stat.push(account_statistics);
        stat.push(newCollection_statistics);
        return new_statistics(stat);
    }
}

/* The "globalStat" function updates the global statistics after the upload of a new collection.
 * @param {Object} stat - It is the list of objects having the actual statistics of all accounts, with all values of all metrics into models that the account has.
 * @return {Object} - It is a list of objects, which have the global statistics updated for each metric, without the values.
 */
function globalStat(stat) {
    return statistics_without_values(new_statistics(stat));
}

/* The "statistics_without_values" function removes the values from a statistic object.
 * @param {Object} stat - It is the list of objects having the statistics of something, with all values of all metrics into models that the account has.
 * @return {Object} - It is a list of objects, which have the statistics without the values.
 */
function statistics_without_values(stat) {
    for(var metric_stat in stat) {
        var metric_type = stat[metric_stat].type;
        if((metric_type === "SINGLE_VALUE") || (metric_type === "DISTRIBUTION")) {
            delete stat[metric_stat].values;
        } else if(metric_type === "TYPE_DISTRIBUTION") {
            for(var index = 0 ; index < stat[metric_stat].names.length ; index++) {
                delete stat[metric_stat].names[index].values;
            }
        }
    }
    return stat;
}

/*--------------------OTHER FUNCTIONS--------------------*/

/* The "isEmpty" function says if an object is empty or not.
 * @param {Object} obj - It is an object.
 * @return {Boolean} - It returns true or false, depending if the object given is empty or not.
 */
function isEmpty(obj) { // Check if an object is empty
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

/* The "add_values_distribution" function add together all the values of a metric of type DISTRIBUTION.
 * @param {Object} obj - It is an array of objects with all the objects.
 * @return {Object} - It returns object with all the values given added. Examples: { '3': 2, '5': 1, '6': 7 } or { '2': 4 }
 */
function add_values_distribution(list_values) {
    var result = {};
    for(var index = 0 ; index < list_values.length ; index++) {
        if(result[list_values[index]["name"]] == undefined) {
            result[list_values[index]["name"]] = list_values[index]["value"];
        } else {
            result[list_values[index]["name"]] += list_values[index]["value"]
        }
    }
    return result;
}

/* The "add_values_distribution2" function add together all the values of a metric of type DISTRIBUTION.
 * @param {Object} obj - It is an array of objects with all the objects. Example: [{ '2': 4, '3': 2 }, { '2': 4, '3': 2 }]
 * @return {Object} - It returns object with all the values given added. Examples: { '3': 2, '5': 1, '6': 7 } or { '2': 4 }
 */
function add_values_distribution2(list_values) {
    var values = [];
    for(var index = 0 ; index < list_values.length ; index++) {
        for(name in list_values[index]) {
            values.push({"name": name, "value": list_values[index][name]});
        }
    }
    return add_values_distribution(values)
}

/* The "new_statistics" function does the statistics taking a list of statistics given.
 * @param {Object} stat - It is the list of objects having the some statistics, with all values of all metrics into models that the account has.
 * @return {Object} - It is a list of objects, which have the global statistics of what is given, with the values.
 */
function new_statistics(stat) {
    var result = {};
    for(var j = 0 ; j < stat.length ; j++) {
        var statistic = stat[j];
        for(var index = 0 ; index < statistic.length ; index++) {
            var metric_type = statistic[index].type;
            var metric_name = statistic[index].metric_name;
            if(metric_type === "SINGLE_VALUE") { // Metrics with type SINGLE_VALUE
                var metric_value = statistic[index].values;
                if(result[metric_name] == undefined) {
                    result[metric_name] = {};
                    result[metric_name]["type"] = "SINGLE_VALUE";
                    result[metric_name]["category"] = statistic[index].category;
                    result[metric_name]["values"] = statistic[index].values;
                    result[metric_name]["mean"] = [statistic[index].mean];
                    result[metric_name]["range"] = [statistic[index].range];
                } else {
                    for(var i = 0 ; i < statistic[index].values.length ; i++) {
                        result[metric_name]["values"].push(statistic[index].values[i]);
                    }
                    result[metric_name]["mean"].push(statistic[index].mean);
                    result[metric_name]["range"].push(statistic[index].range);
                }
            } else if(metric_type === "TYPE_DISTRIBUTION") { // Metrics with type TYPE_DISTRIBUTION
                var metric_value = statistic[index].values;
                if(result[metric_name] == undefined) {
                    result[metric_name] = {};
                    result[metric_name]["type"] = "TYPE_DISTRIBUTION";
                    result[metric_name]["category"] = statistic[index].category;
                    result[metric_name]["names"] = [];
                    for(var i = 0 ; i < statistic[index].names.length ; i++) {
                        var element = { 
                            "name": statistic[index].names[i].name, 
                            "values": statistic[index].names[i].values,
                            "mean": [statistic[index].names[i].mean] ,
                            "range": [statistic[index].names[i].range] };
                        result[metric_name]["names"].push(element);
                    }
                } else {
                    for(var k = 0 ; k < statistic[index].names.length ; k++) {
                        var alreadyexists = false;
                        for(var i = 0 ; i < result[metric_name]["names"].length ; i++) {
                            if(result[metric_name]["names"][i].name == statistic[index].names[k].name) {
                                for(var v = 0 ; v < statistic[index].names[k].values.length ; v++) {
                                    result[metric_name]["names"][i].values.push(statistic[index].names[k].values[v]);
                                }
                                result[metric_name]["names"][i]["mean"].push(statistic[index].names[k].mean);
                                result[metric_name]["names"][i]["range"].push(statistic[index].names[k].range);
                                alreadyexists = true;
                            }
                        }
                        if(!alreadyexists) {
                            var element = { 
                                "name": statistic[index].names[i].name, 
                                "values": statistic[index].names[i].values,
                                "mean": [statistic[index].names[i].mean] ,
                                "range": [statistic[index].names[i].range] };
                            result[metric_name]["names"].push(element);
                        }
                    }
                }
            } else if(metric_type === "DISTRIBUTION") { // Metrics with type DISTRIBUTION
                var metric_value = statistic[index].values;
                if(result[metric_name] == undefined) {
                    result[metric_name] = {};
                    result[metric_name]["type"] = "DISTRIBUTION";
                    result[metric_name]["category"] = statistic[index].category;
                    result[metric_name]["values"] = statistic[index].values;
                    if(statistic[index].minimum != undefined) {
                        result[metric_name]["MINs"] = [statistic[index].minimum];
                    }
                    if(statistic[index].maximum != undefined) {
                        result[metric_name]["MAXs"] = [statistic[index].maximum];
                    }
                    if(statistic[index].sum != undefined) {
                        result[metric_name]["SUMs"] = [statistic[index].sum];
                    }
                } else {
                    result[metric_name]["values"] = add_values_distribution2([result[metric_name]["values"], statistic[index].values]);
                    if(statistic[index].minimum != undefined) {
                        result[metric_name]["MINs"].push(statistic[index].minimum);
                    }
                    if(statistic[index].maximum != undefined) {
                        result[metric_name]["MAXs"].push(statistic[index].maximum);
                    }
                    if(statistic[index].sum != undefined) {
                        result[metric_name]["SUMs"].push(statistic[index].sum);
                    }
                }
            }
        }
    }
    var res = [];
    for(var metric_name in result) {
        var res_metric = {};
        res_metric["metric_name"] = metric_name;
        res_metric["type"] = result[metric_name]["type"];
        res_metric["category"] = result[metric_name].category;
        if(result[metric_name]["type"] == "SINGLE_VALUE") { // Metrics with type SINGLE_VALUE
            var values = result[metric_name]["values"];
            res_metric["values"] = values;
            res_metric["mean"] = [sc.mean2(result[metric_name]["mean"]), values.length]; // [V, #]
            res_metric["median"] = sc.median(values); // V
            res_metric["mode"] = sc.mode(values); // {V: #, V: #, ...}
            res_metric["standard_deviation"] = sc.standard_deviation(values); // V
            res_metric["variance"] = sc.variance(values); // V
            res_metric["range"] = sc.range2(result[metric_name]["range"]); // [V, V]
        } else if(result[metric_name]["type"] == "TYPE_DISTRIBUTION") { // Metrics with type TYPE_DISTRIBUTION
            res_metric["names"] = [];
            for(var index = 0 ; index < result[metric_name]["names"].length ; index++) {
                var values = result[metric_name]["names"][index].values;
                var res_metric_name = {};
                res_metric_name["name"] = result[metric_name]["names"][index].name;
                res_metric_name["values"] = values;
                res_metric_name["mean"] = [sc.mean2(result[metric_name]["names"][index].mean), values.length]; // [V, #]
                res_metric_name["median"] = sc.median(values); // V
                res_metric_name["mode"] = sc.mode(values); // {V: #, V: #, ...}
                res_metric_name["standard_deviation"] = sc.standard_deviation(values); // V
                res_metric_name["variance"] = sc.variance(values); // V
                res_metric_name["range"] = sc.range2(result[metric_name]["names"][index].range); // [V, V]
                res_metric["names"].push(res_metric_name);
            }
        } else if(result[metric_name]["type"] == "DISTRIBUTION") { // Metrics with type DISTRIBUTION
            res_metric["values"] = result[metric_name]["values"];
            if(result[metric_name]["MINs"]) {
                res_metric["minimum"] = sc.min(result[metric_name]["MINs"]);
            }
            if(result[metric_name]["MAXs"]) {
                res_metric["maximum"] = sc.max(result[metric_name]["MAXs"]);
            }
            if(result[metric_name]["SUMs"]) {
                res_metric["sum"] = sc.sum(result[metric_name]["SUMs"]);
            }
        }
        res.push(res_metric);
    }
    return res;
}

/*--------------------EXPORT ALL MAIN FUNCTIONS--------------------*/

exports.collectionStat = collectionStat;
exports.accountStat = accountStat;
exports.globalStat = globalStat;
exports.statistics_without_values = statistics_without_values;
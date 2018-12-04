app.controller('DashboardCtrl', ['$scope', '$rootScope', '$state', '_', '$interval', '$q', 'initialData', 'connectionHistory', 'liveConnections', 'guacamoleUrl', 'Notifications', function ($scope, $rootScope, $state, _, $interval, $q, initialData, connectionHistory, liveConnections, guacamoleUrl, Notifications) {

  $rootScope.$broadcast('changedView', 'dashboard');
  $scope._ = _;
  $scope.guacamoleSessionSettingsUrl = guacamoleUrl + '/guacamole/#/settings/sessions';
  
  $scope.refreshInterval = 10;
  $scope.intervals = [5, 10, 30, 60];

  $scope.connectionHistory = connectionHistory;
  $scope.liveConnections = liveConnections;

  $scope.aggStatusDataAvailable = false;
  $scope.donutHistoryDataAvailable = false;
  $scope.emptyStateConfig = {
    icon: 'pficon pficon-info',
    title: 'No Connection Data Available'
  };

  $scope.donutHistoryConfig = {
    'chartId': 'connectionHistoryDonut',
    'legend': {'show':true, 'position': 'bottom'},
    'colors' : {
    },
    donut: {
      title: "Total Connections"
    }
  };

  $scope.donutHistoryHeight = 350;
  $scope.trendsLiveHeight = 200;

  $scope.trendsTotalFilterConfig = {
    'filters' : [{label:'Last hour', value:'hour'},
                 {label:'Last day', value:'day'},
                 {label:'Last week', value:'week'},
                 {label:'Last month', value:'month'}],
    'callBackFn': function (f) {
      $scope.trendsTotalConfig.timeFrame = f.label;
      $scope.filterTrendPeriod = f.value;
      $scope.trendsTotalConfig.tooltipType = (f.value === 'week' || f.value === 'month') ? 'usagePerDay' : 'default';
      createTrendTotalChart($scope.connectionHistory.concat($scope.liveConnections));
     },
    'position' : 'header',
    'defaultFilter' : 0
  };
  $scope.trendTotalNumberOfPoints = 200;
  $scope.filterTrendPeriod = 'hour';

  $scope.trendsMixedFilterConfig = {
    'filters' : [{label:'Last day', value:'day'},
                 {label:'Last week', value:'week'},
                 {label:'Last month', value:'month'},
                 {label:'Last year', value:'year'}],
    'callBackFn': function (f) {
      $scope.filterMixedTrendPeriod = f.value;
      createTrendMixedChart($scope.connectionHistory);
     },
    'position' : 'header',
    'defaultFilter' : 2
  };
  $scope.trendMixedNumberOfPoints = 30;
  $scope.filterMixedTrendPeriod = 'month';

  $scope.trendsTotalConfig = {
    'chartId'      : 'totalTrendsChart',
    // 'title'        : 'Total Connections',
    'layout'       : 'large',
    'valueType'    : 'actual',
    'timeFrame'    : 'Last hour',
    'compactLabelPosition'  : 'left'
  };

  $scope.trendsTotalData = {};

  $scope.aggStatusData = {
    "title":"Connections",
    "count":0,
    "notifications":[
    ]
  };

  $scope.trendsMixedChartConfig = {
    data: {
        columns: [
        ],
        type: 'spline'
    },
    axis:{
      x:{
         show: false
      }
    },
    tooltip: {
      format: {
        title: function () { return 'Total Connections'; },
      }
    }
  };

  var processHistoryDonutData = function(connectionHistory) {
    $scope.donutHistoryLoading = true;
    var keyCount = 0;
    var counts = connectionHistory.reduce(function(sums,entry){
       sums[entry.connectionName] = (sums[entry.connectionName] || 0) + 1;
       return sums;
    },{});
    $scope.donutHistoryData = Object.keys(counts).map(function(key) {
      $scope.donutHistoryConfig.colors[key] = '#'+Math.floor(Math.random()*16777215).toString(16);
      keyCount++;
      return [key, counts[key]];
    });
    $scope.donutHistoryDataAvailable = ($scope.donutHistoryData.length > 0);
    $scope.donutHistoryLoading = false;
  };

  var processLiveDonutData = function(liveConnections) {
    $scope.aggStatusLoading = true;
    var keyCount = 0;
    var counts = liveConnections.reduce(function(sums,entry){
       sums[entry.connectionIdentifier] = (sums[entry.connectionIdentifier] || 0) + 1;
       return sums;
    },{});
    $scope.aggStatusData.count = liveConnections.length;
    $scope.aggStatusData.notifications = Object.keys(counts).map(function(key) {
      return {
        // iconImage: 'img/connection' + key.toString() + '.png',
        // iconImage: '/img/default-connection.png',
        iconClass: 'fa pficon-virtual-machine vm-connection-' + key.toString(),
        count: counts[key],
        href: guacamoleUrl + '/guacamole/#/manage/mysql/connections/' + key.toString()
      };
    });
    $scope.aggStatusDataAvailable = $scope.aggStatusData.count > 0;
    $scope.aggStatusLoading = false;
  };

  //Trends

  var createDatePoints = function(filterPeriod, numberOfPoints) {
    var currentDate = moment().valueOf();
    var startTime = moment().subtract(1, filterPeriod).valueOf();
    var datePoints = numberOfPoints;
    var dateInterval = Math.round((currentDate - startTime) / datePoints);
    var dates = [];
    for (var d = datePoints - 1; d >= 0; d--) {
      dates.push(currentDate - (d * dateInterval));
    }
    return dates;
  };

  var filterTimestamps = function(connections, filterPeriod) {
    var startTime = moment().subtract(1, filterPeriod).valueOf();
    var filteredArray = [];
    for (let item of connections) {
      if ((item.endDate && (item.endDate > startTime)) || (!item.endDate && item.startDate)) {
        filteredArray.push(item);
      }
    }
    return filteredArray;
  };

  var convertToDateFormat = function(dateArray) {
    var convertedDateArray = [];
    for (let date of dateArray) {
      convertedDateArray.push(new Date(parseInt(date)));
    }
    return convertedDateArray;
  };

  var groupConnectionsByName = function(connections) {
    var grouppedConnections = $scope._
    .chain(connections)
    .groupBy('connectionName')
    .map(function(value, key) {
      return {
        connection: key,
        startDates: $scope._.map(value, 'startDate'),
        points: []
      };
    })
    .value();
    return grouppedConnections;
  }

  var createTrendTotalData = function(dates, history) {
    var trendObject = {};
    var returnObject = {};
    for (let date of dates) {
      trendObject[date] = 0;
      for (let item of history) {
        if (item.startDate < date && (item.endDate > date || !item.endDate)) {
          trendObject[date]++;
        }
      }
    }
    returnObject.dates = convertToDateFormat(Object.keys(trendObject));
    returnObject.dates.unshift('dates');
    returnObject.count = Object.values(trendObject);
    returnObject.count.unshift('connections');
    returnObject.totalCount = history.length;
    return returnObject;
  };

  var createTrendTotalChart = function(connectionData) {
    var trendsAllData = createTrendTotalData(createDatePoints($scope.filterTrendPeriod, $scope.trendTotalNumberOfPoints), filterTimestamps(connectionData, $scope.filterTrendPeriod));
    $scope.trendsTotalData.dataAvailable = trendsAllData.totalCount > 0;
    $scope.trendsTotalData.total = trendsAllData.totalCount;
    $scope.trendsTotalData.xData = trendsAllData.dates;
    $scope.trendsTotalData.yData = trendsAllData.count;
  };

  var createTrendMixedData = function(dates, history) {
    var grouppedHistory = groupConnectionsByName(history);
    for (var d = 0; d < dates.length; d++) {
      for (let item of grouppedHistory) {
        item.points[d] = 0;
        for (let startDate of item.startDates) {
          if (startDate < dates[d]) {
            item.points[d] ++;
          }
        }
      }
    }
    return grouppedHistory;    
  };

  var createTrendMixedChart = function(connectionData) {
    // var trendsMixedData = createTrendMixedData(createDatePoints($scope.filterMixedTrendPeriod, $scope.trendMixedNumberOfPoints), filterTimestamps(connectionData, $scope.filterMixedTrendPeriod));
    var trendsMixedData = createTrendMixedData(createDatePoints($scope.filterMixedTrendPeriod, $scope.trendMixedNumberOfPoints), connectionData);
    for (let connection of trendsMixedData) {
      connection.points.unshift(connection.connection);
      $scope.trendsMixedChartConfig.data.columns.push(connection.points);
    }
  };

  //refresh and initialise

  processHistoryDonutData($scope.connectionHistory);
  processLiveDonutData($scope.liveConnections);
  createTrendTotalChart($scope.connectionHistory.concat($scope.liveConnections));
  createTrendMixedChart($scope.connectionHistory);

  $scope.refresh = function() {
    var promises = [initialData.getConnectionHistory(true), initialData.getLiveConnections(true)];
    $q.all(promises)
      .then(function(response) {
        $scope.connectionHistory = response[0];
        $scope.liveConnections = response[1];
        processHistoryDonutData($scope.connectionHistory);
        processLiveDonutData($scope.liveConnections);
        createTrendTotalChart($scope.connectionHistory.concat($scope.liveConnections));
        createTrendMixedChart($scope.connectionHistory);
      })
      .catch(function(err) {
        console.log(err);
      });

  };

  $scope.refreshTimer = $interval(function () {
    $scope.refresh();
  }, $scope.refreshInterval * 1000);

  $scope.$watch("refreshInterval", function(newVal) {
    $interval.cancel($scope.refreshTimer);
    $scope.refreshTimer = undefined;
    $scope.refreshTimer = $interval(function () {
      $scope.refresh();
    }, $scope.refreshInterval * 1000);
  });

}]);
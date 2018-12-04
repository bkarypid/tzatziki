app.controller('HistoryCtrl', ['$scope', '$rootScope', '$state', '$filter', '$interval', 'initialData', 'connectionHistory', 'Notifications', function ($scope, $rootScope, $state, $filter, $interval, initialData, connectionHistory, Notifications) {

  $rootScope.$broadcast('changedView', 'history');

  $scope.refreshInterval = 5;

  $scope.allItems = connectionHistory;
  $scope.items = $scope.allItems;
  $scope.pageConfig = {
    pageNumber: 1,
    pageSize: 20
  };

  $scope.dtOptions = {
    order: [[1, "asc"]],
  };

  $scope.tableConfig = {
    selectionMatchProp: 'username',
    itemsAvailable: true,
    showCheckboxes: false
  };

  $scope.emptyStateConfig = {
    icon: 'pficon-warning-triangle-o',
    title: 'No Data Available',
    info: "There is no connection history to display",
  };

  $scope.columns = [];
  $scope.columns.push({ header: "Username", itemField: "username"});
  $scope.columns.push({ header: "Start Time", itemField: "startDate", templateFn: function(value, item) { return $filter('date')(value, "d MMM y, HH:mm:ss")}});
  $scope.columns.push({ header: "End Time", itemField: "endDate", templateFn: function(value, item) { return $filter('date')(value, "d MMM y, HH:mm:ss")}});
  $scope.columns.push({ header: "Connection Name", itemField: "connectionName"});

  var matchesFilter = function (item, filter) {
    var match = true;
    switch(filter.id) {
      case 'username':
        match = item.username.match(filter.value) !== null;
        break;
      case 'connectionName':
        match = item.connectionName.match(filter.value) !== null;
        break;
      case 'startDateAfter':
        match = (item.startDate > moment(filter.value).valueOf());
        break;
      case 'startDateBefore':
        match = (item.startDate < moment(filter.value).valueOf());
        break;
      case 'endDateAfter':
        match = (item.endDate > moment(filter.value).valueOf());
        break;
      case 'endDateBefore':
        match = (item.endDate < moment(filter.value).valueOf());
        break;
    }
    return match;
  };
 
  var matchesFilters = function (item, filters) {
    var matches = true;

    filters.forEach(function(filter) {
      if (!matchesFilter(item, filter)) {
        matches = false;
        return false;
      }
    });
    return matches;
  };

  var applyFilters = function (filters) {
    $scope.items = [];
    if (filters && filters.length > 0) {
      $scope.allItems.forEach(function (item) {
        if (matchesFilters(item, filters)) {
          $scope.items.push(item);
        }
      });
    } else {
      $scope.items = $scope.allItems;
    }
  };

  var filterChange = function (filters) {
    applyFilters(filters);
    $scope.toolbarConfig.filterConfig.resultsCount = $scope.items.length;
  };

  $scope.filterConfig = {
    fields: [
      {
        id: 'username',
        title:  'Username',
        placeholder: 'Filter by Username...',
        filterType: 'text'
      },
      {
        id: 'connectionName',
        title:  'Connection',
        placeholder: 'Filter by Connection Name...',
        filterType: 'text'
      },
      {
        id: 'startDateBefore',
        title:  'Start Date Before',
        placeholder: 'YYYY-MM-DD',
        filterType: 'date'
      },
      {
        id: 'startDateAfter',
        title:  'Start Date After',
        placeholder: 'YYYY-MM-DD',
        filterType: 'date'
      },
      {
        id: 'endDateBefore',
        title:  'End Date Before',
        placeholder: 'YYYY-MM-DD',
        filterType: 'date'
      },
      {
        id: 'endDateAfter',
        title:  'End Date After',
        placeholder: 'YYYY-MM-DD',
        filterType: 'date'
      }
    ],
    resultsCount: $scope.items.length,
    totalCount: $scope.allItems.length,
    appliedFilters: [],
    onFilterChange: filterChange
  };

  $scope.toolbarConfig = {
    filterConfig: $scope.filterConfig,
    sortConfig: $scope.sortConfig,
    actionsConfig: $scope.toolbarActionsConfig,
    isTableView: true
  };

  $scope.showComponent = true;

  $scope.refreshTimer = $interval(function () {
    initialData.getConnectionHistory(true)
      .then(function(response) {
        if (!angular.equals($scope.allItems, response)) {
          $scope.allItems = response;
          $scope.items = $scope.allItems;
          filterChange($scope.filterConfig.appliedFilters);
        }
      })
      .catch(function(err) {
        console.log(err);
      });
  }, $scope.refreshInterval * 1000);

}]);
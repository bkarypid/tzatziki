app.controller("NavCtrl", function($rootScope, $scope, $http, $location, $state, Notifications) {

    $scope.navigationItems = [
      {
        title: "Dashboard",
        iconClass: "fa fa-tachometer",
        uiSref: "dashboard"
      },
      {
        title: "Live Connections",
        iconClass: "fa pficon-topology",
        uiSref: "live"
      },
      {
        title: "History",
        iconClass : "fa pficon-repository",
        uiSref: "history"
      }
    ];

    function changeActiveView($event, activeState) {
      if (activeState === 'live') {
        $scope.navigationItems[0].isActive = false;
        $scope.navigationItems[1].isActive = true;
        $scope.navigationItems[2].isActive = false;
      }
      else if (activeState === 'history') {
        $scope.navigationItems[0].isActive = false;
        $scope.navigationItems[1].isActive = false;
        $scope.navigationItems[2].isActive = true;
      }
      else {
        $scope.navigationItems[0].isActive = true;
        $scope.navigationItems[1].isActive = false;
        $scope.navigationItems[2].isActive = false;
      }
    }

    $rootScope.$on('changedView', changeActiveView);
});

app.controller('AboutModalCtrl', function ($scope, $rootScope, $http) {
  $scope.additionalInfo = "The purpose of this application is to provide real time data VDI usage for Apache Guacamole.";
  $scope.copyright = "For internal use only";
  $scope.imgAlt = "Image Symbol";
  $scope.imgSrc = "css/images/analytics-icon.png";
  $scope.title = "TZATZIKI";
  $scope.open = function () {
    $http.get('/api/v1/version')
      .success(function(version) {
        $scope.productInfo = [
          { name: 'Version', value: version },
          { name: 'Access', value: 'Read Only' }
        ];
        $scope.isOpen = true;
      })
      .error(function(err) {
        $scope.productInfo = [
          { name: 'Version', value: 'No version information available' },
          { name: 'Access', value: 'Read Only' }
        ];
        $scope.isOpen = true;
      });
  };
  $scope.onClose = function() {
    $scope.isOpen = false;
  };
});

app.controller('HelpModalCtrl', function ($scope, $http) {
  $scope.additionalInfo = "Tzatziki";
  $scope.imgAlt = "Image Symbol";
  $scope.imgSrc = "css/images/analytics-icon.png";
  $scope.title = "TZATZIKI";
  $scope.isOpen = false;
  $scope.open = function() {
    $scope.isOpen = true;
  };
  $scope.onClose = function() {
    $scope.isOpen = false;
  };
});
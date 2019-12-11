angular.module('fencesForBusiness.time_cards_ctrl', ['ngIOS9UIWebViewPatch'])

.controller('TimeCardsController', function($scope, OrderInvoiceService, $ionicLoading, $state, fencesData, $stateParams, $rootScope, $ionicHistory) {
  var PAY_PERIOD_OFFSET = 1;

  $scope.punches = [];
  $scope.isPaypal = false;

  $scope.$on( "$ionicView.leave", function( scopes ) { });

  $scope.$on( "$ionicView.enter", function( scopes ) {
    $scope.errorMessage = '';
    $scope.hasErrors    = false;
    $scope.loadPunches();
    $scope.openPayPeriodNumber = getPayPeriodNumberFromDate(new Date());
  });

  $scope.loadPunches = function() {
    $ionicLoading.show({ template: 'Loading Time Cards...' });
    fencesData.callWrapper('/users/punches', 'GET', null)
    .then(function(punches) {
      $ionicLoading.hide();
      if(punches && punches.length > 0 && punches[0].isPaypal) {
        $scope.isPaypal = true;
        $scope.punches = punches.punches;
      } else {
        $scope.isPaypal = false;
        punches = punches.reverse();
        $scope.punches = punches;
        $scope.groupedPunches = groupPunches(punches);
        $scope.payPeriodNumbers = _.keys($scope.groupedPunches).map(function(k) {
          return parseInt(k);
        });
        console.log('### got punches: ' + JSON.stringify($scope.payPeriodNumbers));
      }
      console.log('### punches: ' + JSON.stringify($scope.punches));
      
    }, function(err) {
      $ionicLoading.show({ template: 'There was an error', duration: 1000 });
    });
  }

  var getPayPeriodNumberFromDate = function(date) {
    var formattedDate = $scope.formatDate(date);
    var weekNumber = moment(formattedDate).subtract({ hours: 5 }).week();
    return Math.ceil(weekNumber / 2) - 1;
  }

  var groupPunches = function(punches) {
    var formattedPunches = punches.map(function(p) {
      var unformattedDate = p.InTime || p.OutTime;
      p.payPeriodNumber   = getPayPeriodNumberFromDate(unformattedDate);
      return p;
    });

    var groupedPunches = _.groupBy(formattedPunches, function(p) {
      return p.payPeriodNumber;
    });

    return groupedPunches;
  }

  $scope.togglePayPeriod = function(payPeriodNumber) {
    if ($scope.openPayPeriodNumber == payPeriodNumber) {
      $scope.openPayPeriodNumber = null;
    } else {
      $scope.openPayPeriodNumber = payPeriodNumber;
    }
  }

  $scope.getStartDateOfPayPeriodNumber = function(payPeriodNumber) {
    var weekNumber = payPeriodNumber * 2 + PAY_PERIOD_OFFSET;
    return $scope.formatDate($scope.getDateOfISOWeek(weekNumber));
  }

  $scope.getEndDateOfPayPeriodNumber = function(payPeriodNumber) {
    var weekNumber = (payPeriodNumber + 1) * 2 + PAY_PERIOD_OFFSET;
    var nextPeriodStartDay = $scope.getDateOfISOWeek(weekNumber);
    var thisPeriodEndDay = nextPeriodStartDay.getTime()-(24*3600000);
    // console.log('nextPeriodStartDay.getDate()', nextPeriodStartDay.getDate());
    return $scope.formatDate(thisPeriodEndDay);
  }

  function isValidDate(d) {
    return d instanceof Date && !isNaN(d);
  }

  $scope.getDateOfISOWeek = function(w) {
      var y = new Date().getFullYear();
      var simple = new Date(y, 0, 1 + (w - 1) * 7);
      var dow = simple.getDay();
      var ISOweekStart = simple;
      if (dow <= 4)
          ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
      else
          ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
      return ISOweekStart;
  }

  $scope.formatDate = function(date) {
    if (!date || !isValidDate(date)) {
      return null;
    }
    console.log('### formatting date: ' + date);
    return moment.utc(date).format('M/D');
  }

  $scope.formatDateWYear = function(date) {
    if (!date) {
      return null;
    }
    return moment.utc(date).format('M/D/YYYY');
  }

  $scope.formatTime = function(date) {
    if (!date) {
      return null;
    }
    return moment.utc(date).format('h:mm a');
  }

  $scope.formatHours = function(minutes) {
    if (typeof minutes != 'number') {
      return null
    }
    return (minutes / 60).toFixed(2)
  }

});

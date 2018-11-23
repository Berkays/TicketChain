App = {
  web3Provider: null,
  contracts: {},

  init: async function () {

    //TODO: List organizations
    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('Attend.json', function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var AttendArtifact = data;
      App.contracts.Attend = TruffleContract(AttendArtifact);

      App.contracts.Attend.setProvider(App.web3Provider);

      return App.markAttended();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-attend', App.handleAttend);
    $(document).on('click', '#orgAddBtn', App.handleAddOrg);
    $(document).on('click', '#orgListBtn', App.handleListOrg);
  },

  markAttended: function (organizations, account) {
    console.log("Mark attendend.");
    // var adoptionInstance;

    // App.contracts.Adoption.deployed().then(function (instance) {
    //   adoptionInstance = instance;

    //   return adoptionInstance.getAdopters.call();
    // }).then(function (adopters) {
    //   for (i = 0; i < adopters.length; i++) {
    //     if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
    //       $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
    //     }
    //   }
    // }).catch(function (err) {
    //   console.log(err.message);
    // });
  },

  handleAttend: function (event) {
    event.preventDefault();

    var orgId = parseInt($(event.target).parent().data('id'));
    // var petId = parseInt($(event.target).data('id'));

    // var adoptionInstance;

    // web3.eth.getAccounts(function (error, accounts) {
    //   if (error) {
    //     console.log(error);
    //   }

    //   var account = accounts[0];

    //   App.contracts.Adoption.deployed().then(function (instance) {
    //     adoptionInstance = instance;

    //     // Execute adopt as a transaction by sending account
    //     return adoptionInstance.adopt(petId, { from: account });
    //   }).then(function (result) {
    //     return App.markAdopted();
    //   }).catch(function (err) {
    //     console.log(err.message);
    //   });
    // });
  },

  handleAddOrg: function (event) {
    event.preventDefault();

    var org = { orgName: $("#orgName").val(), maxAttendance: 100 };
    var attendInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Attend.deployed().then(function (instance) {
        attendInstance = instance;

        return attendInstance.addOrganization(org.orgName, org.maxAttendance);
      }).then(function () {
        console.log("Organization added: " + org.orgName + ", " + org.maxAttendance);
        //App.refreshOrganizations();
      }).catch(function (err) {
        console.log(err.message);
      });
    });
  },

  handleListOrg: function () {
    var attendInstance;
    App.contracts.Attend.deployed().then(function (instance) {
      attendInstance = instance;

      return attendInstance.getOrganizationCount();
    }).then(async function (orgCount) {
      var orgList = [];

      for (let index = 1; index < orgCount + 1; index++) {
        var org = await attendInstance.getOrganization(index)
        orgList[index] = org;
      }
      return orgList;
    }).then(function (orgList) {
      $("#orglist").empty();
      console.log(orgList);
      orgList.forEach(org => {
        console.log(org);
        $("#orgList").append(
          $("<li>").attr("id", org[0]).attr("class", "list-group-item").text(org[0]).append(
            $("<button>").attr("type", "button").attr("class", "btn btn-primary pull-right .btn-attend").text("Attend")));
      });
      if (orgList.length != 0) {
        $("#orgListStatus").hide();
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});

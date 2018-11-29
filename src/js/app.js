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

            return App.listOrganizations();
        });

        return App.bindEvents();
    },

    bindEvents: function () {
        $(document).on('click', '.btn-attend', App.handleAttend);
        $(document).on('click', '#addOrg_btn', App.handleAddOrg);
        $(document).on('click', '#listOrg_btn', App.handleListOrg);
    },

    handleAttend: function (event) {
        event.preventDefault();


        var orgId = $(event.target).parent().attr('id');
        console.log(orgId);

        var attendInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error)
                console.log(error);

            var account = accounts[0];

            App.contracts.Attend.deployed().then(function (instance) {
                attendInstance = instance;

                return attendInstance.AttendOrganization(orgId, { from: account });
            }).then(function (result) {
                $(event.target).text("Attending Organization");
                return 1;
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    handleAddOrg: function (event) {
        event.preventDefault();

        var org = {
            name: $("#addOrg_name").val(),
            maxAttendance: $("#addOrg_attendanceLimit").val(),
            date: Date.parse($("#addOrg_date").val())
        };
        var attendInstance;

        web3.eth.getAccounts(function (error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.Attend.deployed().then(function (instance) {
                attendInstance = instance;
                console.log(org);
                return attendInstance.addOrganization(org.name, org.maxAttendance,org.date);
            }).then(function () {
                console.log("Organization added: " + org.name + ", " + org.maxAttendance + ", " + org.date);
            }).catch(function (err) {
                console.log(err.message);
            });
        });
    },

    handleListOrg: function () {
        event.preventDefault();

        App.listOrganizations();
    },

    listOrganizations: function () {
        var attendInstance;
        App.contracts.Attend.deployed().then(async function (instance) {
            attendInstance = instance;
            return attendInstance.getOrganizationCount.call(); //Return Organization Count
        }).then(async function (orgCount) {
            var orgList = [];

            console.log("Count: " + orgCount);
            for (let index = 0; index < orgCount; index++) {
                var org = await attendInstance.getOrganization.call(index + 1);
                orgList[index] = org;
            }
            return orgList;
            // return attendInstance.getOrganization.call(1);
        }).then(function (orgList) {
            if (orgList.length == 0) {
                $("#listOrg_status").show();
                return;
            }
            else {
                $("#listOrg_status").hide();
            }

            $("#listOrg_list").empty(); //Clear html list

            orgList.forEach(org => {
                var orgName = org[0];
                var orgId = org[1];
                var orgAttendance = web3.fromWei(org[2],'wei').toNumber();
                var orgMaxAttendance = web3.fromWei(org[3],'wei').toNumber();
                var orgDate = new Date(web3.fromWei(org[4],'wei').toNumber());
                App.generateListItem(orgName, orgId, orgAttendance, orgMaxAttendance, orgDate);
            });

        }).catch(function (err) {
            console.log(err.message);
        });
    },

    generateListItem: function (orgName, orgId, orgAttendance, orgMaxAttendance, orgDate) {
        $("#listOrg_list").append(
            $("<li>").attr("id", orgId).attr("class", "list-group-item").append(
                $("<div>").attr("class", "d-flex align-items-center").append(
                    $("<span>").attr("class", "mr-auto p-1 flex-column").append(
                        $("<div>").attr("class", "p-1").text("Name: " + orgName)).append(
                            $("<div>").attr("class", "p-1").text("Attendance: " + orgAttendance + "/" + orgMaxAttendance)).append(
                                $("<div>").attr("class", "p-1").text("Date: " + orgDate))).append(
                                    $("<button>").attr("type", "button").attr("class", "btn btn-primary p-2 btn-attend").text("Attend"))));
    }

}; //End of App

$(function () {
    $(window).load(function () {
        App.init();
    });
});

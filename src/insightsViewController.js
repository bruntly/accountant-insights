define([
    "dojo/_base/declare", 
    "dojo/when",
    "dojo/on",
    "dojo/dom-construct", 
     "dgrid/OnDemandGrid",  
    "neo/BaseViewController",
    "qbo/services/AccountService",
    "neo/BaseService",
    "./InsightsModel",
    "dojo/text!./templates/Insights.html",
    "dojox/html/entities",
    "neo/data/types/amount",
    "dgrid/Selection",
    "dgrid/selector",
    "xstyle/css!./templates/Insights.css"
   ], function(declare, when, on, domConstruct, OnDemandGrid, BaseViewController,  AccountService, BaseService, InsightsModel, template, htmlEntities, amount, Selection, selector) {

 	return declare([BaseViewController, BaseService], {

 		templateString: template,

		constructor: function(args) {
            this.model = new InsightsModel();
            this.accountService = new AccountService();

        },

        loadAllAccounts: function () {
            var dataURL = this.getUIServiceUrl("lists/account/list");
            return this.doXHRGet(dataURL);
        },

 		startup: function () {
            this.inherited(arguments);
                this.initGrid();
 			return when(this.loadAllAccounts(), function(response) {
                var bankBalance = 0, apBalance =0;
                if (response && response.length > 0) {
                    this.model.set("allAccounts", response);
                    this.model.initAccounts(response);
                    for (var i=0; i < response.length; i++) {
                        var account = response[i];
                        var balance = parseFloat(account.balance);
                        if (account.type ==="Bank") {
                            bankBalance = bankBalance + balance;
                            console.log(account.name + " has balance " + account.balance);
                        }
                        if (account.type ==="Accounts payable (A&#x2F;P)") {
                            apBalance = apBalance + balance;
                            console.log(account.name + " has balance " + account.balance);
                        }
                        
                    }
                    console.log("Bank Balances: " + bankBalance);
                    console.log("AP Balances: " + apBalance);
                    this.model.set("bankBalances", "Bank Balances: $ " + bankBalance.toFixed(2));
                    this.model.set("apBalances", "AP Balances: $ " + apBalance.toFixed(2));
                    this.model.set("bankBalance", bankBalance);
                    this.model.set("apBalance", apBalance);

                    var ratio = parseInt(localStorage.getItem("bankAPratio"));

                    if (!ratio) {
                        ratio = 100;
                    }
                    this.model.set("ratio", ratio);
                    if (this.model.bankBalance * (ratio / 100) > this.model.apBalance) {
                        this.model.set("showHappy", true);
                    }

                }

 			}.bind(this));
        
 		},

        ratioChanged: function(val ) {
            var ratio = parseInt(val.srcElement.value);

            console.log("ratio changed: " + val.srcElement.value);
            localStorage.setItem("bankAPratio", ratio);
            this.model.set("ratio", ratio);

            if (this.model.bankBalance * (ratio / 100) > this.model.apBalance) {
                this.model.set("showHappy", true);
            }
            else {
                this.model.set("showHappy", false);
            }

        },

        accountsChanged: function(val ) {
            var accounts = val.srcElement.value;
            var splitAccounts = accounts.split(/[ ,]+/);

            console.log("accounts: " + accounts);
            //localStorage.setItem("bankAPratio", ratio);
            this.model.set("watchAccounts", splitAccounts);
            this.model.initAccounts(this.model.get("allAccounts"));
            this.accountGrid.refresh();
        },

        initGrid: function () {
            this.accountGrid = new OnDemandGrid({
                noDataMessage: "No Accounts selected",
                columns: [
                    {label: "Account", field: "name", formatter: function(item){
                        return htmlEntities.decode(item, [["/", "#x2F"]]);
                    }.bind(this)},
                    {label: "Balance", field: "balance", formatter: function (item) {
                        return new amount.Money(item).toCurrencyString();
                    }.bind(this)}
                ],
                store: this.model.accountsStore
            }, this._accountingGridDiv);

            this.accountGrid.on("dgrid-select", function(event){
                // Get the rows that were just selected
                var rows = event.rows;
                rows.forEach(function(row) {
                    this.model.accountData.accountDetails.forEach(function(account){
                        if (account.accountId.toString() === row.id) {
                            account.selected = true;
                        }
                    });
                }.bind(this));
            }.bind(this));

            this.accountGrid.on("dgrid-deselect", function(event){
                // Get the rows that were just selected
                var rows = event.rows;
                rows.forEach(function(row) {
                    this.model.accountData.accountDetails.forEach(function(account){
                        if (account.accountId.toString() === row.id) {
                            account.selected = false;
                        }
                    });
                }.bind(this));
            }.bind(this));

        }
 		 
 	});
 });
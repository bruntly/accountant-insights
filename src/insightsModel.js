define([
    "dojo/_base/declare", 

    "neo/BaseModel",
    "dojo/store/Observable",
    "dojo/store/Memory",

   ], function(declare, BaseModel, Observable, Memory) {

 	return declare([BaseModel], {
 		dataFields: [
            {name: "bankBalances"},
            {name: "apBalances"},
            {name: "showHappy", value: false},
            {name: "accountsStore"},
            {name: "watchAccounts"}

        ],
        constructor: function () {
            this.inherited(arguments);
            this.accountsStore = this.createStore([]);
        },

        initAccounts: function(accounts) {
        	var i = 0, j=0;
     		var results = this.accountsStore.query();
     		this.accountsStore.remove(0);
  
        	for (; i < accounts.length; i++) {
        		if (this.watchAccounts && this.watchAccounts.length > 0){
	        		for (; j < this.watchAccounts.length; j++) {
	        			if (accounts[i].name.indexOf(this.watchAccounts[j]) > -1) {
	        				this.accountsStore.put(accounts[i], {overwrite: true});
	        			}
	        			break;
	        		}
	        	}
	        	else {
	        		if (accounts[i].name.indexOf("Uncategorized") > -1) {
        				this.accountsStore.put(accounts[i], {overwrite: true});
        			}
	        	}

            }
        },
        createStore: function (data) {
            var memory = new Memory({data: data});
            return new Observable(memory);
        }

    });
 });
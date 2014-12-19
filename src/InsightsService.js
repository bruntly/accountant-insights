define([
    "dojo/_base/declare", 
    "neo/BaseService"
   ], function(declare, BaseService) {

    return declare([BaseService], {
        loadAllAccounts: function () {
            var dataURL = this.getUIServiceUrl("lists/account/list");
            return this.doXHRGet(dataURL);
        }
    });
 });
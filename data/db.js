var AWS = require("aws-sdk");

AWS.Config.update({
    region: "us-east-2",
    endpoint: "http://locahost:8000"
});

const PLAYERS = "Players";
const RACES = "Races";
const SERVER_DATA = "ServerData";

const dynamo = new AWS.DynamoDB();

exports.init = () => {

}
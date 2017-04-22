# Voting App

This is a full stack social poll sharing app. 

## User Stories

* As an authenticated user, I can keep my polls and come back later to access them.
* As an authenticated user, I can share my polls with my friends.
* As an authenticated user, I can see the aggregate results of my polls.
* As an authenticated user, I can delete polls that I decide I don't want anymore.
* As an authenticated user, I can create a poll with any number of possible items.
* As an unauthenticated or authenticated user, I can see and vote on everyone's polls.
* As an unauthenticated or authenticated user, I can see the results of polls in chart form.
* As an authenticated user, if I don't like the options on a poll, I can create a new option.


## Stack

* **Front End:** Bootstrap, Handlebars, and ChartJS
* **Back End:** Node, Express, Mongo, and Mongoose 
* **Authentication** Passport and bcryptjs

## Usage

I published the app to Heroku, and you can access it [here](https://freecodecamp-voting.herokuapp.com/).  It may take a few seconds to wake the dyno if it's sleeping.

[Here is a sample poll](https://freecodecamp-voting.herokuapp.com/polls/p9r25), which you can vote on without an account.

## Acknowledgments 

* Thanks to [Brad Traversy](https://github.com/bradtraversy/loginapp) for his simple login tutorial, which I followed for the local authentication portion of the app.
# Simple Twitter Connector
This is a PHP, MySQL, and JavaScript Twitter feed reader. It makes use of
J7mbo's Twitter API [https://github.com/J7mbo/twitter-api-php]

## Requirements

- jQuery (vX.X included) - For the JavaScript class.
- PHP - For connecting to the Twitter API.
- MySQL - For storing the tweets.

## Setup

Run the database patch from your server on the target MySQL database. This
patch will create a `tweets` table used to store the accessed tweets to
prevent hitting the Twitter API request limit.
```
cat mysql/twitter_connector.sql | mysql <your_database_name>
```

Include the stc.main.js file in your HTML page
```
<script type="text/javascript" src="/path/to/stc.main.js"></script>
```

Instantiate the `TwitterConnector` class in your JavaScript and initialize
it with your configuration.
```
// instantiate and initialize
var tc = new window.TwitterConnector();
tc.init({
    onComplete: myFunctionName
});

// request the tweets
tc.getTweets();
```

---

# MySQL

We are using a database to store the requested tweets to prevent hitting the
Twitter API request limit. The tweets are stored as a JSON string in the `tweets`
table created by the database patch.

---

# JavaScript Configuration

The configuration for the class. These can be overridden on init.
  - requestType: The type of ajax request [GET|POST]
      Default - POST

  - format: The return format of the request.
      Default - json

  - url: The base Twitter API url from which to retrieve tweets.

  - getField: The query string for the url. This should match a
      valid query string for the API.
      Default - johngieselmann (me)

  - onComplete: The function called once all tweets have been
      pulled and assigned to the class.
      Param 1 - An array of tweet objects return from the request.
      Param 2 - An array of html as a string for each tweet.
      Default - An anonymous function that console logs results.

  - screenName: The screen name that is the target of all the
      twitter icons... probably the same user for which we are
      fetching tweets.
      Default - johngieselmann (me)

  - display: The type of display style to render [tile|row].
      Default - tile


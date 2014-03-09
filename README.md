# Simple Twitter Connector
This is a PHP, MySQL, and JavaScript Twitter feed reader. It makes use of
the PHP Twitter API connector created by
[J7mbo](https://github.com/J7mbo/twitter-api-php). The JavaScript class reads
the tweet objects returned from the Twitter API and builds an HTML string
for each of them.

## Requirements

- Twitter App with oath access.
- jQuery v1.11.0+ - For the JavaScript class.
- PHP v5.3.10+ - For connecting to the Twitter API.
- MySQL v5.5.34+ - For storing the tweets.

## Setup

Replace the values in the `php/connect.php` file with the values corresponding
to your database setup and Twitter app.
```
$mysqli = new mysqli(
    "host",
    "username",
    "password",
    "database"
);

$oathInfo = array(
    "oauth_access_token"        => "xxxx",
    "oauth_access_token_secret" => "xxxx",
    "consumer_key"              => "xxxx",
    "consumer_secret"           => "xxxx",
);
```

Run the database patch from your server on the target MySQL database. This
patch will create a `tweets` table used to store the accessed tweets to
prevent hitting the Twitter API request limit.
```
cat mysql/twitter_connector.sql | mysql <your_database_name>
```

Include the CSS files in your HTML.
```
<link type="text/css" rel="stylesheet" href="css/reset.css" />
<link type="text/css" rel="stylesheet" href="css/ssc.main.css" />
```

Include the JavaScript files in your HTML.
```
<script type="text/javascript" src="/js/jquery.js"></script>
<script type="text/javascript" src="/js/stc.main.js"></script>
```

Instantiate the `TwitterConnector` class in your JavaScript and initialize
it with your configuration.
```
// create the connector configuration, this mirrors the default
var tcConfig = {
    // twitter api url info
    "requestType" : "GET",
    "format"      : "json",
    "url"         : "https://api.twitter.com" // base url
        + "/1.1"                              // version
        + "/statuses"                         // resource family
        + "/user_timeline"                    // resource
        + ".",                                // format
    "getField"    : "?screen_name=johngieselmann",
    "onComplete"  : function(tweetsHtml, tweets){
        console.log(tweetsHtml, tweets);
    },
    "screenName"  : "johngieselmann",

    // helper configuration
    "helperPath"  : "php/twitter_connector.php"
};

// instantiate and initialize
var tc = new window.TwitterConnector();
tc.init(tcConfig);

// request the tweets
tc.getTweets();
```

# JavaScript Configuration

The configuration for the class. These can (and should be) be changed with
initialization.

- **format**: The return format of the request.
    - **Default** - "json"

- **getField**: The query string for the url. This should match a
    valid query string for the API.
    - **Default** - johngieselmann (me)

- **onComplete**: The function called once all tweets have been
    pulled and assigned to the class.
    - **Param 1** - An array of html as a string for each tweet.
    - **Param 2** - An array of tweet objects return from the request.
    - **Default** - An anonymous function that console logs results.

- **requestType**: The type of ajax request [ "GET" | "POST" ]
    - **Default** - "POST"

- **screenName**: The screen name that is the target of all the
    twitter icons... probably the same user for which we are
    fetching tweets.
    - **Default** - johngieselmann (me)

- **url**: The base Twitter API url from which to retrieve tweets.

# MySQL

We are using a database to store the requested tweets to prevent hitting the
Twitter API request limit. The tweets are stored as a JSON string in the `tweets`
table created by the database patch.


<?php

// connect to the mysql database via mysqli
$mysqli = new mysqli(
    "host",
    "username",
    "password",
    "database"
);

// set up the oauth information for connecting to the API
$oathInfo = array(
    "oauth_access_token"        => "xxxx",
    "oauth_access_token_secret" => "xxxx",
    "consumer_key"              => "xxxx",
    "consumer_secret"           => "xxxx",
);

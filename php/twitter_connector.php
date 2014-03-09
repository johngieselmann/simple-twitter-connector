<?php
/**
 * It's procedural, big whoop, wanna fight about it? For this to work, there
 * needs to be data posted to the tcConfig key that contains the following:
 *   $tcConfig = array (
 *       "requestType" => "GET" || "POST",
 *       "url"         => "https://api.twitter.com/...",
 *       "getField"    => "?screen_name=codebac",
 *   );
 *
 * @author JohnG <john.gieselmann@gmail.com>
 */
require_once("TwitterAPIExchange.php");
require_once("connect.php");

$tdb = array(
    "table" => "tweets",
);

// get the current time and one hour ago
$time = time();
$lessHour = $time - 3600;
$hourAgo = date("Y-m-d H:i:s", $lessHour);
$now = date("Y-m-d H:i:s", $time);

// see if we need to get the most recent tweets
$getRecent = true;
$recentSql = "SELECT * FROM {$tdb["table"]} ORDER BY id DESC LIMIT 1";

if ($rows = $mysqli->query($recentSql)) {

    // just use the first found row
    while ($row = $rows->fetch_object()) {
        $createdTime = strtotime($row->created);
        $tweets = $row->tweets;
        break;
    }

    // do not get the tweets if it has been less than 15 minutes
    if ($createdTime) {
        $diff = $time - $createdTime;
        if ($diff < 900) {
            $getRecent = false;
        }
    }
}

// TESTING, uncomment below to automatically pull the most recent
//$getRecent = true;

if ($getRecent && isset($_POST["tcConfig"])) {

    // initialize the twitter api exchange class with the codebac oauth
    try {
        $tc = new TwitterAPIExchange($oauthInfo);
    } catch (Exception $e) {
        $msg = $e->getMessage();
        break;
    }

    // set the parameters for building the request
    $tcConfig = $_POST["tcConfig"];
    foreach ($tcConfig as $key => $value) {
        $$key = $value;
    }

    // get the tweets
    $tweets = $tc->setGetfield($getField)
        ->buildOauth($url, $requestType)
        ->performRequest();


    // update the database
    $cleanTweets = $mysqli->escape_string($tweets);
    $insert = "INSERT INTO {$tdb["table"]} "
        . "VALUES (NULL, '{$cleanTweets}', '{$now}')";
    $insSuccess = $mysqli->query($insert);
}

// let the user know if we don't have any tweets
if (empty($tweets)) {
    $out = json_encode(array(
        "error"   => 1,
        "message" => $msg
            ? $msg
            : "No tweets.",
        "tweets"  => array(),
    ));
} else {
    $out = json_encode(array(
        "error"   => 0,
        "message" => "Got tweets.",
        "tweets"  => $tweets,
    ));
}

// close the mysql connection
$mysqli->close();

echo $out;
die();

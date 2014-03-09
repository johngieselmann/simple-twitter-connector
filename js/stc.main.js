(function(window, document, $, undefined){

    function TwitterConnector() {
        var self = this;

        /**
         * The configuration for the class. These can be overridden on init.
         *   - requestType: The type of ajax request [GET|POST]
         *       Default - POST
         *
         *   - format: The return format of the request.
         *       Default - json
         *
         *   - url: The base Twitter API url from which to retrieve tweets.
         *
         *   - getField: The query string for the url. This should match a
         *       valid query string for the API.
         *       Default - johngieselmann (me)
         *
         *   - onComplete: The function called once all tweets have been
         *       pulled and assigned to the class.
         *       Param 1 - An array of tweet objects return from the request.
         *       Param 2 - An array of html as a string for each tweet.
         *       Default - An anonymous function that console logs results.
         *
         *   - screenName: The screen name that is the target of all the
         *       twitter icons... probably the same user for which we are
         *       fetching tweets.
         *       Default - johngieselmann (me)
         *
         *   - display: The type of display style to render [tile|row].
         *       Default - tile
         */
        this.config = {
            // twitter api url info
            "requestType" : "GET",
            "format"      : "json",
            "url"         : "https://api.twitter.com" // base url
                + "/1.1"                              // version
                + "/statuses"                         // resource family
                + "/user_timeline"                    // resource
                + ".",                                // format
            "getField"    : "?screen_name=johngieselmann",
            "onComplete"  : function(tweets, tweetsHtml){
                console.log(tweets, tweetsHtml);
            },
            "screenName" : "johngieselmann",

            // style settings
            "display"     : "tile"
        };


        /**
         * The location of the PHP file.
         * @var str url
         */
        this.connectorUrl = "helpers/twitter_connector.php";

        /**
         * The array of tweet objects.
         * @var arr tweets
         */
        this.tweets = [];

        /**
         * The html for each tweet.
         * @var arr tweetsHtml
         */
        this.tweetsHtml = [];

        /**
         * Set some keys for replacing pieces of tweets in certain places
         * in the HTML.
         * @var obj placement
         */
        this.placement = {
            "start": "<%start%>",
            "end":   "<%end%>"
        };

        /**
         * The templates for the various types of views.
         * @var obj templates
         */
        //jam
        this.dom = {
            // the html for the entities
            "hashtags" : {
                "el"       : "a",
                "attr"     : {
                    "class"  : "stc-hashtag",
                    "href"   : "http://twitter.com/hashtag/<%hashText%>",
                    "target" : "_blank"
                },
                "children" : [
                    "symbolWrap",
                    "linkText"
                ]
            },
            "media" : {
                "photo": {
                    "el"   : "img",
                    "attr" : {
                        "class" : "stc-photo"
                    }
                 },
                 "video": {
                    "el"   : "video",
                    "attr" : {
                        "class" : "stc-video"
                    }
                 }
            },
            "symbols" : {
                "el"   : "a",
                "attr" : {
                    "class" : "stc-symbol"
                }
            },
            "urls" : {
                "el"   : "a",
                "attr" : {
                    "class"  : "stc-url",
                    "href"   : "<%expanded_url%>",
                    "target" : "_blank"
                }
            },
            "user_mentions" : {
                "el"   : "a",
                "attr"     : {
                    "class"  : "stc-mention",
                    "href"   : "http://twitter.com/<%screenName%>",
                    "target" : "_blank"
                },
                "children" : [
                    "symbolWrap",
                    "linkText"
                ]
            },

            // entity children
            "symbolWrap" : {
                "el"   : "s",
                "attr" : false
            },
            "linkText" : {
                "el"   : "b",
                "attr" : false
            },

            // the full twitter element
            "container" : {
                "el"       : "div",
                "attr"     : {
                    "class" : "stc-container stc-" + self.config.display
                },
                "children" : [
                    "icon",
                    "tweet",
//                    "media",
                    "actions"
                ]
            },
            "icon" : {
                "el"   : "div",
                "attr" : {
                    "class"  : "stc-icon"
                },
                "children" : [
                    "iconLink"
                ]
            },
            "iconLink" : {
                "el"   : "a",
                "attr" : {
                    "class" : "stc-fa fa-twitter",
                    "href"   : "http://twitter.com/" + self.config.screenName,
                    "target" : "_blank"
                }
            },
            "tweet" : {
                "el"      : "p",
                "attr"    : {
                    "class" : "stc-tweet"
                }
            },
            "media" : {

            },
            "actions": {
                "el"   : "div",
                "attr" : {
                    "class" : "stc-actions"
                }
            }
        };

        this.init = function(options) {

            // assign the options to the config
            options = options || {};
            for (var i in options) {
                self.config[i] = options[i];
            }
        };

        /**
         * Get the tweets.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @return void
         */
        this.getTweets = function() {

            $.ajax({
                url:      self.connectorUrl,
                type:     "POST",
                data:     {
                    "tcConfig": {
                        "requestType" : self.config.requestType,
                        "url"         : self.config.url + self.config.format,
                        "getField"    : self.config.getField
                    }
                },
                dataType: self.config.format,
                success:  self.getSuccess,
                error:    self.getError,
                complete: self.getComplete
            });
        };

        /**
         * Set the tweet properties after successfully getting the tweets.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param str result The result from pulling the tweets formatted
         * as JSON.
         *
         * @return void
         */
        this.getSuccess = function(result) {

            // if there was an error, throw an error and stop
            if (result.error) {
                self.throwError(result.message);
                return false;
            }

            // set the tweets object and the HTML for the tweets
            self.tweets = JSON.parse(result.tweets);
            for (var i in self.tweets) {
                self.tweetsHtml[i] = self.buildTweet(self.tweets[i]);
            }

            // call the onComplete callback
            if (typeof self.config.onComplete === "function") {
                self.config.onComplete(self.tweets, self.tweetsHtml);
            }
        };

        /**
         * Build out the HTML for the tweet to account for the entities.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param obj tweet The tweet object from which to build the HTML.
         *
         * @return str tweetHtml The HTML for the tweet.
         */
        this.buildTweet = function(tweet) {

            // build the text content first
            var text = tweet.text;

            // keep track of each entity with a key (text to be replaced) and
            // the content to swap in
            var entities = {
//                "replaceKey": "replaceContent"
            };

            // consider retweets for replacing entities
            if (typeof retweeted_status === "object") {
                var replaceEntities = $.extend(
                    {},
                    tweet.entities,
                    retweeted_status.entities
                );
            } else {
                var replaceEntities = tweet.entities;
            }

            // set up all the entities within the tweet
            for (var entityName in replaceEntities) {
                var entity = replaceEntities[entityName];

                // loop through this entity and set up the replacements for
                // each of this type of entity
                if (entity.length) {
                    for (var j in entity) {

                        // get the replacement key and the content
                        var replaceKey = self.getReplaceKey(
                            entityName,
                            entity[j]
                        );

                        var replaceContent = self.buildEntity(
                            entityName,
                            entity[j]
                        );

                        entities[replaceKey] = replaceContent;
                    }
                }
            }

            // loop through the entities and swap them into the text
            var tweetHtml = tweet.text;
            for (var key in entities) {
                tweetHtml = tweetHtml.replace(key, entities[key]);
            }

            // now wrap the tweet in its container
            var tweetEl = self.buildElement(
                "container",
                {
                    "content-tweet": tweetHtml
                }
            );

            //console.log(tweet);

            return tweetEl;
        };

        /**
         * Build an HTML element from the dom template property. This is
         * built to be called recursively in order to add in the children
         * of the element as well.
         *
         * @param str domKey The key to get the right dom template.
         *
         * @param obj replace An object of keys and the values to replace
         * them with. The key should be a str, but will be replacing the
         * <%key%> placeholders in any dom element with the corresponding
         * value.
         *
         * The "content-<domKey>" key in the object is reserved for placing
         * content specific to the currently rendered element. This key is
         * in place because of recursive calling and needing to know when
         * to insert content and where. If "contentP" is not defined in
         * the dom object, the content is rendered before the children.
         *
         * @return str tag The completed tag.
         */
        this.buildElement = function(domKey, replace) {
            //jam

            // get the dom template
            var dom = self.dom[domKey];

            // set some default values to prevent errors
            replace = replace || {};
            var contentPos = typeof dom.content !== "undefined"
                ? dom.content
                : "before";

            // open the tag
            var tag = "<" + dom.el;

            for (var attr in dom.attr) {
                var attrVal = dom.attr[attr];

                // replace any values in the attributes that were passed
                // in
                for (var key in replace) {

                    // skip over the content replacements
                    if (key.match(/^content-/)) {
                        continue;
                    }

                    var placeholder = "<%" + key + "%>";
                    if (attrVal.match(placeholder)) {
                        attrVal = attrVal.replace(placeholder, replace[key]);
                    }
                }

                // now set the attribute and its value
                tag += " " + attr + "='" + attrVal + "'";
            }
            tag += ">";

            // insert the content before the children if there is anything
            // to be inserted and this element should have it before the
            // the children
            if (   typeof replace["content-" + domKey] !== "undefined"
                && contentPos === "before"
            ) {
                tag += replace["content-" + domKey];
            }

            // add in any children by recursively calling this function
            if (typeof dom.children !== "undefined") {
                for (var childKey in dom.children) {
                    var child = dom.children[childKey];

                    // build the child element with the original replace
                    // object, hopefully everything has been passed in that
                    // is needed
                    var childEl = self.buildElement(child, replace);
                    tag += childEl;

                }
            }

            // insert the content after the children if there is anything
            // to be inserted and this element should have it before the
            // the children
            if (   typeof replace["content-" + domKey] !== "undefined"
                && contentPos === "after"
            ) {
                tag += replace["content-" + domKey];
            }

            // close the tag
            tag += "</" + dom.el + ">";
            return tag;
        };

        /**
         * Build the twitter entities.
         */
        this.buildEntity = function(entityName, data) {
            switch (entityName) {
                case "hashtags":
                    var el = self.buildElement(
                        entityName,
                        {
                            "hashText"           : data.text,
                            "content-symbolWrap" : "#",
                            "content-linkText"   : data.text
                        }
                    );
                    break;

                case "user_mentions":
                    var el = self.buildElement(
                        entityName,
                        {
                            "screenName"         : data.screen_name,
                            "content-symbolWrap" : "@",
                            "content-linkText"   : data.screen_name
                        }
                    );
                    break;

                default:
                    var el = entityName;
            }

            return el;
        };

        /** 
         * Set the replacement key for an entity. This is the text we will
         * be replacing with html to make thinks like hashtags, mentions,
         * links, etc. functional when rendering the tweet.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param str entityName The name of the entity for which we are
         * getting the key.
         *
         * @param obj data The data associated with the entity.
         *
         * @return str key The replacement key.
         */
        this.getReplaceKey = function(entityName, data) {
            switch (entityName) {
                case "hashtags":
                    var key = "#" + data.text;
                    break;

                case "media":
                    var key = self.placement.end;
                    break;

                case "symbols":
                    var key = "???";
                    break;

                case "urls":
                    var key = data.url;
                    break;

                case "user_mentions":
                    var key = "@" + data.screen_name;
                    break;

                // nothing to replace
                default:
                    var key = false;
            }

            return key;
        };

        /**
         * The error callback for the ajax request pulling the tweets.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @params See jQuery <https://api.jquery.com/jQuery.ajax/>
         *
         * @return void
         */
        this.getError = function(jqXHR, textStatus, error) {
            // do nothing
        };

        /**
         * The callback for the ajax request pulling the tweets once the
         * request completes.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @params See jQuery <https://api.jquery.com/jQuery.ajax/>
         *
         * @return void
         */
        this.getComplete = function(jqXHR, textStatus) {
            // do nothing
        };

        /**
         * Our fake error throwing that really just logs things to the console.
         *
         * @author JohnG <john.gieselmann@gmail.com>
         *
         * @param str msg The message to send to the log.
         *
         * @return void
         */
        this.throwError = function(msg) {
            console.log("TwitterConnect Error:", msg);
        };
    }

    window.TwitterConnector = TwitterConnector;

}(window, document, jQuery, undefined));

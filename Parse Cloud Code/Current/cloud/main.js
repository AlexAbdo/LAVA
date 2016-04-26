//Parse.Cloud.define("locationGrab", function(request, response))
Parse.Cloud.afterSave(Parse.User, function(request) { // "request" (within function) is a user object
    if (request.object.get("checkpoint") === false) { // if mobile location has not already been updated
        console.log("entered into push function")
        //var pushQuery = new Parse.Query(Parse.Installation);
        //pushQuery.equalTo('objectId', 'wCUgpAsV86');
        Parse.Push.send( { //not sure if needed
            channels: ["global"],
            //where: pushQuery,
            data: {
                alert: "Parse is requesting your location" //Background notification
            }
        }, {useMasterKey: true,
            success: function() {
                console.log("Push sent successfully to" + pushQuery ) //Push was successful
            },
            error: function(error) {
                console.error("Error in sending push " + error.code + " : " + error.message) //handle error
                throw "Got an error " + error.code + " : " + error.message;
            }
        });
    } else {
        console.log("did not send push, checkpoint already set to true");
    }  
});

//What Bryton wrote:
Parse.Cloud.afterSave("MobUp", function(request) {
    query = new Parse.Query(Parse.User);
    query = query.equalTo("objectID",request.object.id);
    query.count( {
        success: function(count) {
            console.log("count success")
            //if the user that triggers the aftersave is a registered user
            if (count > 0) {
                var user = Parse.User.current();
                user.set("checkpoint", true);
                console.log("checkpoint set to true");
            }
            else
                console.log("Wrong user");
        }
    })
})


/* Changes made (as of 2/23/16) :
    - replaced .define with .afterSave
    - added Push.send (not sure if needed or if afterSave already does what is required)
    (as of 2/25/16)
    - queries removed, only push written
    (as of 3/1/16)
    - added Bryton's code to test "parse deploy"
    
TO DO:
    - Return a parameter to see if this afterSave is written correctly (a dummy parameter?)
    - Not much else afterwards. See where the project is headed in the next few days.
*/


/*
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

Parse.Cloud.define("userAv", function(request, status) {
  // Set up to modify user data
  Parse.Cloud.useMasterKey();
    var  name = request.params.name;

});
// send location for current parse user, send to cloud
Parse.Cloud.define("checkUser", function(request, response) {
    var user = request.user;
    console.log(user);
    response.success(user.get("name"));
});
*/




// Notes/Code for reference
        /*
    query1 = new Parse.query(Parse.User);
    query1.get("latitude")
    query1.find(
    {
        success: function(User)
        {
            
        },
        error: function(error)
        {
            console.error("Error " + error.code + " : " + error.message)
        }
    });

    query2 = new Parse.query("User");
    query2.get("longitude")
    query2.find(
    {
        success: function(User)
        {
            
        },
        error: function(error)
        {
            console.error("Error " + error.code + " : " + error.message)
        }
    });
*/
    /*
    
    Parse.Push.send( //not sure if needed
    {
      channels: [  ], //insert phone ID here 
      data:
        {
        alert: "This app is going to record your location."
        }
    },
    {
      success: function() 
        {
        // Push was successful
        },
      error: function(error) 
        {
        // Handle error
        }
    });*/
// });


//Notes/Code for reference:
/*
Parse.Cloud.afterSave("Comment", function(request) {
  query = new Parse.Query("Post");
  query.get(request.object.get("post").id, {
    success: function(post) {
      post.increment("comments");
      post.save();
    },
    error: function(error) {
      console.error("Got an error " + error.code + " : " + error.message);
    }
  });
});*/
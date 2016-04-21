    // An example Parse.js Backbone application based on the todo app by
    // [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses Parse to persist
    // the todo items and provide user authentication and sessions.
    $(function() {

        Parse.$ = jQuery;
        // Initialize Parse with your Parse application javascript keys
        Parse.initialize("50wKalUThxSOSKwL6LDa4w9VtpV4aDP7vteLOb7i",
            "Pbumwng3SVqiCjflBn9r0yTmfCuh4Cujc717hoz0");
        // Todo Model
        // ----------
        // Our basic Todo model has `content`, `order`, and `done` attributes.
        var Todo = Parse.Object.extend("Todo", {
            // Default attributes for the todo.
            defaults: {
                content: "empty todo...",
                done: false
            },
            // Ensure that each todo created has `content`.
            initialize: function() {
                if (!this.get("content")) {
                    this.set({
                        "content": this.defaults.content
                    });
                }
            },
            // Toggle the `done` state of this todo item.
            toggle: function() {
                this.save({
                    done: !this.get("done")
                });
            }
        });
        // This is the transient application state, not persisted on Parse
        var AppState = Parse.Object.extend("AppState", {
            defaults: {
                filter: "all"
            }
        });
        // Todo Collection
        // ---------------
        var TodoList = Parse.Collection.extend({
            // Reference to this collection's model.
            model: Todo,
            // Filter down the list of all todo items that are finished.
            done: function() {
                return this.filter(function(todo) {
                    return todo.get('done');
                });
            },
            // Filter down the list to only todo items that are still not finished.
            remaining: function() {
                return this.without.apply(this, this.done());
            },
            // We keep the Todos in sequential order, despite being saved by unordered
            // GUID in the database. This generates the next order number for new items.
            nextOrder: function() {
                if (!this.length) {return 1;}
                return this.last().get('order') + 1;
            },
            // Todos are sorted by their original insertion order.
            comparator: function(todo) {
                return todo.get('order');
            }
        });
        // Todo Item View
        // --------------
        // The DOM element for a todo item...
        var TodoView = Parse.View.extend({
            //... is a list tag.
            tagName: "li",
            // Cache the template function for a single item.
            template: _.template($('#item-template').html()),
            // The DOM events specific to an item.
            events: {
                "click .toggle": "toggleDone",
                "dblclick label.todo-content": "edit",
                "click .todo-destroy": "clear",
                "keypress .edit": "updateOnEnter",
                "blur .edit": "close"
            },
            // The TodoView listens for changes to its model, re-rendering. Since there's
            // a one-to-one correspondence between a Todo and a TodoView in this
            // app, we set a direct reference on the model for convenience.
            initialize: function() {
                _.bindAll(this, 'render', 'close', 'remove');
                this.model.bind('change', this.render);
                this.model.bind('destroy', this.remove);
            },
            // Re-render the contents of the todo item.
            render: function() {
                $(this.el).html(this.template(this.model.toJSON()));
                this.input = this.$('.edit');
                return this;
            },
            // Toggle the `"done"` state of the model.
            toggleDone: function() {
                this.model.toggle();
            },
            // Switch this view into `"editing"` mode, displaying the input field.
            edit: function() {
                $(this.el).addClass("editing");
                this.input.focus();
            },
            // Close the `"editing"` mode, saving changes to the todo.
            close: function() {
                this.model.save({
                    content: this.input.val()
                });
                $(this.el).removeClass("editing");
            },
            // If you hit `enter`, we're through editing the item.
            updateOnEnter: function(e) {
                if (e.keyCode == 13) {this.close();}
            },
            // Remove the item, destroy the model.
            clear: function() {
                this.model.destroy();
            }
        });
        //LAVA FUNCTIONS
        //Push-Time: after a successful login, this calculates the time to send a location to Parse and move to 
        // the next screen. Time is in milliseconds and fractional microseconds
        function PushTime(start, end) {
            var user = Parse.User.current();
            var diff = end - start;
            user.set("startTime_C", start);
            user.set("endTime_C", end);
            user.set("diffTime_C", diff);
            user.save(null, {
                success: function(user) {
                    console.log("Time Logged.");
                },
                error: function(user, error) {
                    console.log(
                        "Failed to create new object");
                }
            });
        }
        //Assign-Location: after a successful login, the user's latitude and longitude is grabbed from
        // their browser and pushed to their Parse.User instance.
        function AssignLocation(position) {
            var user1 = Parse.User.current();
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            user1.set("latitude", latitude);
            user1.set("longitude", longitude);
            user1.save(null, {
                success: function(user1) {
                    // execute any logic that should take place after the object is saved.  
                    console.log ("Location Assigned for "+ user1);
                },
                error: function(user1, error) {
                    console.log(
                        "Failed to create new object");
                }
            });
        }

    
      // Grabs mobile and browswer location, compares distances w/ haversine formula
      // if not in within 10 miles of each other, returns false
    function checkVerified() {
        Number.prototype.toRadians = function() {
                return this * Math.PI / 180;
            };
            // we need an aftersave function to query the database
            //if iOS distance has not been filled (ifNew, etc.)
            //wait

        var query = new Parse.Query(Parse.Installation);
        var user = Parse.User.current();
        user.fetch().then(function(fetchedUser) {
            var name = fetchedUser.getUsername();
            var C_lat = fetchedUser.get("latitude");
            var C_long = fetchedUser.get("longitude");
            var M_lat = fetchedUser.get("MLat");
            var M_long = fetchedUser.get("MLong");

            query.greaterThan('diffTime_C', 0);

        }, {
            success: function() {
                console.log("Grab was successful");
                var R = 6371000; // metres
                var Lat1= C_lat.toRadians();
                var Lat2 = M_lat.toRadians();
                var Lon1 = (M_lat - C_lat).toRadians();
                var Lon2= (M_long - C_long).toRadians();

                var a = Math.sin(Lon1 / 2) * Math.sin(Lon1 / 2) +
                    Math.cos(Lat1) * Math.cos(Lat2) *
                    Math.sin(Lon2 / 2) * Math.sin(Lon2 / 2);
                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

                var d = (R * c) / 1000;
                //checks if phone, computer location are within 10 miles of 
                // of each other
                if (d > 0.0348) {
                    ret = false;
                } else {
                    ret = true;
                }
                console.log(" distance is " + d + " " + ret);
            },
            error: function(error) {
                console.error(error);
            }
        });
    }



    function loginPass(verified, user) {
        user.set("Dist_Verified", verified);
        user.save();
        if (verified === true) {
            //     move to splash screen
            new ManageTodosView();
            self.undelegateEvents();
        } else {
            alert("User could not be authenticated.");
        }
    }

   

    // The Application
    // ---------------
    // The main view that lets a user manage their todo items
    var ManageTodosView = Parse.View.extend({
        // Our template for the line of statistics at the bottom of the app.
        statsTemplate: _.template($('#stats-template').html()),
        // Delegated events for creating new items, and clearing completed ones.
        events: {
            "keypress #new-todo": "createOnEnter",
            "click #clear-completed": "clearCompleted",
            "click #toggle-all": "toggleAllComplete",
            "click .log-out": "logOut",
            "click ul#filters a": "selectFilter"
        },
        el: ".content",
        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved to Parse.
        initialize: function() {
            var self = this;
            _.bindAll(this, 'addOne', 'addAll', 'addSome',
                'render', 'toggleAllComplete', 'logOut',
                'createOnEnter');
            // Main todo management template
            this.$el.html(_.template($(
                "#manage-todos-template").html()));
            this.input = this.$("#new-todo");
            this.allCheckbox = this.$("#toggle-all")[0];
            // Create our collection of Todos
            this.todos = new TodoList;
            // Setup the query for the collection to look for todos from the current user
            this.todos.query = new Parse.Query(Todo);
            this.todos.query.equalTo("user", Parse.User.current());
            this.todos.bind('add', this.addOne);
            this.todos.bind('reset', this.addAll);
            this.todos.bind('all', this.render);
            // Fetch all the todo items for this user
            this.todos.fetch();
            state.on("change", this.filter, this);
        },
        // Logs out the user and shows the login view
        logOut: function(e) {
            Parse.User.logOut();
            new LogInView();
            this.undelegateEvents();
            delete this;
        },
        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
            var done = this.todos.done().length;
            var remaining = this.todos.remaining().length;
            this.$('#todo-stats').html(this.statsTemplate({
                total: this.todos.length,
                done: done,
                remaining: remaining
            }));
            this.delegateEvents();
            this.allCheckbox.checked = !remaining;
        },
        // Filters the list based on which type of filter is selected
        selectFilter: function(e) {
            var el = $(e.target);
            var filterValue = el.attr("id");
            state.set({
                filter: filterValue
            });
            Parse.history.navigate(filterValue);
        },
        filter: function() {
            var filterValue = state.get("filter");
            this.$("ul#filters a").removeClass("selected");
            this.$("ul#filters a#" + filterValue).addClass(
                "selected");
            if (filterValue === "all") {
                this.addAll();
            } else if (filterValue === "completed") {
                this.addSome(function(item) {
                    return item.get('done');
                });
            } else {
                this.addSome(function(item) {
                    return !item.get('done');
                });
            }
        },
        // Resets the filters to display all todos
        resetFilters: function() {
            this.$("ul#filters a").removeClass("selected");
            this.$("ul#filters a#all").addClass("selected");
            this.addAll();
        },
        // Add a single todo item to the list by creating a view for it, and
        // appending its element to the `<ul>`.
        addOne: function(todo) {
            var view = new TodoView({
                model: todo
            });
            this.$("#todo-list").append(view.render().el);
        },
        // Add all items in the Todos collection at once.
        addAll: function(collection, filter) {
            this.$("#todo-list").html("");
            this.todos.each(this.addOne);
        },
        // Only adds some todos, based on a filtering function that is passed in
        addSome: function(filter) {
            var self = this;
            this.$("#todo-list").html("");
            this.todos.chain().filter(filter).each(function(
                item) {
                self.addOne(item);
            });
        },
        // If you hit return in the main input field, create new Todo model
        createOnEnter: function(e) {
            var self = this;
            if (e.keyCode != 13) {return;}
            this.todos.create({
                content: this.input.val(),
                order: this.todos.nextOrder(),
                done: false,
                user: Parse.User.current(),
                ACL: new Parse.ACL(Parse.User.current())
            });
            this.input.val('');
            this.resetFilters();
        },
        // Clear all done todo items, destroying their models.
        clearCompleted: function() {
            _.each(this.todos.done(), function(todo) {
                todo.destroy();
            });
            return false;
        },
        toggleAllComplete: function() {
            var done = this.allCheckbox.checked;
            this.todos.each(function(todo) {
                todo.save({
                    'done': done
                });
            });
        }
    });
    var LogInView = Parse.View.extend({
        events: {
            "submit form.login-form": "logIn",
            "submit form.signup-form": "signUp"

        },
        el: ".content",
        initialize: function() {
            _.bindAll(this, "logIn", "signUp");
            this.render();
        },
        logIn: function(e) {
            var self = this;
            var username = this.$("#login-username").val();
            var password = this.$("#login-password").val();
            Parse.User.logIn(username, password, {
                success: function(user) {
                    
                    var control_1= document.getElementById("c1").checked;
                    var control_2= document.getElementById("c2").checked;
                    var experiment = document.getElementById("c3").checked;
                    
                    var test1 = window.performance.now();
                    if (document.getElementById("c1").checked){
                        var test2 = window.performance.now();
                        PushTime(test1, test2);
                        new ManageTodosView();
                    }
                   else if(document.getElementById("c2").checked){
                        navigator.geolocation.getCurrentPosition(AssignLocation);
                       var test3 = window.performance.now();
                        PushTime(test1, test3);
                        new ManageTodosView();
                   }
                    else if (document.getElementById("c3").checked){
                        navigator.geolocation.getCurrentPosition(AssignLocation);
                        var verified = checkVerified();
                        loginPass(verified, user);
                        var test4 = window.performance.now();
                        PushTime(test1, test4);
                        new ManageTodosView();
                        
                    }
                    ManageTodosView();
                    delete self;
                },
                error: function(user, error) {
                    self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
                    self.$(".login-form button").removeAttr("disabled");
                }
            });
            
            this.$(".login-form button").attr("disabled",
                "disabled");
            return false;

        },
        signUp: function(e) {
            var self = this;
            var username = this.$("#signup-username").val();
            var password = this.$("#signup-password").val();
            Parse.User.signUp(username, password, {
                ACL: new Parse.ACL()
            }, {
                success: function(user) {
                    var start = window.performance
                        .now();
                    navigator.geolocation.getCurrentPosition(
                        AssignLocation);
                    new ManageTodosView();
                    self.undelegateEvents();
                    var end = window.performance
                        .now();
                    PushTime(start, end);
                    delete self;
                },
                error: function(user, error) {
                    self.$(
                            ".signup-form .error"
                        ).html(_.escape(error.message))
                        .show();
                    self.$(
                        ".signup-form button"
                    ).removeAttr("disabled");
                }
            });
            this.$(".signup-form button").attr("disabled",
                "disabled");
            return false;
        },
        render: function() {
            this.$el.html(_.template($("#login-template").html()));
            this.delegateEvents();
        }
    });
    // The main view for the app
    var AppView = Parse.View.extend({
        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#todoapp"),
        initialize: function() {
            this.render();
        },
        render: function() {
            if (Parse.User.current()) {
                new ManageTodosView();
            } else {
                new LogInView();
            }
        }
    });
    var AppRouter = Parse.Router.extend({
        routes: {
            "all": "all",
            "active": "active",
            "completed": "completed"
        },
        initialize: function(options) {},
        all: function() {
            state.set({
                filter: "all"
            });
        },
        active: function() {
            state.set({
                filter: "active"
            });
        },
        completed: function() {
            state.set({
                filter: "completed"
            });
        }
    });
    var state = new AppState; new AppRouter; new AppView; Parse.history.start();
    });
// Importing required libraries and modules for the application.
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require('express-session');
const connectSqlite3 = require('connect-sqlite3');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt'); //for the hash
const db = require('./db'); // Importing the database utility functions

const port = 8080;

// Set up the SQLite session store for express-session
const SQLiteStore = connectSqlite3(session);
const app = express();

// 2. MIDDLEWARE SETUP
app.use(cookieParser());
// Parses incoming request bodies (e.g., form data)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Serve static files (e.g., CSS, images) from the 'public' directory
app.use(express.static('public'));

// Session middleware to handle user sessions
app.use(session({
    store: new SQLiteStore({ db: "session-db.db" }),
    saveUninitialized: false,
    resave: false,
    secret: "qwertyuiopasdfghjkl@£$€{[]asdfghjkl@£$€{[]asdfghjkl@€"
}));
const Handlebars = require('handlebars');



// Middleware to populate view-related session data
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn;
    res.locals.name = req.session.name;
    res.locals.isAdmin = req.session.isAdmin;
    next();
})

// Setting up Handlebars as the view engine for the app
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');


/////////// Define routes for the application ////////////////////////////////

// Home route: Display home page
app.get('/', (req, res) => {
    /* Hashed password (GENERATE ONLY ONCE):  $2b$12$SooLffz3Prn9SQXRVj6Ym.KhU1e6AIm3jIsuy9UxcxKB5NZomj9Fe
    saltRounds = 12
    bcrypt.hash("totoro", saltRounds, function(err, hash) {
        if (err) {
            console.log("ERROR encrypting the password: ", err)

        } else {
            console.log("Hashed password (GENERATE ONLY ONCE): ", hash)
        }

    }); */
    res.render('home');
});

// gallery route: Display gallery page
app.get('/gallery', (req, res) => {
    db.getAllgallery((err, gallery) => {
        const model = {
            gallery: gallery
        }
        res.render('gallery', model);
    })
});

// Login route: Display login page

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;


    if (email == "marwanuft@gmail.com") {
        bcrypt.compare(password, "$2b$12$X4CIfFBdyWgvc.NZFRVBnOaSB/11Fs0ND0h8.yYHfCTdp4tt12B/y", function(err) {
            if (err) {
                console.log("shueib is logged in!");
                req.session.isAdmin = false;
                req.session.isLoggedIn = false;
                req.session.name = "SHUEIB";
                req.session.email = "marwanuft@gmail.com";
                res.redirect('/login');
            } else {
                console.log("wrong email or password");
                req.session.isAdmin = true;
                req.session.isLoggedIn = true;
                req.session.name = "";
                res.redirect('/');
            }
        })
    }
});




// Handle user logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.err("Error destroying session:", err);
            res.redirect('/');
        } else {
            console.log("User logged out.");
            res.redirect('/');
        }
    });
});

// Display all projects
app.get('/projects', (req, res) => {
    db.getmyAllProjects(function(error, theprojects) {
        const model = {
            dbError: error,
            theError: error,
            projects: theprojects || [],
            showCreateButton: req.session.isLoggedIn && req.session.isAdmin // New property added here
        };
        res.render('projects', model);
    });
});

// Handle the deletion of a specific project
app.post('/projects/:id/delete', (req, res) => {
    const id = req.params.id;
    if (req.session.isLoggedIn && req.session.isAdmin) {
        db.deletemyProjectById(id, function(error) {
            if (error) {
                const model = {
                    dbError: true,
                    theError: error
                };
                res.render('/', model);
            } else {
                res.redirect('/projects');
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Display the form for creating a new project
app.get('/projects/new', (req, res) => {
    if (req.session.isLoggedIn && req.session.isAdmin) {
        res.render('projectCreate');
    } else {
        res.redirect('/login');
    }
});

// Handle the creation of a new project
app.post('/projects/new', (req, res) => {
    const { projname, projyear, projdesc, projtype, projimg } = req.body;
    if (req.session.isLoggedIn && req.session.isAdmin) {
        db.createMyProject(projname, projyear, projdesc, projtype, projimg, (error) => {
            if (error) {
                console.log("ERROR: ", error);
                res.redirect('/projects/new');
            } else {
                console.log("Line added into project table!");
                res.redirect('/projects');
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Display the form to update a specific project
app.get('/projects/:id/update', (req, res) => {
    const id = req.params.id;

    db.getmyProjectById(id, (err, project) => {
        if (err) {
            console.log("ERROR: ", err);
        } else {
            const model = {
                dbError: false,
                theError: "",
                project: project,
                helpers: {
                    theTypeR(value) { return value == "Research"; },
                    theTypeT(value) { return value == "Teaching"; },
                    theTypeO(value) { return value == "Other"; },
                },
            };
            // Render the page with the model
            res.render("modifyProject", model);
        }
    })
})

// Handle the update of a specific project
app.post('/projects/:id/update', (req, res) => {
    const id = req.params.id;
    const { projname, projyear, projdesc, projtype, projimg } = req.body;
    if (req.session.isLoggedIn && req.session.isAdmin) {
        db.updatemyProjectById(id, projname, projyear, projdesc, projtype, projimg, (error) => {
            if (error) {
                console.log("ERROR: ", error);
            } else {
                console.log("Project updated in the database!");
                res.redirect('/projects');
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Display a specific project
app.get('/projects/:id', (req, res) => {
    const id = req.params.id;

    db.getmyProjectById(id, (err, project) => {
        if (err) {
            console.log("ERROR: ", err);
            const model = {
                dbError: true,
                theError: err,
            };
            res.render('projects', model); // Fall back to the projects list view if there's an error
        } else {
            const model = {
                dbError: false,
                theError: "",
                project: project, // pass the single project to the template
            };
            // Render the single project view
            res.render('project', model);
        }
    })
});


///////////////////////////////////////////////////////////////////////contact////////////////////////////////////////
// Display all contacts
app.get('/contacts', (req, res) => {
    if (req.session.isAdmin && req.session.isLoggedIn) {
        db.getAllContacts(function(error, theContacts) {
            const model = {
                dbError: error,
                theError: error,
                contacts: theContacts || [],
                showCreateButton: req.session.isLoggedIn && req.session.isAdmin
            };
            res.render('contact', model);
        });
    } else {
        res.redirect('/contacts/new');
    }
});

// Handle the deletion of a specific contact
app.post('/contacts/:id/delete', (req, res) => {
    const id = req.params.id;
    if (req.session.isLoggedIn && req.session.isAdmin) {
        db.deleteContactById(id, function(error) {
            if (error) {
                const model = {
                    dbError: true,
                    theError: error,
                };
                res.render('/', model);
            } else {
                res.redirect('/contacts');
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Display the form for creating a new contact
app.get('/contacts/new', (req, res) => {
    res.render('createContact');
});

// Handle the creation of a new contact
app.post('/contacts/new', (req, res) => {
    const { full_name, email, occupation } = req.body;
    db.createContact(full_name, email, occupation, (error) => {
        if (error) {
            console.log("ERROR: ", error);
            res.redirect('/contacts/new');
        } else {
            console.log("Contact added to the database!");
            res.redirect('/contacts');
        }
    });
});
// Display the form to update a specific contact
app.get('/contacts/:id/update', (req, res) => {
    const id = req.params.id;

    db.getContactById(id, (err, contact) => {
        if (err) {
            console.log("ERROR: ", err);
        } else {
            const model = {
                dbError: false,
                theError: "",
                contact: contact,
                helpers: {
                    eq(value) { return value == "Research"; },
                    eq(value) { return value == "Teaching"; },
                    eq(value) { return value == "Other"; },
                },
            };
            res.render("modifyContact", model);
        }
    })
})

// Handle the update of a specific contact
app.post('/contacts/:id/update', (req, res) => {
    const id = req.params.id;
    const { full_name, email, occupation } = req.body;
    if (req.session.isLoggedIn && req.session.isAdmin) {
        db.updateContactById(id, full_name, email, occupation, (error) => {
            if (error) {
                console.log("ERROR: ", error);
            } else {
                console.log("Contact updated in the database!");
                res.redirect('/contacts');
            }
        });
    } else {
        res.redirect('/login');
    }
});

// Display a specific contact
app.get('/contacts/:id', (req, res) => {
    const id = req.params.id;

    db.getContactById(id, (err, contact) => {
        if (err) {
            console.log("ERROR: ", err);
            const model = {
                dbError: true,
                theError: err,
            };
            res.render('contacts', model);
        } else {
            const model = {
                dbError: false,
                theError: "",
                contact: contact,
            };
            res.render('contact', model);
        }
    })
});

///////////////////////////////////////////////////////skills//////////////////////////////////////////////////////////////////////////

/* // Define the custom helper
Handlebars.registerHelper('eachArray', function(array, options) {
    let result = '';
    for (let i = 0; i < array.length; i++) {
        result += options.fn(array[i]);
    }
    return result;
});
 */

// Display all skills
app.get('/skills', (req, res) => {
    db.getAllSkills((error, skills) => {
        const model = {
            dbError: error,
            skills: skills || []
        };
        const stars = [1, 2, 3, 4, 5];
        model.skills.forEach(skill => {
            skill.skill_stars = stars.slice(0, skill.skill_stars);
        });
        res.render('skills', model);
    });
});



// 404 middleware for unmatched routes
app.use((req, res) => {
    res.status(404).render('404');
});
// Start the application server on the specified port
app.listen(port, () => {
    console.log(`Server running and listening on port ${port}...`);
});
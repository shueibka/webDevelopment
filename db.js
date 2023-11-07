const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('E-portfoilo.db');

db.run(`CREATE TABLE IF NOT EXISTS projects (
    pid INTEGER PRIMARY KEY AUTOINCREMENT,
    pname TEXT NOT NULL, 
    pyear INTEGER NOT NULL, 
    pdesc TEXT NOT NULL, 
    ptype TEXT NOT NULL, 
    pimgURL TEXT NOT NULL
    )`)

db.run(`CREATE TABLE IF NOT EXISTS contacts (
    contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    occupation TEXT NOT NULL
)`)

db.run(`CREATE TABLE IF NOT EXISTS skills (
    skill_id INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_name TEXT NOT NULL,
    skill_icon TEXT NOT NULL,
    skill_stars INTEGER NOT NULL
)`)
db.run(`CREATE TABLE IF NOT EXISTS gallery (
    gallery_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pimgURL TEXT NOT NULL
)`)






/* db.getmyProjects = function(callback) {
    const getProject = "select * from projects"
    db.all(getProject, function(err, row) {
        callback(err, row)
    })
} */


exports.getmyAllProjects = function(callback) {
    const query = "SELECT * FROM projects"

    db.all(query, function(err, rows) {
        callback(err, rows)
    })
}

exports.createMyProject = function(name, year, desc, type, image, callback) {
    const query = "INSERT INTO projects (pname, pyear, pdesc, ptype, pimgURL) VALUES (?,?,?,?,?)"
    const values = [name, year, desc, type, image]

    db.run(query, values, function(error) {
        callback(error)
    })
}

exports.getmyProjectById = function(projectId, callback) {
    const query = "SELECT * FROM projects WHERE pid = ? LIMIT 1";
    const values = [projectId];

    db.get(query, values, function(err, project) {
        callback(err, project);
    });
};



//For deleting Project
exports.deletemyProjectById = function(projectId, callback) {
    const query = "DELETE FROM projects WHERE pid=?";
    const values = [projectId];


    db.run(query, values, function(err) {
        callback(err);
    })
};


exports.updatemyProjectById = function(id, name, year, desc, type, img, callback) {
    const query = "UPDATE projects SET pname=?, pyear=?, pdesc=?, ptype=?, pimgURL=? WHERE pid=?"
    const values = [name, year, desc, type, img, id]

    db.run(query, values, function(error) {
        callback(error)    
    })
}

//////////////////////////////////////////////////contacts/////////////////////////////////////////////////////////////////

exports.getAllContacts = function(callback) {
    const query = "SELECT * FROM contacts";

    db.all(query, function(err, rows) {
        callback(err, rows);
    });
};

exports.createContact = function(fullName, email, occupation, callback) {
    const query = "INSERT INTO contacts (full_name, email, occupation) VALUES (?,?,?)";
    const values = [fullName, email, occupation];

    db.run(query, values, function(error) {
        callback(error);
    });
};

exports.getContactById = function(contactId, callback) {
    const query = "SELECT * FROM contacts WHERE contact_id = ? LIMIT 1";
    const values = [contactId];

    db.get(query, values, function(err, contact) {
        callback(err, contact);
    });
};

exports.deleteContactById = function(contactId, callback) {
    const query = "DELETE FROM contacts WHERE contact_id=?";
    const values = [contactId];

    db.run(query, values, function(err) {
        callback(err);
    });
};

exports.updateContactById = function(id, fullName, email, occupation, callback) {
    const query = "UPDATE contacts SET full_name=?, email=?, occupation=? WHERE contact_id=?";
    const values = [fullName, email, occupation, id];

    db.run(query, values, function(error) {
        callback(error);
    });
};
//////////////////////////////////////////////////skills/////////////////////////////////////////////////////////
exports.getAllSkills = function(callback) {
    const query = "SELECT * FROM skills";

    db.all(query, function(err, rows) {
        callback(err, rows);
    });
};

// Function to insert skills into the database
exports.insertSkills = function(callback) {
        const skills = [
            { id: 1, skillname: 'Javascript', skillicon: 'bx bxl-javascript bx-tada-hover', skillstars: 5 },
            { id: 2, skillname: 'React', skillicon: 'bx bxl-react bx-tada-hover', skillstars: 5 },
            { id: 3, skillname: 'HTML5', skillicon: 'bx bxl-html5 bx-tada-hover', skillstars: 5 },
            { id: 4, skillname: 'Node.js', skillicon: 'bx bxl-nodejs bx-tada-hover', skillstars: 5 }
        ];

        const insertQuery = 'INSERT OR IGNORE INTO skills (skill_id, skill_name, skill_icon, skill_stars) VALUES (?,?, ?, ?)';

        skills.forEach(skill => {
            db.run(insertQuery, [skill.id, skill.skillname, skill.skillicon, skill.skillstars], function(err) {
                if (err) {
                    return console.error('Error inserting skill:', err.message);
                }
                console.log(`Skill "${skill.skillname}" inserted into the database with ID ${this.lastID}`);
            });
        });
    }
    ////////////////////////////////////gallery////////////////////////////////
exports.getAllgallery = function(callback) {
    const query = "SELECT * FROM gallery";

    db.all(query, function(err, rows) {
        callback(err, rows);
    });
};

// Function to inse the database
exports.insertGallery = function(callback) {
    const gallery = [
        { gallery_id: 2, pimgURL: '/img/img-2.jpg', },
        { gallery_id: 3, pimgURL: '/img/img-5.jpg', },
        { gallery_id: 1, pimgURL: '/img/img-3.jpg', },
        { gallery_id: 4, pimgURL: '/img/img-9.jpg', }
    ];

    const insertQuery = 'INSERT OR IGNORE INTO gallery (gallery_id, pimgURL) VALUES (?,?)';

    gallery.forEach(picture => {
        db.run(insertQuery, [picture.gallery_id, picture.pimgURL], function(err) {
            if (err) {
                return console.error('Error inserting gallery:', err.message);
            }
            console.log(`Gallery "${picture.pimgURL}" inserted into the database with ID ${this.lastID}`);
        });
    });
}